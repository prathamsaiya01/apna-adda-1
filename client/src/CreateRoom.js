import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export default function CreateRoom() {
    const [roomName, setRoomName] = useState("");
    const [gameKey, setGameKey] = useState("atlas-games");
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [creating, setCreating] = useState(false);
    const [createdCode, setCreatedCode] = useState(null);
    // TODO: replace with real logged-in user id later
    const hostId = React.useMemo(() => "host-" + Math.floor(Math.random() * 100000), []);
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
            }
            else {
                setCreatedCode(data.code); // room code from backend
            }
        }
        catch (err) {
            console.error("create room error", err);
            alert("Failed to create room. Please try again.");
        }
        finally {
            setCreating(false);
        }
    };
    return (_jsx("div", { style: {
            minHeight: "100vh",
            background: "linear-gradient(135deg,#e9fff4,#f8fffb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
        }, children: _jsxs("div", { style: {
                width: "100%",
                maxWidth: 640,
                background: "#fff",
                borderRadius: 24,
                boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
                padding: "32px 40px",
            }, children: [_jsxs("div", { style: { textAlign: "center", marginBottom: 24 }, children: [_jsx("div", { style: {
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
                            }, children: "\u2699\uFE0F" }), _jsx("h2", { style: { margin: 0, fontSize: 26, fontWeight: 700 }, children: "Create New Room" }), _jsx("p", { style: { marginTop: 8, color: "#6B7280" }, children: "Set up your game room and invite friends to join" })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                                display: "block",
                                marginBottom: 6,
                                fontWeight: 600,
                                color: "#374151",
                            }, children: "Room Name" }), _jsx("input", { value: roomName, onChange: (e) => setRoomName(e.target.value), placeholder: "Enter room name...", style: {
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #D1D5DB",
                                outline: "none",
                                fontSize: 14,
                            } })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                                display: "block",
                                marginBottom: 6,
                                fontWeight: 600,
                                color: "#374151",
                            }, children: "Select Game" }), _jsx("select", { value: gameKey, onChange: (e) => setGameKey(e.target.value), style: {
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #10B981",
                                outline: "none",
                                fontSize: 14,
                            }, children: GAMES.map((g) => (_jsx("option", { value: g.key, children: g.label }, g.key))) })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: {
                                display: "block",
                                marginBottom: 6,
                                fontWeight: 600,
                                color: "#374151",
                            }, children: "Maximum Players" }), _jsxs("select", { value: maxPlayers, onChange: (e) => setMaxPlayers(parseInt(e.target.value)), style: {
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #D1D5DB",
                                outline: "none",
                                fontSize: 14,
                            }, children: [_jsx("option", { value: 2, children: "2 Players" }), _jsx("option", { value: 4, children: "4 Players" }), _jsx("option", { value: 6, children: "6 Players" }), _jsx("option", { value: 8, children: "8 Players" })] })] }), _jsx("button", { onClick: createRoom, disabled: creating, style: {
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
                    }, children: creating ? "Creating..." : "Create Room" }), createdCode && (_jsxs("div", { style: {
                        marginTop: 18,
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "#ECFDF5",
                        color: "#065F46",
                        fontSize: 14,
                    }, children: ["\u2705 Room created! Share this code with your friends:", " ", _jsx("strong", { children: createdCode })] }))] }) }));
}
