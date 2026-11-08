// src/components/RoomSystem.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Wifi,
  PlusCircle,
  LogIn,
  Users,
  Copy,
  Check,
  Crown,
  Play,
  ArrowLeft,
  Share2,
  UserX,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { socket, getUserId, getApiUrl } from "../socket";

type RoomSystemProps = {
  onBack: () => void;
  username: string;
  onJoinGame: (roomId: string, gameKey: string) => void;
};

type RoomPlayer = {
  userId: string;
  name: string;
  score?: number;
  isReady?: boolean;
  isHost?: boolean;
  connected?: boolean;
};

type Room = {
  roomId?: string;
  _id: string;
  code: string;
  name: string;
  gameKey: string;
  maxPlayers: number;
  hostId: string;
  players: RoomPlayer[];
  status?: string;
};

const GAME_OPTIONS = [
  {
    key: "CricketersAtlas",
    label: "Cricketers Atlas",
    desc: "Alphabetical cricketer chain game",
    minPlayers: 2
  },
  {
    key: "MrWhite",
    label: "Mr. White",
    desc: "Find the impostor with the secret word",
    minPlayers: 3
  },
  {
    key: "WhoAmI",
    label: "Who Am I?",
    desc: "Guess the celebrity through Yes/No questions",
    minPlayers: 2
  },
  {
    key: "SpyGame",
    label: "Spy Game",
    desc: "Find the spy among your friends",
    minPlayers: 3
  },
  {
    key: "DumbCharades",
    label: "Dumb Charades",
    desc: "Act out Bollywood movies without speaking",
    minPlayers: 2
  },
  {
    key: "Mafia",
    label: "Mafia",
    desc: "Classic social deduction game (5-16 players)",
    minPlayers: 5
  },
  {
    key: "HollywoodBollywoodGame",
    label: "Hollywood Bollywood",
    desc: "Guess Actor, Actress, Movie & Song from initials",
    minPlayers: 2
  }
];

const RoomSystem: React.FC<RoomSystemProps> = ({ onBack, username, onJoinGame }) => {
  const [view, setView] = useState<"home" | "create" | "join" | "lobby">("home");
  const userId = getUserId();
  const API = getApiUrl();

  const [roomName, setRoomName] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>(GAME_OPTIONS[0].key);
  const [maxPlayers, setMaxPlayers] = useState<number>(6);
  const [joinCode, setJoinCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill code from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) {
      setJoinCode(roomParam.toUpperCase());
      setView("join");
    }
  }, []);

  // Fetch active rooms list
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/rooms`);
      if (!res.ok) return;
      const data = await res.json();
      setActiveRooms(data || []);
    } catch (err) {
      console.warn("fetchRooms error", err);
    }
  }, [API]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Socket event listeners
  useEffect(() => {
    const handleRoomUpdate = (payload: any) => {
      const updated: Room = {
        _id: payload.roomId || payload._id,
        roomId: payload.roomId || payload._id,
        code: payload.code,
        name: payload.name,
        gameKey: payload.gameKey,
        maxPlayers: payload.maxPlayers,
        hostId: payload.hostId,
        players: payload.players || [],
        status: payload.status
      };

      setCurrentRoom(prev => {
        // Only update currentRoom if we are in this room
        if (!prev || prev._id === updated._id || prev.code === updated.code) {
          return updated;
        }
        return prev;
      });

      // Update active rooms list
      setActiveRooms(prev => {
        const found = prev.find(r => r._id === updated._id);
        if (found) {
          return prev.map(r => (r._id === updated._id ? updated : r));
        }
        return [...prev, updated];
      });
    };

    const handleRoomStarted = ({ roomId, gameKey }: { roomId: string; gameKey: string }) => {
      // Proactively join game channel
      socket.emit("joinGame", { roomId, userId }, (res: any) => {
        if (res?.error) console.warn("joinGame callback error:", res.error);
      });
      // Navigate to game view in App.tsx
      onJoinGame(roomId, gameKey);
    };

    const handleKicked = ({ message }: { message?: string }) => {
      alert(message || "You were removed from the room.");
      setCurrentRoom(null);
      setView("home");
      fetchRooms();
    };

    socket.on("roomUpdate", handleRoomUpdate);
    socket.on("roomStarted", handleRoomStarted);
    socket.on("kickedFromRoom", handleKicked);

    return () => {
      socket.off("roomUpdate", handleRoomUpdate);
      socket.off("roomStarted", handleRoomStarted);
      socket.off("kickedFromRoom", handleKicked);
    };
  }, [userId, onJoinGame, fetchRooms]);

  const joinRoomByCode = (codeToJoin: string) => {
    setLoading(true);
    setErrorMessage(null);

    socket.emit(
      "joinRoom",
      {
        code: codeToJoin.trim().toUpperCase(),
        userId,
        name: username || "Player"
      },
      (res: any) => {
        setLoading(false);
        if (res?.error) {
          setErrorMessage(res.error);
        } else if (res?.room) {
          setCurrentRoom(res.room);
          setView("lobby");
        } else if (res?.roomId) {
          // Fallback fetch
          fetch(`${API}/api/rooms/${res.roomId}`)
            .then(r => r.json())
            .then(data => {
              setCurrentRoom(data);
              setView("lobby");
            })
            .catch(() => setView("lobby"));
        }
      }
    );
  };

  const handleCreateRoom = async () => {
    if (!username || !username.trim()) {
      alert("Please enter your name first!");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const body = {
        name: roomName.trim() || `${username}'s Adda`,
        gameKey: selectedGame,
        maxPlayers,
        hostId: userId,
        hostName: username
      };

      const res = await fetch(`${API}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create room");
      }

      const room = await res.json();
      setCurrentRoom(room);

      // Join room socket as host
      socket.emit(
        "joinRoom",
        {
          code: room.code,
          roomId: room._id,
          userId,
          name: username
        },
        (joinRes: any) => {
          setLoading(false);
          if (joinRes?.error) {
            setErrorMessage(joinRes.error);
          } else {
            setView("lobby");
          }
        }
      );
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || "Failed to create room");
    }
  };

  const handleToggleReady = () => {
    if (!currentRoom) return;
    socket.emit("toggleReady", { roomId: currentRoom._id, userId }, (res: any) => {
      if (res?.error) alert(res.error);
    });
  };

  const handleStartGame = () => {
    if (!currentRoom) return;
    socket.emit("startRoom", { roomId: currentRoom._id, userId }, (res: any) => {
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  const handleLeaveRoom = () => {
    if (!currentRoom) {
      setView("home");
      return;
    }
    socket.emit("leaveRoom", { roomId: currentRoom._id, userId }, () => {
      setCurrentRoom(null);
      setView("home");
      fetchRooms();
    });
  };

  const handleKickPlayer = (targetUserId: string) => {
    if (!currentRoom) return;
    if (confirm("Remove this player from the room?")) {
      socket.emit("kickPlayer", { roomId: currentRoom._id, userId, targetUserId }, (res: any) => {
        if (res?.error) alert(res.error);
      });
    }
  };

  const copyRoomCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const copyInviteLink = () => {
    if (!currentRoom) return;
    const url = `${window.location.origin}/?room=${currentRoom.code}&game=${currentRoom.gameKey}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isHost = currentRoom ? currentRoom.hostId === userId : false;
  const selectedGameInfo = GAME_OPTIONS.find(g => g.key === (currentRoom?.gameKey || selectedGame));
  const minRequired = selectedGameInfo?.minPlayers || 2;
  const currentCount = currentRoom?.players?.length || 0;
  const allOtherPlayersReady =
    currentRoom?.players?.filter(p => p.userId !== currentRoom.hostId).every(p => p.isReady) ?? true;
  const canStartGame = isHost && currentCount >= minRequired && allOtherPlayersReady;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (view === "lobby") {
                if (confirm("Leave this room?")) handleLeaveRoom();
              } else if (view !== "home") {
                setView("home");
                setErrorMessage(null);
              } else {
                onBack();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{view === "home" ? "Back to Games" : view === "lobby" ? "Leave Lobby" : "Back"}</span>
          </button>

          <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full border border-white/20">
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">Apna Adda Multiplayer</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center space-x-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* VIEW 1: HOME (Choice to Create or Join) */}
        {view === "home" && (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-white mb-3">Join or Create a Room</h2>
              <p className="text-slate-300 max-w-xl mx-auto">
                Party with your friends online! Create a room, share your 4-letter room code, and play your favorite
                party games together in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Create Card */}
              <div className="bg-white/95 text-slate-900 rounded-2xl p-6 shadow-xl border border-white/20 transform hover:-translate-y-1 transition duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center mr-4 shadow-md">
                    <PlusCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Create Room</h3>
                    <p className="text-sm text-slate-500">Pick a game, set rules, invite friends</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setView("create");
                    setErrorMessage(null);
                  }}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Create New Room
                </button>
              </div>

              {/* Join Card */}
              <div className="bg-white/95 text-slate-900 rounded-2xl p-6 shadow-xl border border-white/20 transform hover:-translate-y-1 transition duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-md">
                    <LogIn className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Join Room</h3>
                    <p className="text-sm text-slate-500">Enter a code to jump into a friend's room</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setView("join");
                    setErrorMessage(null);
                  }}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Join Existing Room
                </button>
              </div>
            </div>

            {/* Active Rooms */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-300" />
                  <h3 className="text-lg font-semibold text-white">Public & Active Rooms</h3>
                </div>
                <button
                  onClick={fetchRooms}
                  className="text-xs text-purple-300 hover:text-white transition underline"
                >
                  Refresh
                </button>
              </div>

              {activeRooms.length === 0 ? (
                <div className="text-center py-6 text-slate-300">
                  <p className="text-sm">No active rooms found right now.</p>
                  <p className="text-xs text-slate-400 mt-1">Be the first to create one!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeRooms.map(r => (
                    <div
                      key={r._id}
                      className="bg-white/5 hover:bg-white/15 p-4 rounded-xl border border-white/10 flex items-center justify-between transition"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-lg text-orange-400">{r.code}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white">
                            {r.gameKey}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{r.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {r.players?.length || 0} / {r.maxPlayers} players
                        </p>
                      </div>
                      <button
                        onClick={() => joinRoomByCode(r.code)}
                        className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold rounded-lg hover:shadow transition"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CREATE ROOM */}
        {view === "create" && (
          <div className="max-w-xl mx-auto bg-white/95 text-slate-900 rounded-2xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              <span>Create New Room</span>
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder={`e.g. ${username}'s Adda`}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Game</label>
                <select
                  value={selectedGame}
                  onChange={e => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white"
                >
                  {GAME_OPTIONS.map(g => (
                    <option key={g.key} value={g.key}>
                      {g.label} ({g.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Max Players</label>
                <select
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 bg-white"
                >
                  {[2, 4, 6, 8, 10, 12, 16, 20].map(n => (
                    <option key={n} value={n}>
                      {n} Players
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={loading}
                onClick={handleCreateRoom}
                className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60"
              >
                {loading ? "Creating Adda..." : "Create Room & Enter Lobby"}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: JOIN ROOM BY CODE */}
        {view === "join" && (
          <div className="max-w-md mx-auto bg-white/95 text-slate-900 rounded-2xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Join a Room</h2>
            <p className="text-sm text-slate-600 mb-6">Enter the 4-letter room code shared by the host.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCD"
                  className="w-full text-center tracking-widest text-3xl font-mono font-bold px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  onKeyDown={e => e.key === "Enter" && joinRoomByCode(joinCode)}
                />
              </div>

              <button
                disabled={loading || !joinCode.trim()}
                onClick={() => joinRoomByCode(joinCode)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Room"}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: ROOM LOBBY */}
        {view === "lobby" && currentRoom && (
          <div className="space-y-6">
            {/* Top Room Banner */}
            <div className="bg-white/95 text-slate-900 rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-black text-slate-900">{currentRoom.name}</h2>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                      {selectedGameInfo?.label || currentRoom.gameKey}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Max capacity: {currentRoom.maxPlayers} players • Min required: {minRequired} players
                  </p>
                </div>

                {/* Room Code & Share Controls */}
                <div className="flex items-center space-x-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Room Code
                    </span>
                    <span className="font-mono text-2xl font-black tracking-widest text-orange-600">
                      {currentRoom.code}
                    </span>
                  </div>

                  <button
                    onClick={copyRoomCode}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-white rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-sm"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? "Copied!" : "Code"}</span>
                  </button>

                  <button
                    onClick={copyInviteLink}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg text-xs font-bold text-white hover:opacity-90 transition shadow-sm"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    <span>{copiedLink ? "Link Copied!" : "Invite"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="bg-white/95 text-slate-900 rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-lg text-slate-900">
                    Connected Players ({currentCount} / {currentRoom.maxPlayers})
                  </h3>
                </div>
                {!isHost && (
                  <button
                    onClick={handleToggleReady}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                      currentRoom.players.find(p => p.userId === userId)?.isReady
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    }`}
                  >
                    {currentRoom.players.find(p => p.userId === userId)?.isReady ? "✓ Ready" : "Click when Ready"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentRoom.players.map(p => {
                  const isPlayerHost = p.userId === currentRoom.hostId;
                  const isMe = p.userId === userId;

                  return (
                    <div
                      key={p.userId}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        isMe ? "bg-orange-50/70 border-orange-300" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          {isPlayerHost && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 p-0.5 rounded-full text-slate-900 shadow">
                              <Crown className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-sm text-slate-900">{p.name}</span>
                            {isMe && <span className="text-[10px] text-orange-600 font-semibold">(You)</span>}
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                              isPlayerHost
                                ? "bg-amber-100 text-amber-800"
                                : p.isReady
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isPlayerHost ? "Host" : p.isReady ? "Ready" : "Waiting"}
                          </span>
                        </div>
                      </div>

                      {/* Kick button for host */}
                      {isHost && !isMe && (
                        <button
                          title="Remove player"
                          onClick={() => handleKickPlayer(p.userId)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Lobby Action Footer */}
              <div className="mt-8 pt-5 border-t border-slate-100">
                {isHost ? (
                  <div>
                    <button
                      disabled={!canStartGame}
                      onClick={handleStartGame}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>Start Game for Everyone</span>
                    </button>
                    {!canStartGame && (
                      <p className="text-xs text-slate-500 text-center mt-2">
                        {currentCount < minRequired
                          ? `Need at least ${minRequired} players to start (currently ${currentCount}). Invite friends using code "${currentRoom.code}".`
                          : "Waiting for all players to click Ready..."}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2 text-slate-600 text-sm">
                    {currentRoom.status === "active" ? (
                      <p className="font-semibold text-emerald-600">Game starting now! Joining...</p>
                    ) : (
                      <p>Waiting for the host to start the game. Make sure you are marked as Ready!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSystem;
