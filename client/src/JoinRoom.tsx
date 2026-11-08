import React, { useEffect, useState } from "react";
import { socket } from "./socket";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

type RoomState = {
  roomId?: string;
  code?: string;
  name?: string;
  gameKey?: string;
  maxPlayers?: number;
  players?: Array<{ userId?: string; name?: string }>;
  status?: string;
};

export default function JoinRoom() {
  const [code, setCode] = useState("");
  const [room, setRoom] = useState<RoomState | null>(null);

  const userId = React.useMemo(
    () => "user-" + Math.floor(Math.random() * 100000),
    []
  );
  const name = "Player" + userId.slice(-4);

  useEffect(() => {
  // live updates
  socket.on("roomUpdate", (payload: any) => {
    setRoom({
      roomId: payload.roomId,
      code: payload.code,
      name: payload.name,
      gameKey: payload.gameKey,
      maxPlayers: payload.maxPlayers,
      players: payload.players,
      status: payload.status,
    });
  });

  // when host starts room → redirect everyone to real game
  socket.on("roomStarted", ({ roomId, gameKey, code }) => {
    console.log("Room started:", roomId, gameKey, code);

    // 👇 map ApnaAdda game keys → local URLs
    const GAME_URLS: Record<string, string> = {
      "atlas-games": "http://localhost:5174/",             // or "http://localhost:5174/atlas"
      "mr-white": "http://localhost:5174/",                // update to your route later
      "who-am-i": "http://localhost:5174/",
      "spy-game": "http://localhost:5174/",
      "dumb-charades": "http://localhost:5174/",
      "hollywood-bollywood": "http://localhost:5174/",
    };

    const url = GAME_URLS[gameKey] || "http://localhost:5174/";

    // send ALL players in that room to ApnaAdda
    window.location.href = url + `?room=${code}&game=${gameKey}`;
    //  ^ adding ?room & ?game so later ApnaAdda can read which room/game
  });

  return () => {
    socket.off("roomUpdate");
    socket.off("roomStarted");
  };
}, []);


  const join = () => {
    if (!code.trim()) {
      alert("Enter room code");
      return;
    }

    socket.emit(
      "joinRoom",
      { code, userId, name },
      (res: any) => {
        if (res?.error) {
          alert(res.error);
        } else {
          // roomUpdate event will fill the room state
          // optionally also fetch REST data:
          fetch(`${API}/api/rooms/code/${code}`)
            .then((r) => r.json())
            .then((data) => setRoom(data))
            .catch((err) => console.error(err));
        }
      }
    );
  };

  const startGame = () => {
    if (!room?.roomId) {
      alert("Room data missing");
      return;
    }

    socket.emit("startRoom", { roomId: room.roomId }, (res: any) => {
      if (res?.error) {
        alert(res.error);
      } else {
        console.log("Start signal sent");
        // redirect happens when we receive roomStarted
      }
    });
  };

  return (
    <div className="page-wrapper">
      <h2>Join Room</h2>

      <div>
        <label>Room Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code..."
        />
        <button onClick={join}>Join</button>
      </div>

      {room && (
        <div style={{ marginTop: 24 }}>
          <h3>{room.name}</h3>
          <p>
            Game: {room.gameKey} | Code: {room.code} | Max: {room.maxPlayers}
          </p>

          <h4>Players</h4>
          <ul>
            {(room.players || []).map((p) => (
              <li key={p.userId || p.name}>{p.name}</li>
            ))}
          </ul>

          {/* ✅ Show Start Game button when enough players and room not active */}
          {(room.players || []).length >= 2 && room.status !== "active" && (
            <button
              onClick={startGame}
              style={{
                marginTop: 12,
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                background: "#10B981",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}
