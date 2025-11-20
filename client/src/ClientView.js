import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { socket } from "./socket";
export default function ClientView() {
    const [code, setCode] = useState("");
    const [gameId, setGameId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [question, setQuestion] = useState(null);
    const userId = React.useMemo(() => "user-" + Math.floor(Math.random() * 100000), []);
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
        if (!code)
            return alert("Enter game code");
        socket.emit("joinGame", { code, userId, name }, (res) => {
            if (res?.ok)
                setGameId(res.gameId);
            else
                alert(res?.error || "Join failed");
        });
    };
    const submit = (index) => {
        if (!gameId)
            return;
        socket.emit("submitAnswer", { gameId, userId, answerIndex: index }, (res) => {
            if (res?.error)
                alert(res.error);
            else
                console.log("submitted", res);
        });
    };
    return (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h2", { children: "Quiz Client (Test)" }), _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("input", { placeholder: "Game code", value: code, onChange: (e) => setCode(e.target.value) }), _jsx("button", { onClick: join, style: { marginLeft: 8 }, children: "Join" })] }), _jsx("h3", { children: "Players" }), _jsx("ul", { children: players.map((p) => (_jsxs("li", { children: [p.name, " \u2014 ", p.score ?? 0] }, p.userId || p.name))) }), question ? (_jsxs("div", { children: [_jsx("h4", { children: question.text }), _jsx("div", { children: question.options.map((opt, i) => (_jsx("button", { onClick: () => submit(i), style: { display: "block", margin: 6 }, children: opt }, i))) })] })) : (_jsx("div", { children: "No question \u2014 waiting" }))] }));
}
