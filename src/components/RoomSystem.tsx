import { Wifi, PlusCircle, LogIn, Users } from "lucide-react";
import { socket } from "../socket";


type RoomSystemProps = {
  onBack: () => void;
  username: string;
  onJoinGame: (roomId: string, gameKey: string) => void;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";


type Room = {
  roomId?: string; // from socket
  _id?: string; // from REST
  code: string;
  name: string;
  gameKey: string;
  maxPlayers: number;
  players: Array<{ userId: string; name: string }>;
  status?: string;
};

type GameOption = {
  key: string; // used as gameKey in backend
  label: string; // display name
};

const GAME_OPTIONS: GameOption[] = [
  { key: "CricketersAtlas", label: "Cricketers Atlas" },
  { key: "MrWhite", label: "Mr. White" },
  { key: "WhoAmI", label: "Who Am I?" },
  { key: "SpyGame", label: "Spy Game" },
  { key: "DumbCharades", label: "Dumb Charades" },
  { key: "HollywoodBollywoodGame", label: "Hollywood Bollywood" },
];

const RoomSystem: React.FC<RoomSystemProps> = ({
  onBack,
  username,
  onJoinGame,
}) => {
  const [view, setView] = useState<"home" | "create" | "join">("home");

  const [userId] = useState(
    () => "user-" + Math.floor(Math.random() * 100000)
  );

  const [roomName, setRoomName] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>(
    GAME_OPTIONS[0].key
  );
  const [maxPlayers, setMaxPlayers] = useState<number>(4);

  const [joinCode, setJoinCode] = useState("");

  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);

  // ----- Socket listeners -----
  useEffect(() => {
    socket.on("roomUpdate", (payload: any) => {
      setCurrentRoom({
        roomId: payload.roomId,
        code: payload.code,
        name: payload.name,
        gameKey: payload.gameKey,
        maxPlayers: payload.maxPlayers,
        players: payload.players || [],
        status: payload.status,
      });
    });

    socket.on(
      "roomStarted",
      ({ roomId, gameKey, code }: { roomId: string; gameKey: string; code: string }) => {
        console.log("roomStarted:", roomId, gameKey, code);
        // notify parent App.tsx → it will open the correct game component
        onJoinGame(roomId, gameKey);
      }
    );

    return () => {
      socket.off("roomUpdate");
      socket.off("roomStarted");
    };
  }, [onJoinGame]);

  // Helper: join room via socket
  const joinRoomByCode = (code: string) => {
    socket.emit(
      "joinRoom",
      { code, userId, name: username || "Player" },
      (res: any) => {
        if (res?.error) {
          alert(res.error);
        } else {
          console.log("Joined room", res);
          // roomUpdate will fill currentRoom
        }
      }
    );
  };

  // ----- Handlers -----

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      alert("Please enter your name on the main screen first.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: roomName || `${username}'s Room`,
        gameKey: selectedGame,
        maxPlayers,
        hostId: userId,
      };

      const res = await fetch(`${API}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create room");
      }

      const room = await res.json();
      setJoinCode(room.code); // show code
      // auto-join created room as host
      joinRoomByCode(room.code);
      setView("join");
    } catch (err: any) {
      console.error("create room error", err);
      alert(err.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = () => {
    if (!joinCode.trim()) {
      alert("Enter room code");
      return;
    }
    joinRoomByCode(joinCode.trim().toUpperCase());
  };

  const handleStartGame = () => {
    if (!currentRoom?.roomId) {
      alert("Room info missing");
      return;
    }

    socket.emit("startRoom", { roomId: currentRoom.roomId }, (res: any) => {
      if (res?.error) {
        alert(res.error);
      } else {
        console.log("StartRoom sent");
        // roomStarted event will trigger onJoinGame and navigate
      }
    });
  };

  // Host is considered the first player who joined
  const isHost =
    currentRoom?.players &&
    currentRoom.players.length > 0 &&
    currentRoom.players[0].userId === userId;

  // ----- UI -----

  const renderHome = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition"
        >
          ← Back to Games
        </button>
        <div className="flex items-center space-x-2 text-white/80">
          <Wifi className="w-5 h-5" />
          <span className="font-semibold">Multiplayer Rooms</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white text-center mb-2">
        Join or Create a Room
      </h2>
      <p className="text-slate-200 text-center mb-10">
        Create a private room for your friends or join an existing game using a
        room ID.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white/95 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center mr-3">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create Room</h3>
              <p className="text-sm text-slate-500">
                Start a new game room and invite friends
              </p>
            </div>
          </div>
          <button
            onClick={() => setView("create")}
            className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition"
          >
            Create New Room
          </button>
        </div>

        <div className="bg-white/95 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center mr-3">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Join Room</h3>
              <p className="text-sm text-slate-500">
                Enter a room ID to join an existing game
              </p>
            </div>
          </div>
          <button
            onClick={() => setView("join")}
            className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition"
          >
            Join Existing Room
          </button>
        </div>
      </div>

      <div className="bg-white/10 rounded-xl p-8 border border-white/10 text-center text-slate-200">
        <div className="flex justify-center mb-3">
          <Users className="w-8 h-8 text-slate-200" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Active Rooms</h3>
        <p className="text-sm text-slate-300">
          No active rooms at the moment. Create a room to get started!
        </p>
      </div>
    </>
  );

  const renderCreate = () => (
    <>
      <button
        onClick={() => setView("home")}
        className="mb-4 px-4 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-4">Create New Room</h2>

      <div className="bg-white/95 rounded-xl p-6 shadow-lg max-w-xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Room Name
          </label>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Pratham's Atlas Room"
            className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Select Game
          </label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            {GAME_OPTIONS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Maximum Players
          </label>
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value={2}>2 Players</option>
            <option value={4}>4 Players</option>
            <option value={6}>6 Players</option>
            <option value={8}>8 Players</option>
          </select>
        </div>

        <button
          disabled={loading}
          onClick={handleCreateRoom}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>
    </>
  );

  const renderJoin = () => (
    <>
      <button
        onClick={() => setView("home")}
        className="mb-4 px-4 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-4">Join Room</h2>

      <div className="bg-white/95 rounded-xl p-6 shadow-lg max-w-xl mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Room Code
        </label>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter room code"
          className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500 outline-none mb-3"
        />
        <button
          onClick={handleJoinSubmit}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition"
        >
          Join
        </button>
      </div>

      {currentRoom && (
        <div className="bg-white/95 rounded-xl p-6 shadow-lg max-w-xl">
          <h3 className="text-xl font-semibold text-slate-900 mb-1">
            {currentRoom.name}
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Game: {currentRoom.gameKey} • Code:{" "}
            <span className="font-mono">{currentRoom.code}</span> • Max:{" "}
            {currentRoom.maxPlayers}
          </p>

          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Players
          </h4>
          <ul className="list-disc list-inside text-slate-700 mb-3">
            {currentRoom.players.map((p) => (
              <li key={p.userId}>{p.name}</li>
            ))}
          </ul>

          {isHost &&
            currentRoom.players.length >= 2 &&
            currentRoom.status !== "active" && (
              <button
                onClick={handleStartGame}
                className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
              >
                Start Game
              </button>
            )}

          {!isHost && currentRoom.status !== "active" && (
            <p className="text-sm text-slate-500 mt-2 text-center">
              Waiting for host to start the game…
            </p>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {view === "home" && renderHome()}
        {view === "create" && renderCreate()}
        {view === "join" && renderJoin()}
      </div>
    </div>
  );
};

export default RoomSystem;
