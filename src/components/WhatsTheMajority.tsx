import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Users,
  Clock,
  Send,
  Trophy,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  Wifi,
  Loader,
  Crown,
  ChevronRight,
  Eye,
  Lock,
  Pause,
  Plus,
  Minus,
  RefreshCw,
  AlertCircle,
  Shuffle,
  Flame,
  ShieldAlert,
  ThumbsUp,
  UserCheck
} from "lucide-react";
import { socket, getUserId } from "../socket";
import {
  CATEGORIES,
  PASS_AND_PLAY_CROWD_QUESTIONS,
  PASS_AND_PLAY_FRIENDS_QUESTIONS,
  CrowdQuestion,
  FriendsQuestion
} from "../data/whatsTheMajorityData";

interface WhatsTheMajorityProps {
  onBack: () => void;
  onGoToMultiplayer?: () => void;
  username: string;
  roomId?: string | null;
}

interface PlayerPublic {
  id: string;
  userId: string;
  name: string;
  score: number | string;
  roundScore?: number;
  team?: "chai" | "samosa" | null;
  hasVoted?: boolean;
  hasPredicted?: boolean;
  connected?: boolean;
}

interface RankedOption {
  id: string;
  text: string;
  rank: number;
  points: number;
  percentage?: number;
  voterNames?: string[];
}

interface PlayerBreakdown {
  userId: string;
  name: string;
  chosenOptionText?: string;
  votedForName?: string;
  rank?: number | null;
  pointsAwarded: number;
  predictionBonus?: number;
  totalRoundPoints: number;
}

interface RevealData {
  mode: string;
  rankedOptions?: RankedOption[];
  majorityUserIds?: string[];
  majorityPlayerNames?: string;
  maxVotes?: number;
  voteDistribution?: { userId: string; name: string; votes: number }[];
  playerBreakdowns: PlayerBreakdown[];
  chaos?: string | null;
}

interface MultiplayerState {
  roomId: string;
  gameKey: string;
  gamePhase: "lobby" | "round_intro" | "voting" | "reveal" | "round_results" | "game_over";
  roundNumber: number;
  totalRounds: number;
  mode: string;
  category: string;
  timer: number;
  activeChaosRule: string | null;
  currentQuestion: any;
  players: PlayerPublic[];
  teams?: {
    chai: { name: string; score: number };
    samosa: { name: string; score: number };
  } | null;
  revealData: RevealData | null;
  gameWinner: any;
  statusMessage: string;
}

export const WhatsTheMajority: React.FC<WhatsTheMajorityProps> = ({
  onBack,
  onGoToMultiplayer,
  username,
  roomId
}) => {
  const currentUserId = getUserId();
  const isMultiplayer = Boolean(roomId);

  // Mode Selection: 'offline' (Pass & Play on 1 phone) | 'online' (Separate phones via room) | null
  const [gameMode, setGameMode] = useState<"offline" | "online" | null>(
    isMultiplayer ? "online" : null
  );

  // -------------------------------------------------------------------
  // ONLINE MULTIPLAYER STATE
  // -------------------------------------------------------------------
  const [gameState, setGameState] = useState<MultiplayerState | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [predictedWinnerId, setPredictedWinnerId] = useState<string | null>(null);
  const [hasLockedSubmission, setHasLockedSubmission] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // -------------------------------------------------------------------
  // PASS & PLAY (OFFLINE ON SINGLE PHONE) STATE
  // -------------------------------------------------------------------
  const [offlinePlayers, setOfflinePlayers] = useState<string[]>([
    username || "Player 1",
    "Player 2",
    "Player 3",
    "Player 4"
  ]);
  const [offlineScores, setOfflineScores] = useState<Record<string, number>>({});
  const [offlineTotalRounds, setOfflineTotalRounds] = useState<number>(3);
  const [offlineRound, setOfflineRound] = useState<number>(1);
  const [offlineMode, setOfflineMode] = useState<"classic_crowd" | "friends">("classic_crowd");
  const [offlineStep, setOfflineStep] = useState<
    "setup" | "pass_device" | "player_action" | "reveal" | "round_results" | "game_over"
  >("setup");
  const [offlineCurrentTurnIndex, setOfflineCurrentTurnIndex] = useState<number>(0);
  const [offlineSubmissions, setOfflineSubmissions] = useState<Record<string, string>>({});
  const [offlineCurrentCrowdQ, setOfflineCurrentCrowdQ] = useState<CrowdQuestion | null>(null);
  const [offlineCurrentFriendQ, setOfflineCurrentFriendQ] = useState<FriendsQuestion | null>(null);
  const [offlineUsedQIds, setOfflineUsedQIds] = useState<Set<string>>(new Set());

  // -------------------------------------------------------------------
  // MULTIPLAYER SOCKET SUBSCRIPTIONS
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    // Join game channel
    socket.emit("joinGame", { roomId, userId: currentUserId });

    const handleGameStateUpdate = (newState: MultiplayerState) => {
      setGameState(newState);
      // Reset local submission state on new round
      if (newState.gamePhase === "round_intro") {
        setSelectedOptionId(null);
        setPredictedWinnerId(null);
        setHasLockedSubmission(false);
        setFeedbackError(null);
      }
    };

    socket.on("gameStateUpdate", handleGameStateUpdate);

    // Request private state on mount/reconnect
    socket.emit(
      "gameAction",
      { roomId, action: "getPrivateData", payload: {} },
      (res: any) => {
        if (res && res.ok && res.hasSubmitted) {
          setSelectedOptionId(res.selectedOptionId);
          setPredictedWinnerId(res.predictedWinnerId);
          setHasLockedSubmission(true);
        }
      }
    );

    return () => {
      socket.off("gameStateUpdate", handleGameStateUpdate);
    };
  }, [isMultiplayer, roomId, currentUserId]);

  // Handle Online Action Submit
  const handleLockInOnline = () => {
    if (!selectedOptionId || hasLockedSubmission || submitting || !roomId) return;
    setSubmitting(true);
    setFeedbackError(null);

    const isFriends = gameState?.mode === "friends";
    const payload = isFriends
      ? { targetUserId: selectedOptionId, predictedWinnerId }
      : { optionId: selectedOptionId, predictedWinnerId };

    socket.emit(
      "gameAction",
      {
        roomId,
        action: isFriends ? "submitVote" : "submitAnswer",
        payload
      },
      (res: any) => {
        setSubmitting(false);
        if (res && res.ok) {
          setHasLockedSubmission(true);
        } else {
          setFeedbackError((res && res.error) || "Failed to submit choice.");
        }
      }
    );
  };

  const handleNextRoundOnline = () => {
    if (!roomId) return;
    socket.emit("gameAction", { roomId, action: "nextRound", payload: {} });
  };

  const handleRestartOnline = () => {
    if (!roomId) return;
    socket.emit("gameAction", { roomId, action: "restartGame", payload: {} });
  };

  // -------------------------------------------------------------------
  // PASS & PLAY LOGIC
  // -------------------------------------------------------------------
  const startOfflineGame = () => {
    const initialScores: Record<string, number> = {};
    offlinePlayers.forEach(p => (initialScores[p] = 0));
    setOfflineScores(initialScores);
    setOfflineRound(1);
    setOfflineUsedQIds(new Set());
    startOfflineRound(1);
  };

  const startOfflineRound = (roundNum: number) => {
    setOfflineRound(roundNum);
    setOfflineSubmissions({});
    setOfflineCurrentTurnIndex(0);

    if (offlineMode === "friends") {
      const unused = PASS_AND_PLAY_FRIENDS_QUESTIONS.filter(q => !offlineUsedQIds.has(q.id));
      const pool = unused.length > 0 ? unused : PASS_AND_PLAY_FRIENDS_QUESTIONS;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setOfflineCurrentFriendQ(picked);
      setOfflineUsedQIds(prev => new Set([...prev, picked.id]));
    } else {
      const unused = PASS_AND_PLAY_CROWD_QUESTIONS.filter(q => !offlineUsedQIds.has(q.id));
      const pool = unused.length > 0 ? unused : PASS_AND_PLAY_CROWD_QUESTIONS;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setOfflineCurrentCrowdQ(picked);
      setOfflineUsedQIds(prev => new Set([...prev, picked.id]));
    }

    setOfflineStep("pass_device");
  };

  const handleOfflinePlayerPick = (choiceId: string) => {
    const currentPlayer = offlinePlayers[offlineCurrentTurnIndex];
    const newSubmissions = { ...offlineSubmissions, [currentPlayer]: choiceId };
    setOfflineSubmissions(newSubmissions);

    if (offlineCurrentTurnIndex + 1 < offlinePlayers.length) {
      setOfflineCurrentTurnIndex(prev => prev + 1);
      setOfflineStep("pass_device");
    } else {
      // All players answered! Reveal results
      calculateOfflineScores(newSubmissions);
      setOfflineStep("reveal");
    }
  };

  const calculateOfflineScores = (submissions: Record<string, string>) => {
    const updatedScores = { ...offlineScores };

    if (offlineMode === "classic_crowd" && offlineCurrentCrowdQ) {
      Object.entries(submissions).forEach(([player, optId]) => {
        const opt = offlineCurrentCrowdQ.options.find(o => o.id === optId);
        if (opt) {
          updatedScores[player] = (updatedScores[player] || 0) + opt.points;
        }
      });
    } else if (offlineMode === "friends") {
      // Find majority voted player
      const voteTally: Record<string, number> = {};
      Object.values(submissions).forEach(votedTarget => {
        voteTally[votedTarget] = (voteTally[votedTarget] || 0) + 1;
      });

      let maxVotes = 0;
      Object.values(voteTally).forEach(c => {
        if (c > maxVotes) maxVotes = c;
      });

      const majorityTargets = Object.entries(voteTally)
        .filter(([_, count]) => count === maxVotes)
        .map(([target]) => target);

      Object.entries(submissions).forEach(([player, votedTarget]) => {
        if (majorityTargets.includes(votedTarget)) {
          updatedScores[player] = (updatedScores[player] || 0) + 40;
        }
      });
    }

    setOfflineScores(updatedScores);
  };

  // -------------------------------------------------------------------
  // RENDER: INITIAL MODE SELECTOR (Pass & Play vs Online Multiplayer)
  // -------------------------------------------------------------------
  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 shadow-lg mb-3">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-pink-400 to-purple-300 bg-clip-text text-transparent">
              What's the Majority?
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2">
              Guess what the crowd thinks. Beat your Adda!
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setGameMode("offline")}
              className="w-full text-left p-5 rounded-xl bg-gradient-to-r from-purple-800/80 to-indigo-800/80 hover:from-purple-700 hover:to-indigo-700 border border-purple-400/40 shadow-lg transform transition-all duration-200 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-purple-600 text-white shadow">
                    <Shuffle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      Pass & Play (Single Phone)
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-200">
                      Everyone together in the same room. Pass one phone around to vote!
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-purple-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => {
                if (onGoToMultiplayer) {
                  onGoToMultiplayer();
                } else {
                  setGameMode("online");
                }
              }}
              className="w-full text-left p-5 rounded-xl bg-gradient-to-r from-amber-600/80 to-rose-700/80 hover:from-amber-500 hover:to-rose-600 border border-amber-400/40 shadow-lg transform transition-all duration-200 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-amber-500 text-white shadow">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-200 transition-colors">
                      Online Multiplayer (Separate Phones)
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-100">
                      Create or join a room with a 4-letter code. Each player plays from their phone!
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-amber-200 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // RENDER: PASS & PLAY FLOW (OFFLINE)
  // -------------------------------------------------------------------
  if (gameMode === "offline") {
    // 1. Setup Screen
    if (offlineStep === "setup") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-4 sm:p-8 flex items-center justify-center">
          <div className="max-w-lg w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setGameMode(null)}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h2 className="text-2xl font-black text-amber-300 mb-1">Pass & Play Setup</h2>
            <p className="text-xs text-purple-200 mb-6">Configure players and game mode for your party</p>

            <div className="space-y-5">
              {/* Mode Select */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                  Game Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOfflineMode("classic_crowd")}
                    className={`py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                      offlineMode === "classic_crowd"
                        ? "bg-purple-600 border-amber-400 text-white shadow-lg"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    📊 Classic Crowd
                  </button>
                  <button
                    onClick={() => setOfflineMode("friends")}
                    className={`py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                      offlineMode === "friends"
                        ? "bg-purple-600 border-amber-400 text-white shadow-lg"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    👥 Friends Mode
                  </button>
                </div>
              </div>

              {/* Rounds Select */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                  Number of Rounds
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map(r => (
                    <button
                      key={r}
                      onClick={() => setOfflineTotalRounds(r)}
                      className={`py-2 rounded-lg font-bold text-sm border transition-all ${
                        offlineTotalRounds === r
                          ? "bg-amber-500 border-amber-300 text-slate-900"
                          : "bg-slate-800 border-slate-700 text-slate-300"
                      }`}
                    >
                      {r} Rounds
                    </button>
                  ))}
                </div>
              </div>

              {/* Players List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                    Players ({offlinePlayers.length})
                  </label>
                  {offlinePlayers.length < 8 && (
                    <button
                      onClick={() =>
                        setOfflinePlayers(prev => [...prev, `Player ${prev.length + 1}`])
                      }
                      className="text-xs text-amber-400 font-bold hover:underline flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Player</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {offlinePlayers.map((p, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={p}
                        onChange={e => {
                          const updated = [...offlinePlayers];
                          updated[idx] = e.target.value;
                          setOfflinePlayers(updated);
                        }}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
                        placeholder={`Player ${idx + 1}`}
                      />
                      {offlinePlayers.length > 2 && (
                        <button
                          onClick={() =>
                            setOfflinePlayers(prev => prev.filter((_, i) => i !== idx))
                          }
                          className="p-2 text-rose-400 hover:text-rose-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={startOfflineGame}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-200 mt-4"
              >
                Start Game 🚀
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. Pass Device Screen
    if (offlineStep === "pass_device") {
      const currentPlayer = offlinePlayers[offlineCurrentTurnIndex];
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-4 sm:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center">
              <Shuffle className="w-8 h-8 text-amber-300 animate-spin" />
            </div>
            <div className="text-xs uppercase tracking-widest text-purple-300 font-bold mb-1">
              Round {offlineRound} of {offlineTotalRounds}
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              Pass Phone To:
            </h2>
            <div className="text-3xl font-black text-amber-400 bg-slate-800/80 py-3 px-6 rounded-xl border border-amber-400/30 inline-block mb-4 shadow-inner">
              {currentPlayer}
            </div>
            <p className="text-slate-400 text-xs mb-8">
              Keep the screen hidden from other players! Lock in your secret guess.
            </p>
            <button
              onClick={() => setOfflineStep("player_action")}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-black text-white hover:brightness-110 shadow-lg transform transition-all duration-200"
            >
              I am {currentPlayer} — Show Question 🔒
            </button>
          </div>
        </div>
      );
    }

    // 3. Player Action / Answer Input Screen
    if (offlineStep === "player_action") {
      const currentPlayer = offlinePlayers[offlineCurrentTurnIndex];

      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-4 sm:p-8 flex items-center justify-center">
          <div className="max-w-lg w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                {currentPlayer}'s Turn
              </span>
              <span className="text-xs text-purple-300">
                Round {offlineRound}/{offlineTotalRounds}
              </span>
            </div>

            {offlineMode === "classic_crowd" && offlineCurrentCrowdQ && (
              <>
                <div className="mb-4">
                  <div className="text-xs font-semibold text-purple-300 mb-1">
                    👥 {offlineCurrentCrowdQ.audience}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {offlineCurrentCrowdQ.question}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  Guess which answer ranked highest (#1 = 40 pts, #2 = 30 pts, #3 = 20 pts, #4 = 10 pts):
                </p>

                <div className="space-y-2.5 mb-6">
                  {offlineCurrentCrowdQ.options.map((opt, i) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOfflinePlayerPick(opt.id)}
                      className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-purple-700/60 border border-purple-500/30 hover:border-amber-400 transition-all font-semibold text-sm flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-purple-600/50 flex items-center justify-center text-xs font-black text-amber-300">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-slate-100 group-hover:text-white">
                          {opt.text}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {offlineMode === "friends" && offlineCurrentFriendQ && (
              <>
                <div className="mb-4">
                  <div className="text-xs font-semibold text-purple-300 mb-1">
                    🎭 Friends Mode
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-amber-300">
                    {offlineCurrentFriendQ.prompt}
                  </h3>
                  {offlineCurrentFriendQ.followUp && (
                    <p className="text-xs text-slate-300 mt-1 italic">
                      "{offlineCurrentFriendQ.followUp}"
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  Vote for the friend who best fits this description:
                </p>

                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {offlinePlayers.map(target => (
                    <button
                      key={target}
                      onClick={() => handleOfflinePlayerPick(target)}
                      className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-purple-700/60 border border-purple-500/30 hover:border-amber-400 transition-all font-bold text-sm text-center text-slate-100 hover:text-white"
                    >
                      {target}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="text-center text-[11px] text-slate-500">
              Selection will be locked and saved secretly
            </div>
          </div>
        </div>
      );
    }

    // 4. Reveal Screen
    if (offlineStep === "reveal") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-4 sm:p-8 flex items-center justify-center">
          <div className="max-w-xl w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-black">
                Majority Revealed!
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {offlineMode === "classic_crowd" ? "Survey Rankings" : "Group Majority"}
              </h2>
            </div>

            {offlineMode === "classic_crowd" && offlineCurrentCrowdQ && (
              <div className="space-y-3 mb-6">
                {offlineCurrentCrowdQ.options
                  .slice()
                  .sort((a, b) => a.rank - b.rank)
                  .map(opt => {
                    const voters = Object.entries(offlineSubmissions)
                      .filter(([_, choice]) => choice === opt.id)
                      .map(([p]) => p);

                    return (
                      <div
                        key={opt.id}
                        className={`p-4 rounded-xl border ${
                          opt.rank === 1
                            ? "bg-amber-500/20 border-amber-400 text-amber-100"
                            : "bg-slate-800/80 border-slate-700 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-black ${
                                opt.rank === 1
                                  ? "bg-amber-400 text-slate-950"
                                  : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              Rank #{opt.rank}
                            </span>
                            <span className="font-bold text-base">{opt.text}</span>
                          </div>
                          <span className="text-sm font-black text-amber-400">
                            +{opt.points} pts
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                          <span>{opt.percentage}% of respondents</span>
                          <span>
                            Voters:{" "}
                            {voters.length > 0 ? (
                              <strong className="text-purple-300">{voters.join(", ")}</strong>
                            ) : (
                              "None"
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {offlineMode === "friends" && offlineCurrentFriendQ && (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-purple-900/40 border border-purple-400/40 text-center">
                  <div className="text-xs uppercase text-purple-300 font-bold mb-1">
                    Question
                  </div>
                  <div className="text-lg font-bold text-white mb-2">
                    {offlineCurrentFriendQ.prompt}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Votes Received:
                  </div>
                  {offlinePlayers.map(target => {
                    const voters = Object.entries(offlineSubmissions)
                      .filter(([_, votedFor]) => votedFor === target)
                      .map(([p]) => p);
                    return (
                      <div
                        key={target}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-sm"
                      >
                        <span className="font-bold text-white">{target}</span>
                        <div className="text-xs text-slate-300">
                          {voters.length} vote{voters.length !== 1 ? "s" : ""}{" "}
                          {voters.length > 0 && `(${voters.join(", ")})`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scoreboard Preview */}
            <div className="border-t border-slate-800 pt-4 mb-6">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                Current Leaderboard:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(offlineScores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([p, score], idx) => (
                    <div
                      key={p}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 text-xs border border-slate-750"
                    >
                      <span className="font-semibold text-slate-300">
                        #{idx + 1} {p}
                      </span>
                      <span className="font-bold text-amber-400">{score} pts</span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (offlineRound < offlineTotalRounds) {
                  startOfflineRound(offlineRound + 1);
                } else {
                  setOfflineStep("game_over");
                }
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 font-black text-white hover:brightness-110 shadow-lg transform transition-all duration-200"
            >
              {offlineRound < offlineTotalRounds ? "Next Round ➡️" : "View Final Podium 🏆"}
            </button>
          </div>
        </div>
      );
    }

    // 5. Game Over / Podium Screen
    if (offlineStep === "game_over") {
      const sorted = Object.entries(offlineScores).sort((a, b) => b[1] - a[1]);
      const winner = sorted[0];

      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-4 sm:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-slate-900/90 border border-purple-500/30 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>

            <div className="text-xs uppercase tracking-widest text-purple-300 font-bold mb-1">
              Match Champions Crowned!
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Game Over</h2>

            <div className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 rounded-xl p-5 mb-6">
              <div className="text-xs text-amber-300 uppercase font-bold">1st Place</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{winner?.[0]}</div>
              <div className="text-sm font-semibold text-slate-300">{winner?.[1]} points</div>
            </div>

            <div className="space-y-2 mb-8">
              {sorted.slice(1).map(([p, score], idx) => (
                <div
                  key={p}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm"
                >
                  <span className="font-semibold text-slate-300">
                    #{idx + 2} {p}
                  </span>
                  <span className="font-bold text-amber-400">{score} pts</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={startOfflineGame}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 font-black text-white hover:brightness-110 shadow-lg"
              >
                Play Again 🔄
              </button>
              <button
                onClick={() => setGameMode(null)}
                className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700"
              >
                Change Mode / Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // -------------------------------------------------------------------
  // RENDER: ONLINE MULTIPLAYER (SEPARATE PHONES)
  // -------------------------------------------------------------------
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Connecting to Adda Room...</h3>
          <p className="text-xs text-purple-300">Synchronizing game state with server</p>
          <button
            onClick={onBack}
            className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const {
    gamePhase,
    roundNumber,
    totalRounds,
    mode,
    category,
    timer,
    activeChaosRule,
    currentQuestion,
    players,
    revealData,
    gameWinner,
    teams
  } = gameState;

  const isHost = players.find(p => p.userId === currentUserId)?.id === players[0]?.id;
  const isFriendsMode = mode === "friends";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-4 sm:p-6 flex flex-col">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between mb-4 pb-3 border-b border-purple-500/20">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-base sm:text-xl font-black bg-gradient-to-r from-amber-300 to-pink-400 bg-clip-text text-transparent">
              What's the Majority?
            </h1>
            <span className="text-[10px] bg-purple-800/80 border border-purple-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-purple-200">
              {mode.replace("_", " ")}
            </span>
          </div>
          <div className="text-[11px] text-purple-300">
            Round {roundNumber} of {totalRounds} • {category}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-purple-500/30 px-3 py-1.5 rounded-xl shadow-inner">
          <Clock className={`w-4 h-4 ${timer <= 5 ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
          <span className={`text-xs sm:text-sm font-black ${timer <= 5 ? "text-rose-400" : "text-white"}`}>
            {timer}s
          </span>
        </div>
      </header>

      {/* Chaos Rule Banner */}
      {activeChaosRule && (
        <div className="max-w-4xl w-full mx-auto mb-4 bg-gradient-to-r from-rose-600/30 via-amber-500/20 to-purple-600/30 border border-amber-400/50 rounded-xl p-2.5 text-center shadow-lg">
          <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center space-x-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>CHAOS ROUND: {activeChaosRule.toUpperCase().replace("_", " ")}!</span>
          </span>
        </div>
      )}

      {/* Main Game Phase Container */}
      <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center">
        {/* PHASE 1: ROUND INTRO */}
        {gamePhase === "round_intro" && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-amber-300 animate-spin" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-1">
              Round {roundNumber}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-3">
              Get Ready to Vote!
            </h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              {isFriendsMode
                ? "Answer prompts about your friends in this room!"
                : "Predict what 1,000 surveyed Indians ranked as their top choice!"}
            </p>
          </div>
        )}

        {/* PHASE 2: VOTING / ANSWERING */}
        {gamePhase === "voting" && currentQuestion && (
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
            {/* Question Title */}
            <div className="mb-6">
              {isFriendsMode ? (
                <>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    👥 Friends Prompt
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {currentQuestion.prompt}
                  </h2>
                  {currentQuestion.followUp && (
                    <p className="text-xs text-purple-200 mt-1 italic">
                      "{currentQuestion.followUp}"
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-xs font-bold text-purple-300 mb-1 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>{currentQuestion.audience}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {currentQuestion.question}
                  </h2>
                </>
              )}
            </div>

            {/* Selection Options */}
            <div className="space-y-3 mb-6">
              {isFriendsMode ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {players.map(p => {
                    const isSelf = p.userId === currentUserId;
                    const isSelected = selectedOptionId === p.userId;
                    return (
                      <button
                        key={p.userId}
                        disabled={hasLockedSubmission}
                        onClick={() => setSelectedOptionId(p.userId)}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-purple-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50"
                            : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-purple-400"
                        } ${hasLockedSubmission ? "opacity-75 cursor-not-allowed" : ""}`}
                      >
                        <div className="font-bold text-sm sm:text-base">{p.name}</div>
                        {isSelf && (
                          <span className="text-[10px] text-purple-300 block mt-0.5">(You)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt: any, idx: number) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        disabled={hasLockedSubmission}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-purple-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50"
                            : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-purple-400"
                        } ${hasLockedSubmission ? "opacity-75 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-lg bg-purple-700/60 flex items-center justify-center text-xs font-black text-amber-300">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="font-semibold text-sm sm:text-base">{opt.text}</span>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-amber-300" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error Message */}
            {feedbackError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{feedbackError}</span>
              </div>
            )}

            {/* Lock In Button */}
            <button
              disabled={!selectedOptionId || hasLockedSubmission || submitting}
              onClick={handleLockInOnline}
              className={`w-full py-4 rounded-xl font-black text-base sm:text-lg shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                hasLockedSubmission
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : selectedOptionId
                  ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:brightness-110 cursor-pointer"
                  : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              }`}
            >
              {hasLockedSubmission ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-200" />
                  <span>Answer Locked! Waiting for Room...</span>
                </>
              ) : submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Lock In Answer</span>
                </>
              )}
            </button>

            {/* Room Submissions Progress */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Room Progress:</span>
                <span>
                  {players.filter(p => p.hasVoted).length} / {players.length} locked in
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {players.map(p => (
                  <div
                    key={p.userId}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 border ${
                      p.hasVoted
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-800/80 border-slate-700 text-slate-400"
                    }`}
                  >
                    <span>{p.name}</span>
                    {p.hasVoted && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3 & 4: REVEAL & ROUND RESULTS */}
        {(gamePhase === "reveal" || gamePhase === "round_results") && revealData && (
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-black">
                Majority Revealed!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {revealData.mode === "friends" ? "Group Consensus" : "Survey Rankings"}
              </h2>
            </div>

            {/* Classic Crowd Results */}
            {revealData.mode === "classic_crowd" && revealData.rankedOptions && (
              <div className="space-y-3 mb-6">
                {revealData.rankedOptions.map(opt => (
                  <div
                    key={opt.id}
                    className={`p-4 rounded-xl border transition-all ${
                      opt.rank === 1
                        ? "bg-gradient-to-r from-amber-500/20 to-purple-600/20 border-amber-400 text-amber-100 shadow-lg"
                        : "bg-slate-800/80 border-slate-700 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-black ${
                            opt.rank === 1
                              ? "bg-amber-400 text-slate-950"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          Rank #{opt.rank}
                        </span>
                        <span className="font-bold text-base sm:text-lg">{opt.text}</span>
                      </div>
                      <span className="text-base font-black text-amber-400">
                        +{opt.points} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                      <span>{opt.percentage ? `${opt.percentage}% surveyed` : ""}</span>
                      <span>
                        Voters:{" "}
                        {opt.voterNames && opt.voterNames.length > 0 ? (
                          <strong className="text-purple-300">{opt.voterNames.join(", ")}</strong>
                        ) : (
                          "None"
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Friends Mode Results */}
            {revealData.mode === "friends" && (
              <div className="space-y-4 mb-6">
                <div className="p-5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/40 text-center">
                  <div className="text-xs uppercase text-purple-300 font-bold mb-1">
                    Group Crown Goes To:
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">
                    👑 {revealData.majorityPlayerNames}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Received {revealData.maxVotes} vote{revealData.maxVotes !== 1 ? "s" : ""}
                  </div>
                </div>

                {revealData.voteDistribution && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Vote Distribution:
                    </div>
                    {revealData.voteDistribution.map(item => (
                      <div
                        key={item.userId}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-sm"
                      >
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-xs text-purple-300 font-bold">
                          {item.votes} vote{item.votes !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Round Points Summary */}
            <div className="border-t border-slate-800 pt-4 mb-6">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                Points Gained This Round:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {revealData.playerBreakdowns.map(pb => (
                  <div
                    key={pb.userId}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750 text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-300 truncate max-w-[100px]">
                      {pb.name}
                    </span>
                    <span className="font-black text-amber-400">
                      +{pb.totalRoundPoints} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Advance Controls */}
            {isHost && (
              <button
                onClick={handleNextRoundOnline}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 font-black text-white hover:brightness-110 shadow-lg text-base"
              >
                {roundNumber < totalRounds ? "Next Round ➡️" : "View Final Podium 🏆"}
              </button>
            )}

            {!isHost && (
              <div className="text-center text-xs text-slate-400 py-2">
                Waiting for host to proceed to next round...
              </div>
            )}
          </div>
        )}

        {/* PHASE 5: GAME OVER / FINAL PODIUM */}
        {gamePhase === "game_over" && (
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>

            <div className="text-xs uppercase tracking-widest text-purple-300 font-bold mb-1">
              Match Completed!
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Adda Champions</h2>

            {/* Winner Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 rounded-xl p-5 mb-6">
              <div className="text-xs text-amber-300 uppercase font-bold">1st Place</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                {gameWinner?.name || "Winner"}
              </div>
              <div className="text-sm font-semibold text-slate-300">
                {gameWinner?.score} total points
              </div>
            </div>

            {/* Full Leaderboard */}
            <div className="space-y-2 mb-8 text-left">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Final Leaderboard:
              </div>
              {players
                .slice()
                .sort((a, b) => Number(b.score) - Number(a.score))
                .map((p, idx) => (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-sm"
                  >
                    <span className="font-semibold text-slate-200">
                      #{idx + 1} {p.name}
                    </span>
                    <span className="font-bold text-amber-400">{p.score} pts</span>
                  </div>
                ))}
            </div>

            {isHost && (
              <button
                onClick={handleRestartOnline}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 font-black text-white hover:brightness-110 shadow-lg text-base"
              >
                Play Again 🔄
              </button>
            )}

            {!isHost && (
              <button
                onClick={onBack}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
              >
                Back to Home
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default WhatsTheMajority;
