import { useEffect, useState } from "react";
import { socket } from "./socket"; // Make sure client/src/socket.ts exists


type Question = {
  _id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec?: number;
};

type Game = {
  _id: string;
  code: string;
  hostId?: string;
 players?: Array<{ userId?: string; name?: string; score?: number }> | null;

  status?: string;
};

export default function AdminPanel() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const HOST_ID = "apnaadda"; // Only ApnaAdda games

  const [questions, setQuestions] = useState<Question[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Game["players"]>([]);
  const [loading, setLoading] = useState(false);

  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState<string>("");
  const [qCorrectIndex, setQCorrectIndex] = useState<number>(0);
  const [qTimeLimit, setQTimeLimit] = useState<number>(15);

  // Fetch games for ApnaAdda host
  const fetchGames = async () => {
    try {
      const url = `${API}/api/games?host=${HOST_ID}`;
      const res = await fetch(url);
      const data = await res.json();
      setGames(data || []);
    } catch (err) {
      console.error("fetchGames error", err);
    }
  };

  useEffect(() => {
    fetchGames();

    socket.on("playersUpdate", (pls) => {
      if (selectedGame) setPlayers(pls);
    });

    socket.on("question", (q) => {
      console.log("Question:", q);
    });

    socket.on("gameFinished", ({ players }) => {
      console.log("Game finished");
      setPlayers(players);
      setSelectedGame(null);
      fetchGames();
    });

    return () => {
      socket.off("playersUpdate");
      socket.off("question");
      socket.off("gameFinished");
    };
  }, [selectedGame]);

  // Create question
  const createQuestion = async () => {
    const opts = qOptions.split(",").map((x) => x.trim()).filter(Boolean);
    if (!qText || opts.length < 2) return alert("Enter question and at least 2 options");

    setLoading(true);
    try {
      const body = {
        text: qText,
        options: opts,
        correctIndex: qCorrectIndex,
        timeLimitSec: qTimeLimit,
      };

      const res = await fetch(`${API}/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const q = await res.json();
      setQuestions((prev) => [...prev, q]);

      setQText("");
      setQOptions("");
      setQCorrectIndex(0);
      setQTimeLimit(15);
    } catch (err) {
      console.error(err);
      alert("Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  // Create game
  const createGame = async () => {
    if (questions.length === 0) return alert("Create at least one question");

    setLoading(true);
    try {
      const questionIds = questions.map((q) => q._id).filter(Boolean);

      const res = await fetch(`${API}/api/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: HOST_ID,
          questionIds,
        }),
      });

      const game: Game = await res.json();
      setGames((prev) => [game, ...prev]);

      alert(`Game created! Code: ${game.code}`);
    } catch (err) {
      console.error(err);
      alert("Game creation failed");
    } finally {
      setLoading(false);
    }
  };

  const startGame = (gameId?: string) => {
    if (!gameId && !selectedGame) return alert("Select a game");

    socket.emit("startGame", { gameId: gameId || selectedGame!._id }, (res: any) => {
      if (res?.error) alert(res.error);
      else alert("Game started!");
    });
  };

  const nextQuestion = (gameId?: string) => {
    if (!gameId && !selectedGame) return alert("Select a game");

    socket.emit("nextQuestion", { gameId: gameId || selectedGame!._id }, (res: any) => {
      if (res?.error) alert(res.error);
      else alert("Next question sent!");
    });
  };

  const selectGame = async (g: Game) => {
    setSelectedGame(g);
    socket.emit("adminJoin", { gameId: g._id }, () => {});

    const res = await fetch(`${API}/api/games/${g._id}`);
    const fullGame = await res.json();
    setPlayers(fullGame.players || []);
  };

  const deleteGame = async (id: string) => {
    if (!confirm("Delete this game?")) return;

    await fetch(`${API}/api/games/${id}`, { method: "DELETE" });
    setGames((prev) => prev.filter((g) => g._id !== id));
    if (selectedGame?._id === id) setSelectedGame(null);
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>Admin Panel — ApnaAdda</h2>

      <div style={{ display: "flex", gap: 30 }}>

        {/* LEFT SIDE — Question Creator */}
        <div style={{ flex: 1 }}>
          <h3>Create Question</h3>

          <input
            style={{ width: "100%", marginBottom: 10 }}
            placeholder="Question text"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />

          <input
            style={{ width: "100%", marginBottom: 10 }}
            placeholder="Options (comma separated)"
            value={qOptions}
            onChange={(e) => setQOptions(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <div>
              <label>Correct Index</label>
              <input
                type="number"
                min={0}
                value={qCorrectIndex}
                onChange={(e) => setQCorrectIndex(parseInt(e.target.value))}
              />
            </div>

            <div>
              <label>Time Limit (sec)</label>
              <input
                type="number"
                min={5}
                value={qTimeLimit}
                onChange={(e) => setQTimeLimit(parseInt(e.target.value))}
              />
            </div>
          </div>

          <br />
          <button onClick={createQuestion} disabled={loading}>Create Question</button>
          <button onClick={createGame} style={{ marginLeft: 10 }} disabled={loading}>
            Create Game
          </button>

          <h4 style={{ marginTop: 20 }}>Questions Added</h4>
          <ul>
            {questions.map((q, i) => (
              <li key={i}>{q.text}</li>
            ))}
          </ul>
        </div>

        {/* RIGHT SIDE — Games */}
        <div style={{ flex: 1 }}>
          <h3>Games</h3>

          <button onClick={fetchGames}>Refresh</button>

          <div style={{ maxHeight: 300, overflowY: "auto", marginTop: 10 }}>
            {games.map((g) => (
              <div key={g._id} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                <strong>Code:</strong> {g.code} <small>({g.status})</small>

                <div style={{ marginTop: 5 }}>
                  <button onClick={() => selectGame(g)}>Select</button>
                  <button onClick={() => startGame(g._id)} style={{ marginLeft: 10 }}>Start</button>
                  <button onClick={() => nextQuestion(g._id)} style={{ marginLeft: 10 }}>Next</button>
                  <button onClick={() => deleteGame(g._id)} style={{ marginLeft: 10, color: "red" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Game Player List */}
          <div style={{ marginTop: 20 }}>
            <h4>Players in Game</h4>
            {selectedGame ? (
              <ul>
              {(players ?? []).length === 0 && <li>No players yet</li>}

               {(players ?? []).map(p => (
  <li key={p.userId ?? p.name}>
    {p.name} — {p.score ?? 0}
  </li>
))}


              </ul>
            ) : (
              <p>Select a game to view players</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
