import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// src/components/AdminPanelMultiplayer.tsx
import React, { useEffect, useState } from "react";
import { socket } from "../socket";

type Player = { userId?: string; name?: string; score?: number };
type Game = {
  _id: string;
  code: string;
  hostId?: string;
  players?: Player[] | null;
  status?: string;
};

export default function AdminPanelMultiplayer({ onBack }: { onBack?: () => void }) {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API}/api/games`);
      const data = await res.json();
      setGames(data || []);
    } catch (err) {
      console.error("fetchGames error", err);
    }
  };

  useEffect(() => {
    fetchGames();

    socket.on("playersUpdate", (pls: Player[]) => {
      // backend emits playersUpdate targeted; update players if selected
      setPlayers(pls || []);
    });

    socket.on("gameFinished", ({ players: pls }: { players?: Player[] }) => {
      setPlayers(pls || []);
      setSelectedGame(null);
      fetchGames();
    });

    socket.on("question", (q: any) => {
      console.log("Question event (admin view):", q);
    });

    return () => {
      socket.off("playersUpdate");
      socket.off("gameFinished");
      socket.off("question");
    };
  }, []);

  const selectGame = async (g: Game) => {
    setSelectedGame(g);
    socket.emit("adminJoin", { gameId: g._id }, () => {});
    try {
      const res = await fetch(`${API}/api/games/${g._id}`);
      const full = await res.json();
      setPlayers(full.players || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startGame = (gameId?: string) => {
    if (!gameId && !selectedGame) return alert("Select a game");
    socket.emit("startGame", { gameId: gameId || selectedGame!._id }, (res:any) => {
      if (res?.error) alert(res.error); else fetchGames();
    });
  };

  const nextQuestion = (gameId?: string) => {
    if (!gameId && !selectedGame) return alert("Select a game");
    socket.emit("nextQuestion", { gameId: gameId || selectedGame!._id }, (res:any) => {
      if (res?.error) alert(res.error);
    });
  };

  const deleteGame = async (id: string) => {
    if (!confirm("Delete this game?")) return;
    try {
      await fetch(`${API}/api/games/${id}`, { method: "DELETE" });
      setGames(prev => prev.filter(g => g._id !== id));
      if (selectedGame?._id === id) setSelectedGame(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete game");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Multiplayer — Admin (Players)</h2>
        <div>
          {onBack && (
            <button onClick={onBack} style={{ marginRight: 8 }}>
              Back
            </button>
          )}
          <button onClick={fetchGames}>Refresh</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <h4>Games</h4>
          <div style={{ maxHeight: 420, overflowY: "auto", border: "1px solid #eee", padding: 8 }}>
            {games.map(g => (
              <div key={g._id} style={{ padding: 8, borderBottom: "1px solid #f4f4f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div><strong>{g.code}</strong> <small>({g.status})</small></div>
                  <div style={{ fontSize: 12, color: "#666" }}>{(g.players || []).length} players</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => selectGame(g)}>Select</button>
                  <button onClick={() => startGame(g._id)}>Start</button>
                  <button onClick={() => nextQuestion(g._id)}>Next</button>
                  <button onClick={() => deleteGame(g._id)} style={{ color: "red" }}>Delete</button>
                </div>
              </div>
            ))}
            {games.length === 0 && <div>No games</div>}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h4>Players in selected game</h4>
          {selectedGame ? (
            <div style={{ border: "1px solid #eee", padding: 12, minHeight: 160 }}>
              <div><strong>Game:</strong> {selectedGame.code}</div>
              <div style={{ marginTop: 8 }}>
                {(players || []).length === 0 ? <div>No players yet</div> : (
                  <ul>
                    {(players||[]).map(p => <li key={p.userId ?? p.name}>{p.name} — {p.score ?? 0}</li>)}
                  </ul>
                )}
              </div>
              <div style={{ marginTop: 12 }}>
                <button onClick={() => startGame()}>Start</button>
                <button onClick={() => nextQuestion()} style={{ marginLeft: 8 }}>Next</button>
              </div>
            </div>
          ) : <div>Select a game to view players</div>}
        </div>
      </div>
    </div>
  );
}

