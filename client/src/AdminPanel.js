import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// (paste the AdminPanel.tsx component here)
import { useEffect, useState } from "react";
import { socket } from "./socket"; // Make sure client/src/socket.ts exists
export default function AdminPanel() {
    const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const HOST_ID = "apnaadda"; // Only ApnaAdda games
    const [questions, setQuestions] = useState([]);
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [qText, setQText] = useState("");
    const [qOptions, setQOptions] = useState("");
    const [qCorrectIndex, setQCorrectIndex] = useState(0);
    const [qTimeLimit, setQTimeLimit] = useState(15);
    // Fetch games for ApnaAdda host
    const fetchGames = async () => {
        try {
            const url = `${API}/api/games?host=${HOST_ID}`;
            const res = await fetch(url);
            const data = await res.json();
            setGames(data || []);
        }
        catch (err) {
            console.error("fetchGames error", err);
        }
    };
    useEffect(() => {
        fetchGames();
        socket.on("playersUpdate", (pls) => {
            if (selectedGame)
                setPlayers(pls);
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
        if (!qText || opts.length < 2)
            return alert("Enter question and at least 2 options");
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
        }
        catch (err) {
            console.error(err);
            alert("Failed to create question");
        }
        finally {
            setLoading(false);
        }
    };
    // Create game
    const createGame = async () => {
        if (questions.length === 0)
            return alert("Create at least one question");
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
            const game = await res.json();
            setGames((prev) => [game, ...prev]);
            alert(`Game created! Code: ${game.code}`);
        }
        catch (err) {
            console.error(err);
            alert("Game creation failed");
        }
        finally {
            setLoading(false);
        }
    };
    const startGame = (gameId) => {
        if (!gameId && !selectedGame)
            return alert("Select a game");
        socket.emit("startGame", { gameId: gameId || selectedGame._id }, (res) => {
            if (res?.error)
                alert(res.error);
            else
                alert("Game started!");
        });
    };
    const nextQuestion = (gameId) => {
        if (!gameId && !selectedGame)
            return alert("Select a game");
        socket.emit("nextQuestion", { gameId: gameId || selectedGame._id }, (res) => {
            if (res?.error)
                alert(res.error);
            else
                alert("Next question sent!");
        });
    };
    const selectGame = async (g) => {
        setSelectedGame(g);
        socket.emit("adminJoin", { gameId: g._id }, () => { });
        const res = await fetch(`${API}/api/games/${g._id}`);
        const fullGame = await res.json();
        setPlayers(fullGame.players || []);
    };
    const deleteGame = async (id) => {
        if (!confirm("Delete this game?"))
            return;
        await fetch(`${API}/api/games/${id}`, { method: "DELETE" });
        setGames((prev) => prev.filter((g) => g._id !== id));
        if (selectedGame?._id === id)
            setSelectedGame(null);
    };
    return (_jsxs("div", { style: { padding: 20, maxWidth: 900 }, children: [_jsx("h2", { children: "Admin Panel \u2014 ApnaAdda" }), _jsxs("div", { style: { display: "flex", gap: 30 }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { children: "Create Question" }), _jsx("input", { style: { width: "100%", marginBottom: 10 }, placeholder: "Question text", value: qText, onChange: (e) => setQText(e.target.value) }), _jsx("input", { style: { width: "100%", marginBottom: 10 }, placeholder: "Options (comma separated)", value: qOptions, onChange: (e) => setQOptions(e.target.value) }), _jsxs("div", { style: { display: "flex", gap: 10 }, children: [_jsxs("div", { children: [_jsx("label", { children: "Correct Index" }), _jsx("input", { type: "number", min: 0, value: qCorrectIndex, onChange: (e) => setQCorrectIndex(parseInt(e.target.value)) })] }), _jsxs("div", { children: [_jsx("label", { children: "Time Limit (sec)" }), _jsx("input", { type: "number", min: 5, value: qTimeLimit, onChange: (e) => setQTimeLimit(parseInt(e.target.value)) })] })] }), _jsx("br", {}), _jsx("button", { onClick: createQuestion, disabled: loading, children: "Create Question" }), _jsx("button", { onClick: createGame, style: { marginLeft: 10 }, disabled: loading, children: "Create Game" }), _jsx("h4", { style: { marginTop: 20 }, children: "Questions Added" }), _jsx("ul", { children: questions.map((q, i) => (_jsx("li", { children: q.text }, i))) })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { children: "Games" }), _jsx("button", { onClick: fetchGames, children: "Refresh" }), _jsx("div", { style: { maxHeight: 300, overflowY: "auto", marginTop: 10 }, children: games.map((g) => (_jsxs("div", { style: { padding: 10, borderBottom: "1px solid #eee" }, children: [_jsx("strong", { children: "Code:" }), " ", g.code, " ", _jsxs("small", { children: ["(", g.status, ")"] }), _jsxs("div", { style: { marginTop: 5 }, children: [_jsx("button", { onClick: () => selectGame(g), children: "Select" }), _jsx("button", { onClick: () => startGame(g._id), style: { marginLeft: 10 }, children: "Start" }), _jsx("button", { onClick: () => nextQuestion(g._id), style: { marginLeft: 10 }, children: "Next" }), _jsx("button", { onClick: () => deleteGame(g._id), style: { marginLeft: 10, color: "red" }, children: "Delete" })] })] }, g._id))) }), _jsxs("div", { style: { marginTop: 20 }, children: [_jsx("h4", { children: "Players in Game" }), selectedGame ? (_jsxs("ul", { children: [(players ?? []).length === 0 && _jsx("li", { children: "No players yet" }), (players ?? []).map(p => (_jsxs("li", { children: [p.name, " \u2014 ", p.score ?? 0] }, p.userId ?? p.name)))] })) : (_jsx("p", { children: "Select a game to view players" }))] })] })] })] }));
}
