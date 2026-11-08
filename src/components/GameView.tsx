// src/components/GameView.tsx
import React, { useEffect, useState } from "react";
import { socket } from "../socket";

type Props = {
  roomId: string;      // must be the server _id returned by /api/rooms or joinRoom callback
  gameKey: string;
  username: string;
};

const GameView: React.FC<Props> = ({ roomId, gameKey, username }) => {
  const [players, setPlayers] = useState<Array<{ userId: string; name: string; score?: number }>>([]);
  const [joined, setJoined] = useState(false);

  // persisted userId (same pattern as RoomSystem)
  const userId = (() => {
    const existing = localStorage.getItem("addaUserId");
    if (existing) return existing;
    const id = "user-" + Math.floor(Math.random() * 1000000);
    localStorage.setItem("addaUserId", id);
    return id;
  })();

  useEffect(() => {
    if (!roomId) return;

    // 1) Join the game channel (idempotent if already joined)
    socket.emit("joinGame", { roomId, userId }, (res: any) => {
      if (res?.error) {
        console.warn("joinGame failed:", res);
      } else {
        console.log("joined game channel", roomId, socket.id);
        setJoined(true);
      }
    });

    // 2) Listen for players updates and roomStarted (in-case host starts)
    const onPlayersUpdate = (pl: any[]) => {
      console.log("playersUpdate (game):", pl);
      setPlayers(pl || []);
    };
    const onRoomStarted = (payload: any) => {
      console.log("roomStarted in game view:", payload);
      // payload: { roomId, gameKey, code }
      // You might start the round, set UI state etc.
    };

    socket.on("playersUpdate", onPlayersUpdate);
    socket.on("roomStarted", onRoomStarted);

    // cleanup
    return () => {
      socket.off("playersUpdate", onPlayersUpdate);
      socket.off("roomStarted", onRoomStarted);
      // optional: we don't forcibly leave the socket.io room - server manages membership on disconnect
    };
  }, [roomId, userId]);

  const submitAnswer = (answer: string) => {
    socket.emit("submitAnswer", { roomId, userId, answer }, (res: any) => {
      if (res?.error) console.warn("submitAnswer failed", res);
      else console.log("submitted answer");
    });
  };

  return (
    <div className="p-4">
      <h3>Game: {gameKey} — Room: {roomId}</h3>
      <p>Connected socket id: {socket.id} | joined game channel: {joined ? "yes" : "no"}</p>
      <h4>Players</h4>
      <ul>
        {players.map(p => <li key={p.userId}>{p.name} — {p.score ?? 0}</li>)}
      </ul>
      <div className="mt-4">
        <input placeholder="type an answer" id="answerInput" />
        <button onClick={() => {
          const el = document.getElementById("answerInput") as HTMLInputElement | null;
          if (!el) return;
          submitAnswer(el.value);
          el.value = "";
        }}>Submit</button>
      </div>
    </div>
  );
};

export default GameView;
