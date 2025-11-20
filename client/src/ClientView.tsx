import React, { useEffect, useState } from "react";
import { socket } from "./socket";

export default function ClientView() {
  const [code, setCode] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [question, setQuestion] = useState<any | null>(null);

  const userId = React.useMemo(
    () => "user-" + Math.floor(Math.random() * 100000),
    []
  );
  const name = "Player" + userId.slice(-4);

  useEffect(() => {
    socket.on("playersUpdate", (pls) => setPlayers(pls));
    socket.on("question", (q) => setQuestion(q));
    socket.on("gameFinished", ({ players }) => {
      setPlayers(players);
      setQuestion(null);
      alert("Game finished!");
    });

    return () => {
      socket.off("playersUpdate");
      socket.off("question");
      socket.off("gameFinished");
    };
  }, []);

  const join = () => {
    if (!code) return alert("Enter game code");
    socket.emit("joinGame", { code, userId, name }, (res: any) => {
      if (res?.ok) setGameId(res.gameId);
      else alert(res?.error || "Join failed");
    });
  };

  const submit = (index: number) => {
    if (!gameId) return;
    socket.emit(
      "submitAnswer",
      { gameId, userId, answerIndex: index },
      (res: any) => {
        if (res?.error) alert(res.error);
        else console.log("submitted", res);
      }
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quiz Client (Test)</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Game code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={join} style={{ marginLeft: 8 }}>
          Join
        </button>
      </div>

      <h3>Players</h3>
      <ul>
        {players.map((p: any) => (
          <li key={p.userId || p.name}>
            {p.name} — {p.score ?? 0}
          </li>
        ))}
      </ul>

      {question ? (
        <div>
          <h4>{question.text}</h4>
          <div>
            {question.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => submit(i)}
                style={{ display: "block", margin: 6 }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>No question — waiting</div>
      )}
    </div>
  );
}
