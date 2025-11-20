import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const GAMES = [
  { key: "atlas-games", label: "Atlas Games" },
  { key: "mr-white", label: "Mr. White" },
  { key: "who-am-i", label: "Who Am I?" },
  { key: "spy-game", label: "Spy Game" },
  { key: "dumb-charades", label: "Dumb Charades" },
  { key: "hollywood-bollywood", label: "Hollywood Bollywood" },
];

type GameKey = (typeof GAMES)[number]["key"];

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [gameKey, setGameKey] = useState<GameKey>("atlas-games");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // TODO: replace with real logged-in user id later
  const hostId = React.useMemo(
    () => "host-" + Math.floor(Math.random() * 100000),
    []
  );

  const createRoom = async () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }

    setCreating(true);
    setCreatedCode(null);

    try {
      const res = await fetch(`${API}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName.trim(),
          gameKey,
          maxPlayers,
          hostId,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        setCreatedCode(data.code); // room code from backend
      }
    } catch (err) {
      console.error("create room error", err);
      alert("Failed to create room. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#e9fff4,#f8fffb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
          padding: "32px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 28,
              color: "#fff",
            }}
          >
            ⚙️
          </div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
            Create New Room
          </h2>
          <p style={{ marginTop: 8, color: "#6B7280" }}>
            Set up your game room and invite friends to join
          </p>
        </div>

        {/* Room name */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Room Name
          </label>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name..."
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #D1D5DB",
              outline: "none",
              fontSize: 14,
            }}
          />
        </div>

        {/* Select game */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Select Game
          </label>
          <select
            value={gameKey}
            onChange={(e) => setGameKey(e.target.value as GameKey)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #10B981",
              outline: "none",
              fontSize: 14,
            }}
          >
            {GAMES.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max players */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Maximum Players
          </label>
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #D1D5DB",
              outline: "none",
              fontSize: 14,
            }}
          >
            <option value={2}>2 Players</option>
            <option value={4}>4 Players</option>
            <option value={6}>6 Players</option>
            <option value={8}>8 Players</option>
          </select>
        </div>

        {/* Create button */}
        <button
          onClick={createRoom}
          disabled={creating}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 999,
            border: "none",
            fontWeight: 600,
            fontSize: 15,
            background: creating ? "#6EE7B7" : "#10B981",
            color: "#fff",
            cursor: creating ? "default" : "pointer",
            transition: "background 0.15s ease",
          }}
        >
          {creating ? "Creating..." : "Create Room"}
        </button>

        {/* Success message */}
        {createdCode && (
          <div
            style={{
              marginTop: 18,
              padding: "10px 12px",
              borderRadius: 12,
              background: "#ECFDF5",
              color: "#065F46",
              fontSize: 14,
            }}
          >
            ✅ Room created! Share this code with your friends:{" "}
            <strong>{createdCode}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
