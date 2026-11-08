// src/components/MafiaGame.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Shield,
  Eye,
  Heart,
  Moon,
  Sun,
  MessageSquare,
  Skull,
  AlertCircle,
  Check,
  Crown,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Lock,
  Send,
  UserX,
  Sparkles,
  HelpCircle,
  Clock,
  ChevronRight
} from "lucide-react";
import { socket, getUserId } from "../socket";
import { secureFisherYatesShuffle } from "../utils/secureRandom";

interface MafiaGameProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

export type MafiaRole = "mafia" | "detective" | "doctor" | "villager";

interface PlayerState {
  id: string;
  userId: string;
  name: string;
  isAlive: boolean;
  votesReceived?: number;
  hasVoted?: boolean;
  hasActedNight?: boolean;
}

interface PrivateCard {
  role: MafiaRole;
  isAlive: boolean;
  teammates?: Array<{ userId: string; name: string; isAlive: boolean }>;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

function getRoleConfig(count: number) {
  if (count <= 5) return { mafia: 1, detective: 1, doctor: 1, villager: Math.max(0, count - 3) };
  if (count <= 9) return { mafia: 2, detective: 1, doctor: 1, villager: count - 4 };
  if (count <= 12) return { mafia: 3, detective: 1, doctor: 1, villager: count - 5 };
  return { mafia: 4, detective: 1, doctor: 1, villager: count - 6 };
}



const MafiaGame: React.FC<MafiaGameProps> = ({ onBack, username, roomId }) => {
  const userId = getUserId();
  const isMultiplayer = !!roomId;

  // Mode Selection: null (if not in room), 'offline', or 'online'
  const [gameMode, setGameMode] = useState<"offline" | "online" | null>(
    isMultiplayer ? "online" : null
  );

  // -------------------------------------------------------------
  // ONLINE MULTIPLAYER STATE
  // -------------------------------------------------------------
  const [onlineGameState, setOnlineGameState] = useState<any>(null);
  const [myPrivateCard, setMyPrivateCard] = useState<PrivateCard | null>(null);
  const [detectiveResult, setDetectiveResult] = useState<{ targetUserId: string; result: string } | null>(null);
  const [nightActionSubmitted, setNightActionSubmitted] = useState(false);
  const [selectedNightTarget, setSelectedNightTarget] = useState<string | null>(null);
  const [selectedVoteTarget, setSelectedVoteTarget] = useState<string | null>(null);
  const [hasVotedOnline, setHasVotedOnline] = useState(false);

  // Online Chats
  const [dayChatMessages, setDayChatMessages] = useState<ChatMessage[]>([]);
  const [mafiaChatMessages, setMafiaChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [activeChatTab, setActiveChatTab] = useState<"day" | "mafia">("day");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // -------------------------------------------------------------
  // OFFLINE PARTY MODE STATE
  // -------------------------------------------------------------
  const [offlinePlayerCount, setOfflinePlayerCount] = useState<number>(6);
  const [offlinePlayerNames, setOfflinePlayerNames] = useState<string[]>([]);
  const [offlineStep, setOfflineStep] = useState<
    "setup" | "reveal_turn" | "role_visible" | "night_intro" | "night_mafia" | "night_doctor" | "night_detective" | "day_announcement" | "discussion" | "voting" | "revote" | "elimination" | "game_over"
  >("setup");

  const [offlineCurrentRevealIndex, setOfflineCurrentRevealIndex] = useState(0);
  const [offlineRoles, setOfflineRoles] = useState<Map<number, MafiaRole>>(new Map());
  const [offlineAliveStatus, setOfflineAliveStatus] = useState<boolean[]>([]);
  const [offlineNightMafiaTarget, setOfflineNightMafiaTarget] = useState<number | null>(null);
  const [offlineNightDoctorTarget, setOfflineNightDoctorTarget] = useState<number | null>(null);
  const [offlineNightDetectiveTarget, setOfflineNightDetectiveTarget] = useState<number | null>(null);
  const [offlineDetectiveResult, setOfflineDetectiveResult] = useState<string | null>(null);
  const [offlineNightVictim, setOfflineNightVictim] = useState<string | null>(null);
  const [offlineDayNumber, setOfflineDayNumber] = useState(1);
  const [offlineDiscussionTimeLeft, setOfflineDiscussionTimeLeft] = useState(60);
  const [offlineTimerRunning, setOfflineTimerRunning] = useState(false);
  const [offlineVotes, setOfflineVotes] = useState<Map<number, number>>(new Map());
  const [offlineVoterIndex, setOfflineVoterIndex] = useState<number>(0);
  const [offlineRevoteCandidates, setOfflineRevoteCandidates] = useState<number[]>([]);
  const [offlineEliminatedByVote, setOfflineEliminatedByVote] = useState<{ name: string; role: MafiaRole } | null>(null);
  const [offlineWinner, setOfflineWinner] = useState<{ team: "town" | "mafia"; reason: string } | null>(null);

  // -------------------------------------------------------------
  // ONLINE SOCKET LIFECYCLE
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    // Join game channel
    socket.emit("joinGame", { roomId, userId }, (res: any) => {
      if (res?.error) console.warn("joinGame Mafia error:", res.error);
    });

    // 1. Game State Updates
    const onGameStateUpdate = (payload: any) => {
      if (payload.gameKey !== "Mafia") return;
      const s = payload.state || payload;
      setOnlineGameState(s);

      // Reset local voting states on phase transition
      if (s.phase === "voting" || s.phase === "revote") {
        const me = s.players?.find((p: any) => p.userId === userId);
        setHasVotedOnline(!!me?.hasVoted);
      } else if (s.phase === "night") {
        setNightActionSubmitted(false);
        setSelectedNightTarget(null);
        setDetectiveResult(null);
      }
    };

    // 2. Private Card Updates
    const onPrivateCard = (card: PrivateCard) => {
      setMyPrivateCard(card);
    };

    const onPrivateStateUpdate = (payload: any) => {
      if (payload.gameKey === "Mafia" && payload.privateCard) {
        setMyPrivateCard(payload.privateCard);
      }
    };

    // 3. Detective Investigation Result
    const onDetectiveResult = (data: { targetUserId: string; result: string }) => {
      setDetectiveResult(data);
    };

    // 4. Chat Messages
    const onDayChatMessage = (msg: ChatMessage) => {
      setDayChatMessages(prev => [...prev, msg]);
    };

    const onMafiaChatMessage = (msg: ChatMessage) => {
      setMafiaChatMessages(prev => [...prev, msg]);
    };

    // 5. Timer Tick
    const onTimerTick = (data: { phaseTimeRemaining: number }) => {
      setOnlineGameState((prev: any) => {
        if (!prev) return prev;
        return { ...prev, phaseTimeRemaining: data.phaseTimeRemaining };
      });
    };

    socket.on("gameStateUpdate", onGameStateUpdate);
    socket.on("privateCard", onPrivateCard);
    socket.on("privateStateUpdate", onPrivateStateUpdate);
    socket.on("detectiveResult", onDetectiveResult);
    socket.on("dayChatMessage", onDayChatMessage);
    socket.on("mafiaChatMessage", onMafiaChatMessage);
    socket.on("timerTick", onTimerTick);

    return () => {
      socket.off("gameStateUpdate", onGameStateUpdate);
      socket.off("privateCard", onPrivateCard);
      socket.off("privateStateUpdate", onPrivateStateUpdate);
      socket.off("detectiveResult", onDetectiveResult);
      socket.off("dayChatMessage", onDayChatMessage);
      socket.off("mafiaChatMessage", onMafiaChatMessage);
      socket.off("timerTick", onTimerTick);
    };
  }, [isMultiplayer, roomId, userId]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dayChatMessages, mafiaChatMessages, activeChatTab]);

  // -------------------------------------------------------------
  // ONLINE ACTIONS
  // -------------------------------------------------------------
  const handleOnlineNightAction = (targetUserId: string) => {
    if (!roomId || nightActionSubmitted) return;
    setSelectedNightTarget(targetUserId);

    socket.emit(
      "gameAction",
      {
        roomId,
        action: "submitNightAction",
        payload: { targetUserId }
      },
      (res: any) => {
        if (res?.error) {
          alert(res.error);
        } else {
          setNightActionSubmitted(true);
          if (res?.result) {
            setDetectiveResult({ targetUserId, result: res.result });
          }
        }
      }
    );
  };

  const handleOnlineVote = (targetUserId: string) => {
    if (!roomId || hasVotedOnline) return;
    setSelectedVoteTarget(targetUserId);

    socket.emit(
      "gameAction",
      {
        roomId,
        action: "submitVote",
        payload: { targetUserId }
      },
      (res: any) => {
        if (res?.error) {
          alert(res.error);
        } else {
          setHasVotedOnline(true);
        }
      }
    );
  };

  const handleSendOnlineChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !roomId) return;

    const action = activeChatTab === "mafia" ? "sendMafiaChat" : "sendDayChat";
    socket.emit(
      "gameAction",
      {
        roomId,
        action,
        payload: { message: chatInput.trim() }
      },
      (res: any) => {
        if (res?.error) {
          alert(res.error);
        } else {
          setChatInput("");
        }
      }
    );
  };

  const handleOnlineRematch = () => {
    if (!roomId) return;
    socket.emit("gameAction", { roomId, action: "restartGame", payload: {} }, (res: any) => {
      if (res?.error) alert(res.error);
    });
  };

  // -------------------------------------------------------------
  // OFFLINE PARTY MODE LOGIC
  // -------------------------------------------------------------
  const initOfflineSetup = (count: number) => {
    setOfflinePlayerCount(count);
    const names = [username || "Player 1"];
    for (let i = 2; i <= count; i++) {
      names.push(`Player ${i}`);
    }
    setOfflinePlayerNames(names);
  };

  const startOfflineGame = () => {
    const count = offlinePlayerNames.length;
    const config = getRoleConfig(count);

    const pool: MafiaRole[] = [];
    for (let i = 0; i < config.mafia; i++) pool.push("mafia");
    for (let i = 0; i < config.detective; i++) pool.push("detective");
    for (let i = 0; i < config.doctor; i++) pool.push("doctor");
    while (pool.length < count) pool.push("villager");

    const shuffledRoles = secureFisherYatesShuffle(pool);
    const playerIndices = secureFisherYatesShuffle(Array.from({ length: count }, (_, i) => i));
    const rolesMap = new Map<number, MafiaRole>();
    playerIndices.forEach((playerIdx, roleIdx) => {
      rolesMap.set(playerIdx, shuffledRoles[roleIdx]);
    });

    setOfflineRoles(rolesMap);
    setOfflineAliveStatus(new Array(count).fill(true));
    setOfflineCurrentRevealIndex(0);
    setOfflineDayNumber(1);
    setOfflineStep("reveal_turn");
  };

  const nextOfflineReveal = () => {
    if (offlineCurrentRevealIndex + 1 < offlinePlayerNames.length) {
      setOfflineCurrentRevealIndex(prev => prev + 1);
      setOfflineStep("reveal_turn");
    } else {
      // All players have viewed their role -> Begin Night 1
      startOfflineNight();
    }
  };

  const startOfflineNight = () => {
    setOfflineNightMafiaTarget(null);
    setOfflineNightDoctorTarget(null);
    setOfflineNightDetectiveTarget(null);
    setOfflineDetectiveResult(null);
    setOfflineStep("night_intro");
  };

  const resolveOfflineNight = () => {
    let victimName: string | null = null;
    if (offlineNightMafiaTarget !== null && offlineNightMafiaTarget !== offlineNightDoctorTarget) {
      const updatedAlive = [...offlineAliveStatus];
      updatedAlive[offlineNightMafiaTarget] = false;
      setOfflineAliveStatus(updatedAlive);
      victimName = offlinePlayerNames[offlineNightMafiaTarget];
    }

    setOfflineNightVictim(victimName);
    setOfflineStep("day_announcement");

    // Check Win Condition
    const win = checkOfflineWinCondition();
    if (win) {
      setOfflineWinner(win);
      setOfflineStep("game_over");
    }
  };

  const startOfflineDiscussion = () => {
    setOfflineDiscussionTimeLeft(60);
    setOfflineTimerRunning(true);
    setOfflineStep("discussion");
  };

  // Offline timer tick
  useEffect(() => {
    let intv: any = null;
    if (offlineTimerRunning && offlineStep === "discussion") {
      intv = setInterval(() => {
        setOfflineDiscussionTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intv);
            setOfflineTimerRunning(false);
            startOfflineVoting(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intv);
  }, [offlineTimerRunning, offlineStep]);

  const startOfflineVoting = (isRevote: boolean, candidates: number[] = []) => {
    setOfflineVotes(new Map());
    setOfflineRevoteCandidates(candidates);
    // Find first living voter
    const firstAlive = offlineAliveStatus.findIndex(alive => alive);
    setOfflineVoterIndex(firstAlive >= 0 ? firstAlive : 0);
    setOfflineStep(isRevote ? "revote" : "voting");
  };

  const recordOfflineVote = (targetIdx: number) => {
    const updated = new Map(offlineVotes);
    updated.set(offlineVoterIndex, targetIdx);
    setOfflineVotes(updated);

    // Find next living voter
    let nextVoter = offlineVoterIndex + 1;
    while (nextVoter < offlinePlayerNames.length && !offlineAliveStatus[nextVoter]) {
      nextVoter++;
    }

    if (nextVoter < offlinePlayerNames.length) {
      setOfflineVoterIndex(nextVoter);
    } else {
      // All living voters have voted -> resolve votes
      resolveOfflineVotes(offlineStep === "revote");
    }
  };

  const resolveOfflineVotes = (wasRevote: boolean) => {
    const tally = new Map<number, number>();
    for (const target of offlineVotes.values()) {
      tally.set(target, (tally.get(target) || 0) + 1);
    }

    let maxVotes = 0;
    let leaders: number[] = [];
    for (const [target, count] of tally.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        leaders = [target];
      } else if (count === maxVotes) {
        leaders.push(target);
      }
    }

    if (leaders.length > 1 && maxVotes > 0) {
      if (!wasRevote) {
        // Tie in regular voting -> Revote among tied candidates
        startOfflineVoting(true, leaders);
        return;
      } else {
        // Tie in revote -> Nobody eliminated
        setOfflineEliminatedByVote(null);
      }
    } else if (leaders.length === 1 && maxVotes > 0) {
      const eliminatedIdx = leaders[0];
      const updated = [...offlineAliveStatus];
      updated[eliminatedIdx] = false;
      setOfflineAliveStatus(updated);

      setOfflineEliminatedByVote({
        name: offlinePlayerNames[eliminatedIdx],
        role: offlineRoles.get(eliminatedIdx) || "villager"
      });
    } else {
      setOfflineEliminatedByVote(null);
    }

    setOfflineStep("elimination");

    // Check Win Condition
    const win = checkOfflineWinCondition();
    if (win) {
      setOfflineWinner(win);
      setOfflineStep("game_over");
    }
  };

  const checkOfflineWinCondition = (): { team: "town" | "mafia"; reason: string } | null => {
    let livingMafia = 0;
    let livingTown = 0;

    for (let i = 0; i < offlinePlayerNames.length; i++) {
      if (offlineAliveStatus[i]) {
        const role = offlineRoles.get(i);
        if (role === "mafia") livingMafia++;
        else livingTown++;
      }
    }

    if (livingMafia === 0) {
      return { team: "town", reason: "All Mafia members have been eliminated! The Town wins!" };
    }
    if (livingMafia >= livingTown) {
      return { team: "mafia", reason: "Mafia members equal or outnumber the Town! The Mafia wins!" };
    }
    return null;
  };

  // Helper role badge
  const renderRoleBadge = (role: MafiaRole) => {
    switch (role) {
      case "mafia":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full font-bold text-xs uppercase tracking-wider">
            <Skull className="w-3.5 h-3.5" /> Mafia
          </span>
        );
      case "detective":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-full font-bold text-xs uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" /> Detective
          </span>
        );
      case "doctor":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-xs uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" /> Doctor
          </span>
        );
      case "villager":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-600/20 text-slate-300 border border-slate-500/30 rounded-full font-bold text-xs uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> Villager
          </span>
        );
    }
  };

  // -------------------------------------------------------------
  // VIEW: MODE SELECTION MODAL
  // -------------------------------------------------------------
  if (gameMode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Adda
          </button>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Skull className="w-5 h-5 text-red-500" /> Apna Adda Party
          </div>
        </header>

        <main className="max-w-2xl mx-auto w-full my-auto text-center space-y-8 py-8">
          <div className="space-y-3">
            <div className="inline-flex p-4 rounded-3xl bg-red-600/20 border border-red-500/30 shadow-2xl shadow-red-950/60 text-red-500">
              <Skull className="w-16 h-16 animate-pulse" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              MAFIA
            </h1>
            <p className="text-slate-400 max-w-md mx-auto text-sm sm:text-base">
              The classic social deduction party game. Can the innocent town find the impostors before the Mafia takes over?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* Mode 1: Offline Party Mode */}
            <div
              onClick={() => {
                initOfflineSetup(6);
                setGameMode("offline");
              }}
              className="group cursor-pointer p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-purple-950/40 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                  Offline Party Mode
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pass & Play mode on a single phone. Secret role reveal, face-to-face discussion (no chatbox), and moderator prompts.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition">
                Play Offline <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Mode 2: Online Multiplayer Mode */}
            <div
              onClick={() => {
                setGameMode("online");
              }}
              className="group cursor-pointer p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-red-500/20 hover:border-red-500/50 transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-red-950/40 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-300 transition">
                  Online Multiplayer
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join with friends across different devices using a 4-letter room code. Real-time chat, synchronized night actions, and private role delivery.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-red-400 group-hover:translate-x-1 transition">
                Host / Join Room <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-500 py-2">
          5 to 16 players • Balanced team distribution • Anti-cheat role privacy
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: OFFLINE PARTY MODE
  // -------------------------------------------------------------
  if (gameMode === "offline") {
    // 1. Offline Setup
    if (offlineStep === "setup") {
      const config = getRoleConfig(offlinePlayerNames.length);
      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col justify-between">
          <header className="max-w-2xl mx-auto w-full flex items-center justify-between">
            <button
              onClick={() => setGameMode(null)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Switch Mode
            </button>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Offline Party Setup
            </div>
          </header>

          <main className="max-w-xl mx-auto w-full my-auto space-y-6 py-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Party Players (5–16)</h2>
              <p className="text-xs text-slate-400">Select player count and enter player names below:</p>
            </div>

            {/* Player Count Slider / Buttons */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Player Count:</span>
                <span className="text-purple-400 font-bold text-lg">{offlinePlayerNames.length} Players</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(num => (
                  <button
                    key={num}
                    onClick={() => initOfflineSetup(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      offlinePlayerNames.length === num
                        ? "bg-purple-600 text-white"
                        : "bg-white/5 hover:bg-white/10 text-slate-400"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Composition Summary */}
            <div className="bg-purple-950/30 p-4 rounded-xl border border-purple-500/20 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-red-950/40 border border-red-500/20 rounded-lg">
                <div className="font-bold text-red-400 text-lg">{config.mafia}</div>
                <div className="text-red-300/80 font-medium text-[10px]">Mafia</div>
              </div>
              <div className="p-2 bg-amber-950/40 border border-amber-500/20 rounded-lg">
                <div className="font-bold text-amber-400 text-lg">{config.detective}</div>
                <div className="text-amber-300/80 font-medium text-[10px]">Detective</div>
              </div>
              <div className="p-2 bg-emerald-950/40 border border-emerald-500/20 rounded-lg">
                <div className="font-bold text-emerald-400 text-lg">{config.doctor}</div>
                <div className="text-emerald-300/80 font-medium text-[10px]">Doctor</div>
              </div>
              <div className="p-2 bg-slate-900/40 border border-slate-500/20 rounded-lg">
                <div className="font-bold text-slate-300 text-lg">{config.villager}</div>
                <div className="text-slate-400 font-medium text-[10px]">Villagers</div>
              </div>
            </div>

            {/* Names Input */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-2 max-h-56 overflow-y-auto">
              {offlinePlayerNames.map((name, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-6 font-mono font-bold">#{idx + 1}</span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => {
                      const updated = [...offlinePlayerNames];
                      updated[idx] = e.target.value;
                      setOfflinePlayerNames(updated);
                    }}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                    placeholder={`Player ${idx + 1}`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={startOfflineGame}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition text-sm tracking-wide"
            >
              Start Pass & Play Role Reveal
            </button>
          </main>
          <footer className="text-center text-xs text-slate-600">Apna Adda Offline Mafia</footer>
        </div>
      );
    }

    // 2. Offline: Role Reveal Turn Prompt
    if (offlineStep === "reveal_turn") {
      const currentName = offlinePlayerNames[offlineCurrentRevealIndex];
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-semibold text-slate-400">
            Player {offlineCurrentRevealIndex + 1} of {offlinePlayerNames.length}
          </div>
          <div className="max-w-md w-full space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-2xl">
              <Lock className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-300">Pass device to:</h2>
              <div className="text-3xl font-extrabold text-purple-400 tracking-wide">{currentName}</div>
              <p className="text-xs text-slate-500">Ensure no other player can see the screen!</p>
            </div>
            <button
              onClick={() => setOfflineStep("role_visible")}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-base"
            >
              <Eye className="w-5 h-5" /> Reveal My Role
            </button>
          </div>
          <div className="text-xs text-slate-600">Keep your role secret from all other players</div>
        </div>
      );
    }

    // 3. Offline: Secret Role Display
    if (offlineStep === "role_visible") {
      const role = offlineRoles.get(offlineCurrentRevealIndex) || "villager";
      const playerName = offlinePlayerNames[offlineCurrentRevealIndex];
      // Other mafia members
      const mafiaTeammates = offlinePlayerNames.filter((_, idx) => offlineRoles.get(idx) === "mafia");

      return (
        <div className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs text-slate-400">Secret Identity for {playerName}</div>
          <div className="max-w-md w-full bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Your Secret Role</div>
              {renderRoleBadge(role)}
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs leading-relaxed text-slate-300">
              {role === "mafia" && (
                <>
                  <p className="text-red-400 font-semibold">Eliminate the Town members each night without getting caught!</p>
                  <div className="mt-3 pt-3 border-t border-white/10 text-left">
                    <span className="font-bold text-slate-400 block mb-1">Mafia Teammates:</span>
                    <ul className="space-y-0.5 font-medium text-red-300">
                      {mafiaTeammates.map((mName, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Skull className="w-3.5 h-3.5" /> {mName} {mName === playerName ? "(You)" : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              {role === "detective" && (
                <p className="text-amber-300 font-semibold">
                  Each night, secretly investigate one player to learn if they are Mafia or Not Mafia!
                </p>
              )}
              {role === "doctor" && (
                <p className="text-emerald-300 font-semibold">
                  Each night, choose one player to protect from elimination. You can protect yourself!
                </p>
              )}
              {role === "villager" && (
                <p className="text-slate-300 font-semibold">
                  Find the hidden Mafia through Day discussions and vote to eliminate them!
                </p>
              )}
            </div>

            <button
              onClick={nextOfflineReveal}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 border border-white/10"
            >
              <Lock className="w-4 h-4" /> Hide Role & Pass Device
            </button>
          </div>
          <div className="text-xs text-slate-600">Role is hidden as soon as you tap</div>
        </div>
      );
    }

    // 4. Offline: Night Intro
    if (offlineStep === "night_intro") {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
            <Moon className="w-4 h-4" /> Night {offlineDayNumber}
          </div>
          <div className="max-w-md w-full space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-2xl animate-pulse">
              <Moon className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Night has fallen!</h2>
              <p className="text-sm text-slate-400">
                Announce to everyone: <span className="font-bold text-purple-300">"Town, close your eyes! Mafia, wake up!"</span>
              </p>
            </div>
            <button
              onClick={() => setOfflineStep("night_mafia")}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
            >
              <Skull className="w-5 h-5" /> Mafia Turn
            </button>
          </div>
          <div className="text-xs text-slate-600">Single-device moderator controls</div>
        </div>
      );
    }

    // 5. Offline: Night Mafia Pick
    if (offlineStep === "night_mafia") {
      return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8 flex flex-col justify-between">
          <header className="text-center space-y-1">
            <div className="text-xs text-red-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Skull className="w-4 h-4" /> Mafia Action
            </div>
            <h2 className="text-xl font-bold">Select target to eliminate:</h2>
          </header>

          <main className="max-w-md mx-auto w-full my-auto space-y-3">
            {offlinePlayerNames.map((name, idx) => {
              const isAlive = offlineAliveStatus[idx];
              const isMafia = offlineRoles.get(idx) === "mafia";
              if (!isAlive || isMafia) return null; // Mafia cannot target eliminated or teammates

              return (
                <button
                  key={idx}
                  onClick={() => setOfflineNightMafiaTarget(idx)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-sm transition ${
                    offlineNightMafiaTarget === idx
                      ? "bg-red-600/30 border-red-500 text-white font-bold"
                      : "bg-slate-900 border-white/10 hover:bg-slate-850 text-slate-300"
                  }`}
                >
                  <span>{name}</span>
                  {offlineNightMafiaTarget === idx && <Check className="w-4 h-4 text-red-400" />}
                </button>
              );
            })}

            <button
              disabled={offlineNightMafiaTarget === null}
              onClick={() => setOfflineStep("night_doctor")}
              className="w-full mt-4 py-3 bg-red-600 disabled:opacity-40 hover:bg-red-500 text-white font-bold rounded-xl transition text-sm"
            >
              Confirm Mafia Target & Call Doctor
            </button>
          </main>
          <footer className="text-center text-xs text-slate-600">Mafia, close eyes. Doctor wake up.</footer>
        </div>
      );
    }

    // 6. Offline: Night Doctor Protection
    if (offlineStep === "night_doctor") {
      return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8 flex flex-col justify-between">
          <header className="text-center space-y-1">
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Heart className="w-4 h-4" /> Doctor Action
            </div>
            <h2 className="text-xl font-bold">Select player to protect:</h2>
          </header>

          <main className="max-w-md mx-auto w-full my-auto space-y-3">
            {offlinePlayerNames.map((name, idx) => {
              const isAlive = offlineAliveStatus[idx];
              if (!isAlive) return null;

              return (
                <button
                  key={idx}
                  onClick={() => setOfflineNightDoctorTarget(idx)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-sm transition ${
                    offlineNightDoctorTarget === idx
                      ? "bg-emerald-600/30 border-emerald-500 text-white font-bold"
                      : "bg-slate-900 border-white/10 hover:bg-slate-850 text-slate-300"
                  }`}
                >
                  <span>{name}</span>
                  {offlineNightDoctorTarget === idx && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}

            <button
              disabled={offlineNightDoctorTarget === null}
              onClick={() => setOfflineStep("night_detective")}
              className="w-full mt-4 py-3 bg-emerald-600 disabled:opacity-40 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-sm"
            >
              Confirm Protection & Call Detective
            </button>
          </main>
          <footer className="text-center text-xs text-slate-600">Doctor, close eyes. Detective wake up.</footer>
        </div>
      );
    }

    // 7. Offline: Night Detective Investigation
    if (offlineStep === "night_detective") {
      const handleInvestigate = (targetIdx: number) => {
        setOfflineNightDetectiveTarget(targetIdx);
        const role = offlineRoles.get(targetIdx);
        setOfflineDetectiveResult(role === "mafia" ? "Mafia" : "Not Mafia");
      };

      return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8 flex flex-col justify-between">
          <header className="text-center space-y-1">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Eye className="w-4 h-4" /> Detective Investigation
            </div>
            <h2 className="text-xl font-bold">Investigate one suspect:</h2>
          </header>

          <main className="max-w-md mx-auto w-full my-auto space-y-3">
            {offlineDetectiveResult ? (
              <div className="p-6 bg-slate-900 rounded-2xl border border-amber-500/30 text-center space-y-4">
                <div className="text-xs text-slate-400">Investigation Result:</div>
                <div className="text-2xl font-bold text-white">
                  {offlinePlayerNames[offlineNightDetectiveTarget!]}
                </div>
                <div
                  className={`inline-block px-4 py-2 rounded-xl text-lg font-extrabold ${
                    offlineDetectiveResult === "Mafia"
                      ? "bg-red-600/30 text-red-400 border border-red-500"
                      : "bg-emerald-600/30 text-emerald-400 border border-emerald-500"
                  }`}
                >
                  {offlineDetectiveResult}
                </div>
                <button
                  onClick={resolveOfflineNight}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm"
                >
                  Hide Result & Wake Up Town
                </button>
              </div>
            ) : (
              offlinePlayerNames.map((name, idx) => {
                const isAlive = offlineAliveStatus[idx];
                const isDetective = offlineRoles.get(idx) === "detective";
                if (!isAlive || isDetective) return null;

                return (
                  <button
                    key={idx}
                    onClick={() => handleInvestigate(idx)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-500 hover:bg-slate-850 text-left flex items-center justify-between text-sm transition text-slate-200"
                  >
                    <span>{name}</span>
                    <Eye className="w-4 h-4 text-amber-400" />
                  </button>
                );
              })
            )}
          </main>
          <footer className="text-center text-xs text-slate-600">Only the detective should see this result</footer>
        </div>
      );
    }

    // 8. Offline: Day Announcement
    if (offlineStep === "day_announcement") {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Sun className="w-4 h-4" /> Day {offlineDayNumber} Morning
          </div>
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sun className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Good morning, Town!</h2>
              {offlineNightVictim ? (
                <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl space-y-1">
                  <div className="text-xs text-red-300">Tragedy occurred last night:</div>
                  <div className="text-xl font-extrabold text-red-400">{offlineNightVictim} was eliminated!</div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1">
                  <div className="text-xs text-emerald-300">Miracle occurred!</div>
                  <div className="text-lg font-bold text-emerald-400">Peaceful night! The Doctor saved the target.</div>
                </div>
              )}
            </div>
            <button
              onClick={startOfflineDiscussion}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
            >
              Start Face-to-Face Discussion
            </button>
          </div>
          <div className="text-xs text-slate-600">Discuss physically with all living players</div>
        </div>
      );
    }

    // 9. Offline: Day Discussion (Face to face - strictly NO chatbox)
    if (offlineStep === "discussion") {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col justify-between">
          <header className="max-w-2xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sun className="w-5 h-5" /> Day {offlineDayNumber} Discussion
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full font-mono text-xs font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5" /> {offlineDiscussionTimeLeft}s
            </div>
          </header>

          <main className="max-w-xl mx-auto w-full my-auto space-y-6 py-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Face-to-Face Discussion</h2>
              <p className="text-xs text-slate-400">
                Talk aloud, accuse suspects, defend your innocence, and look for suspicious behavior!
              </p>
            </div>

            {/* Living Players Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              {offlinePlayerNames.map((name, idx) => {
                const isAlive = offlineAliveStatus[idx];
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      isAlive
                        ? "bg-slate-900 border-white/10 text-white"
                        : "bg-red-950/20 border-red-500/20 text-slate-500 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isAlive ? "bg-purple-600 text-white" : "bg-red-900 text-red-300"
                      }`}
                    >
                      {isAlive ? name.charAt(0) : <Skull className="w-4 h-4" />}
                    </div>
                    <div className="truncate text-xs font-medium">
                      {name} {!isAlive && "(Eliminated)"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setOfflineTimerRunning(!offlineTimerRunning)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold"
              >
                {offlineTimerRunning ? "Pause Timer" : "Resume Timer"}
              </button>
              <button
                onClick={() => startOfflineVoting(false)}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg"
              >
                Proceed to Voting
              </button>
            </div>
          </main>
          <footer className="text-center text-xs text-slate-600">Offline party mode (no online chat needed)</footer>
        </div>
      );
    }

    // 10. Offline: Voting & Revote Phase
    if (offlineStep === "voting" || offlineStep === "revote") {
      const currentVoterName = offlinePlayerNames[offlineVoterIndex];
      const isRevote = offlineStep === "revote";

      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col justify-between">
          <header className="max-w-md mx-auto w-full text-center space-y-1">
            <div className="text-xs font-bold text-red-400 uppercase tracking-widest">
              {isRevote ? "Tie Revote Phase" : "Town Voting Phase"}
            </div>
            <h2 className="text-xl font-bold">
              Pass to: <span className="text-purple-400">{currentVoterName}</span>
            </h2>
            <p className="text-xs text-slate-400">Select which player to eliminate:</p>
          </header>

          <main className="max-w-md mx-auto w-full my-auto space-y-3">
            {offlinePlayerNames.map((name, idx) => {
              const isAlive = offlineAliveStatus[idx];
              if (!isAlive || idx === offlineVoterIndex) return null; // cannot vote for self or dead
              if (isRevote && !offlineRevoteCandidates.includes(idx)) return null; // revote candidates only

              return (
                <button
                  key={idx}
                  onClick={() => recordOfflineVote(idx)}
                  className="w-full p-3.5 bg-slate-900 border border-white/10 hover:border-red-500 hover:bg-red-950/30 rounded-xl text-left flex items-center justify-between text-sm transition"
                >
                  <span className="font-semibold text-white">{name}</span>
                  <span className="text-xs text-red-400 font-bold">Cast Vote</span>
                </button>
              );
            })}
          </main>
          <footer className="text-center text-xs text-slate-600">Vote remains secret until all have voted</footer>
        </div>
      );
    }

    // 11. Offline: Elimination Announcement
    if (offlineStep === "elimination") {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-bold text-red-400">Day {offlineDayNumber} Vote Result</div>
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Skull className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">The Town has Spoken!</h2>
              {offlineEliminatedByVote ? (
                <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl space-y-1">
                  <div className="text-xl font-extrabold text-red-400">
                    {offlineEliminatedByVote.name} was eliminated!
                  </div>
                  <div className="text-xs text-slate-300">
                    Their role was: <span className="font-bold uppercase text-white">{offlineEliminatedByVote.role}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-800/60 border border-white/10 rounded-xl text-sm text-slate-300">
                  Votes resulted in a tie or no votes were cast! Nobody was eliminated today.
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setOfflineDayNumber(d => d + 1);
                startOfflineNight();
              }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm"
            >
              Proceed to Night {offlineDayNumber + 1}
            </button>
          </div>
          <div className="text-xs text-slate-600">Apna Adda Mafia</div>
        </div>
      );
    }

    // 12. Offline: Game Over
    if (offlineStep === "game_over" && offlineWinner) {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">Victory!</div>
          <div className="max-w-lg w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2
                className={`text-3xl font-extrabold ${
                  offlineWinner.team === "town" ? "text-emerald-400" : "text-red-500"
                }`}
              >
                {offlineWinner.team === "town" ? "TOWN WINS!" : "MAFIA WINS!"}
              </h2>
              <p className="text-xs text-slate-300">{offlineWinner.reason}</p>
            </div>

            {/* Complete Roles Reveal */}
            <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-2 text-left max-h-48 overflow-y-auto">
              <div className="text-xs font-bold text-slate-400 mb-1">Final Role Assignments:</div>
              {offlinePlayerNames.map((name, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                  <span className={offlineAliveStatus[idx] ? "text-white font-medium" : "text-slate-500 line-through"}>
                    {name}
                  </span>
                  {renderRoleBadge(offlineRoles.get(idx) || "villager")}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={startOfflineGame}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
              >
                Play Again
              </button>
              <button
                onClick={() => setGameMode(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-bold rounded-xl text-xs"
              >
                Main Menu
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-600">Apna Adda PocketParty</div>
        </div>
      );
    }
  }

  // -------------------------------------------------------------
  // VIEW: ONLINE MULTIPLAYER MODE (ROOM REQUIRED)
  // -------------------------------------------------------------
  if (gameMode === "online" && !roomId) {
    // Prompt player to create or join a room via RoomSystem
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between items-center text-center">
        <header className="max-w-md w-full flex items-center justify-between">
          <button
            onClick={() => setGameMode(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-xs font-bold text-red-400 flex items-center gap-1">
            <Skull className="w-4 h-4" /> Online Mafia
          </div>
        </header>

        <main className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Crown className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Online Multiplayer Room</h2>
            <p className="text-xs text-slate-400">
              To play Online Mafia across multiple phones or computers, create or join a room in the Multiplayer Rooms tab!
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm shadow-lg transition"
          >
            Open Multiplayer Rooms
          </button>
        </main>
        <div className="text-xs text-slate-600">Apna Adda PocketParty</div>
      </div>
    );
  }

  // Active Online Game State from Server
  const onlinePhase = onlineGameState?.phase || "role_reveal";
  const onlinePlayers: PlayerState[] = onlineGameState?.players || [];
  const myPlayer = onlinePlayers.find(p => p.userId === userId);
  const isAlive = myPlayer ? myPlayer.isAlive : true;
  const myRole = myPrivateCard?.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-950 to-purple-950 text-white flex flex-col justify-between p-3 sm:p-6">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Room
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/80 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">
            {onlinePhase === "night" ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="capitalize">{onlinePhase.replace("_", " ")}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/5 rounded-full font-mono text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{onlineGameState?.phaseTimeRemaining ?? 0}s</span>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="max-w-4xl mx-auto w-full flex-1 my-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Player Cards & Status */}
        <div className="space-y-3">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Your Identity:</span>
              {!isAlive && <span className="text-red-400 font-bold">ELIMINATED</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{username}</span>
              {myRole ? renderRoleBadge(myRole) : <span className="text-xs text-slate-500">Assigning...</span>}
            </div>

            {myRole === "mafia" && myPrivateCard?.teammates && (
              <div className="pt-2 border-t border-white/10 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Mafia Teammates:</span>
                <div className="space-y-0.5 text-red-300">
                  {myPrivateCard.teammates.map((m, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <Skull className="w-3 h-3 text-red-400" />
                      <span>{m.name}</span>
                      {!m.isAlive && <span className="text-[10px] text-slate-500">(Dead)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Living Players List */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 space-y-2 max-h-72 overflow-y-auto">
            <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>Town Players ({onlinePlayers.filter(p => p.isAlive).length} Alive)</span>
            </div>
            <div className="space-y-1.5">
              {onlinePlayers.map(p => (
                <div
                  key={p.userId}
                  className={`p-2 rounded-xl flex items-center justify-between text-xs border ${
                    p.isAlive
                      ? "bg-black/30 border-white/5 text-slate-200"
                      : "bg-red-950/20 border-red-500/20 text-slate-500 line-through"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        p.isAlive ? "bg-purple-600 text-white" : "bg-red-900 text-red-300"
                      }`}
                    >
                      {p.isAlive ? p.name.charAt(0) : <Skull className="w-3 h-3" />}
                    </div>
                    <span className="font-medium truncate max-w-[120px]">{p.name}</span>
                  </div>

                  {onlinePhase === "voting" && p.hasVoted && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Voted
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Phase Actions */}
        <div className="md:col-span-2 flex flex-col justify-between bg-slate-900/80 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
          {/* Phase 1: Role Reveal */}
          {onlinePhase === "role_reveal" && (
            <div className="my-auto text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Night is Approaching</h3>
                <p className="text-xs text-slate-400">Memorize your role. Night actions will begin shortly!</p>
              </div>
              <div className="inline-block p-4 bg-black/40 rounded-2xl border border-white/10">
                {myRole ? renderRoleBadge(myRole) : <span>Assigning secret role...</span>}
              </div>
            </div>
          )}

          {/* Phase 2: Night Actions */}
          {onlinePhase === "night" && (
            <div className="my-auto space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                  <Moon className="w-3.5 h-3.5" /> Night Operations
                </div>
                <h3 className="text-xl font-bold text-white">
                  {myRole === "mafia" && "Choose a Town Target to Eliminate"}
                  {myRole === "detective" && "Investigate One Suspect"}
                  {myRole === "doctor" && "Choose One Player to Protect"}
                  {myRole === "villager" && "Town is Sleeping..."}
                </h3>
              </div>

              {!isAlive ? (
                <div className="p-4 bg-red-950/30 rounded-xl border border-red-500/30 text-center text-xs text-red-400">
                  You are eliminated and cannot take nighttime actions.
                </div>
              ) : myRole === "villager" ? (
                <div className="p-6 bg-slate-950/80 rounded-2xl border border-white/5 text-center space-y-2">
                  <Moon className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Rest safely while special roles perform their actions. Day will break soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {detectiveResult && (
                    <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center text-xs text-amber-300 font-bold">
                      Investigation Result: {detectiveResult.result}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {onlinePlayers
                      .filter(p => {
                        if (!p.isAlive) return false;
                        if (myRole === "mafia") {
                          // cannot target fellow mafia or self
                          const isTeammate = myPrivateCard?.teammates?.some(m => m.userId === p.userId);
                          return !isTeammate && p.userId !== userId;
                        }
                        if (myRole === "detective") return p.userId !== userId;
                        return true; // doctor can protect self
                      })
                      .map(p => (
                        <button
                          key={p.userId}
                          disabled={nightActionSubmitted}
                          onClick={() => handleOnlineNightAction(p.userId)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                            selectedNightTarget === p.userId
                              ? "bg-purple-600/30 border-purple-500 text-white font-bold"
                              : "bg-slate-950/60 border-white/10 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          <span>{p.name}</span>
                          {selectedNightTarget === p.userId && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </button>
                      ))}
                  </div>

                  {nightActionSubmitted && (
                    <div className="text-center text-xs text-emerald-400 font-semibold pt-1">
                      Action submitted! Waiting for night to resolve...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Phase 3: Day Discussion & Announcement */}
          {(onlinePhase === "day_announcement" || onlinePhase === "discussion") && (
            <div className="flex-1 flex flex-col justify-between space-y-3">
              {/* Death banner */}
              {onlineGameState?.eliminatedLastNight ? (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-center text-xs text-red-300">
                  ⚠️ <span className="font-bold">{onlineGameState.eliminatedLastNight.name}</span> was eliminated last night.
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300">
                  ✨ Peaceful night! The Doctor successfully saved the victim.
                </div>
              )}

              {/* Synchronized Chat UI */}
              <div className="flex-1 flex flex-col bg-slate-950 rounded-xl border border-white/10 p-3 overflow-hidden min-h-[220px]">
                {/* Chat tab toggle for Mafia */}
                {myRole === "mafia" && (
                  <div className="flex gap-2 mb-2 border-b border-white/10 pb-1.5 text-xs">
                    <button
                      onClick={() => setActiveChatTab("day")}
                      className={`px-3 py-1 rounded-md font-bold transition ${
                        activeChatTab === "day" ? "bg-purple-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Town Public Chat
                    </button>
                    <button
                      onClick={() => setActiveChatTab("mafia")}
                      className={`px-3 py-1 rounded-md font-bold transition ${
                        activeChatTab === "mafia" ? "bg-red-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Mafia Private Chat
                    </button>
                  </div>
                )}

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto space-y-1.5 text-xs pr-1">
                  {(activeChatTab === "day" ? dayChatMessages : mafiaChatMessages).map(msg => (
                    <div key={msg.id} className="p-1.5 rounded-lg bg-white/5">
                      <span className="font-bold text-purple-400 mr-1.5">{msg.senderName}:</span>
                      <span className="text-slate-200">{msg.message}</span>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input */}
                {isAlive ? (
                  <form onSubmit={handleSendOnlineChat} className="mt-2 flex gap-1.5">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder={
                        activeChatTab === "mafia"
                          ? "Message Mafia teammates secretly..."
                          : "Discuss suspects with the town..."
                      }
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </form>
                ) : (
                  <div className="text-center text-[11px] text-slate-500 pt-1">
                    Eliminated players cannot speak during Day discussion.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phase 4: Voting & Revote */}
          {(onlinePhase === "voting" || onlinePhase === "revote") && (
            <div className="my-auto space-y-3">
              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-red-400 uppercase tracking-widest">
                  {onlinePhase === "revote" ? "Tie Detected: Revote Phase" : "Town Voting Phase"}
                </div>
                <h3 className="text-lg font-bold">Cast your vote to eliminate a suspect:</h3>
              </div>

              {!isAlive ? (
                <div className="p-4 bg-red-950/30 rounded-xl text-center text-xs text-red-400">
                  Eliminated players cannot vote.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {onlinePlayers
                    .filter(p => {
                      if (!p.isAlive || p.userId === userId) return false;
                      if (onlinePhase === "revote" && onlineGameState?.revoteCandidates?.length > 0) {
                        return onlineGameState.revoteCandidates.includes(p.userId);
                      }
                      return true;
                    })
                    .map(p => (
                      <button
                        key={p.userId}
                        disabled={hasVotedOnline}
                        onClick={() => handleOnlineVote(p.userId)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                          selectedVoteTarget === p.userId
                            ? "bg-red-600/30 border-red-500 text-white font-bold"
                            : "bg-slate-950/60 border-white/10 hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <span>{p.name}</span>
                        {selectedVoteTarget === p.userId && <Check className="w-3.5 h-3.5 text-red-400" />}
                      </button>
                    ))}
                </div>
              )}

              {hasVotedOnline && (
                <div className="text-center text-xs text-emerald-400 font-semibold pt-1">
                  Your vote is registered! Waiting for other players...
                </div>
              )}
            </div>
          )}

          {/* Phase 5: Elimination Announcement */}
          {onlinePhase === "elimination" && (
            <div className="my-auto text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Skull className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Voting Results</h3>
                {onlineGameState?.eliminatedLastVote ? (
                  <p className="text-sm text-red-400">
                    <span className="font-bold">{onlineGameState.eliminatedLastVote.name}</span> was eliminated by the town! (Role: {onlineGameState.eliminatedLastVote.role?.toUpperCase()})
                  </p>
                ) : (
                  <p className="text-sm text-slate-300">The vote resulted in a tie! Nobody was eliminated today.</p>
                )}
              </div>
            </div>
          )}

          {/* Phase 6: Game Over */}
          {onlinePhase === "game_over" && (
            <div className="my-auto text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3
                  className={`text-2xl font-extrabold ${
                    onlineGameState?.gameWinner === "town" ? "text-emerald-400" : "text-red-500"
                  }`}
                >
                  {onlineGameState?.gameWinner === "town" ? "TOWN VICTORY!" : "MAFIA VICTORY!"}
                </h3>
                <p className="text-xs text-slate-300">{onlineGameState?.winReason}</p>
              </div>

              {/* Revealed Roles Grid */}
              {onlineGameState?.allRevealedRoles && (
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1 text-left max-h-40 overflow-y-auto">
                  <div className="text-[11px] font-bold text-slate-400 mb-1">True Identities:</div>
                  {onlinePlayers.map(p => (
                    <div key={p.userId} className="flex items-center justify-between text-xs py-0.5">
                      <span className="text-slate-300">{p.name}</span>
                      {renderRoleBadge(onlineGameState.allRevealedRoles[p.userId] || "villager")}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleOnlineRematch}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg"
              >
                Play Rematch
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-[11px] text-slate-500 pt-2 border-t border-white/5">
        Apna Adda Mafia • Synchronized real-time multiplayer & anti-cheat role isolation
      </footer>
    </div>
  );
};

export default MafiaGame;
