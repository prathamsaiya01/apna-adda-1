import React, { useState } from "react";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import ClientView from "./ClientView";   // quiz client (if you still want it)
import AdminPanel from "./AdminPanel";   // quiz admin

type View = "create" | "join" | "quizClient" | "admin";

export default function App() {
  const [view, setView] = useState<View>("create");

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setView("create")}>Create Room</button>
        <button onClick={() => setView("join")} style={{ marginLeft: 8 }}>
          Join Room
        </button>
        <button onClick={() => setView("quizClient")} style={{ marginLeft: 8 }}>
          Quiz Client
        </button>
        <button onClick={() => setView("admin")} style={{ marginLeft: 8 }}>
          Quiz Admin
        </button>
      </div>

      {view === "create" && <CreateRoom />}
      {view === "join" && <JoinRoom />}
      {view === "quizClient" && <ClientView />}
      {view === "admin" && <AdminPanel />}
    </div>
  );
}
