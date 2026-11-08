import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import ClientView from "./ClientView"; // quiz client (if you still want it)
import AdminPanel from "./AdminPanel"; // quiz admin
export default function App() {
    const [view, setView] = useState("create");
    return (_jsxs("div", { style: { padding: 20 }, children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("button", { onClick: () => setView("create"), children: "Create Room" }), _jsx("button", { onClick: () => setView("join"), style: { marginLeft: 8 }, children: "Join Room" }), _jsx("button", { onClick: () => setView("quizClient"), style: { marginLeft: 8 }, children: "Quiz Client" }), _jsx("button", { onClick: () => setView("admin"), style: { marginLeft: 8 }, children: "Quiz Admin" })] }), view === "create" && _jsx(CreateRoom, {}), view === "join" && _jsx(JoinRoom, {}), view === "quizClient" && _jsx(ClientView, {}), view === "admin" && _jsx(AdminPanel, {})] }));
}
