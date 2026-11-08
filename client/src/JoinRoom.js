import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { socket } from "./socket";
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
export default function JoinRoom() {
    const [code, setCode] = useState("");
    const [room, setRoom] = useState(null);
    const userId = React.useMemo(() => "user-" + Math.floor(Math.random() * 100000), []);
    const name = "Player" + userId.slice(-4);
    useEffect(() => {
        // live updates
        socket.on("roomUpdate", (payload) => {
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
            const GAME_URLS = {
                "atlas-games": "http://localhost:5174/", // or "http://localhost:5174/atlas"
                "mr-white": "http://localhost:5174/", // update to your route later
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
        socket.emit("joinRoom", { code, userId, name }, (res) => {
            if (res?.error) {
                alert(res.error);
            }
            else {
                // roomUpdate event will fill the room state
                // optionally also fetch REST data:
                fetch(`${API}/api/rooms/code/${code}`)
                    .then((r) => r.json())
                    .then((data) => setRoom(data))
                    .catch((err) => console.error(err));
            }
        });
    };
    const startGame = () => {
        if (!room?.roomId) {
            alert("Room data missing");
            return;
        }
        socket.emit("startRoom", { roomId: room.roomId }, (res) => {
            if (res?.error) {
                alert(res.error);
            }
            else {
                console.log("Start signal sent");
                // redirect happens when we receive roomStarted
            }
        });
    };
    return (_jsxs("div", { className: "page-wrapper", children: [_jsx("h2", { children: "Join Room" }), _jsxs("div", { children: [_jsx("label", { children: "Room Code" }), _jsx("input", { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: "Enter code..." }), _jsx("button", { onClick: join, children: "Join" })] }), room && (_jsxs("div", { style: { marginTop: 24 }, children: [_jsx("h3", { children: room.name }), _jsxs("p", { children: ["Game: ", room.gameKey, " | Code: ", room.code, " | Max: ", room.maxPlayers] }), _jsx("h4", { children: "Players" }), _jsx("ul", { children: (room.players || []).map((p) => (_jsx("li", { children: p.name }, p.userId || p.name))) }), (room.players || []).length >= 2 && room.status !== "active" && (_jsx("button", { onClick: startGame, style: {
                            marginTop: 12,
                            padding: "10px 18px",
                            borderRadius: 999,
                            border: "none",
                            background: "#10B981",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                        }, children: "Start Game" }))] }))] }));
}
