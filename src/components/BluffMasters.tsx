import React, { useState, useEffect, useRef } from 'react';
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
  Loader
} from 'lucide-react';
import { socket, getUserId, getApiUrl } from '../socket';

interface Player {
  id: string;
  userId: string;
  name: string;
  score: number;
  roundScore?: number;
  connected?: boolean;
  hasAnswered?: boolean;
  hasVoted?: boolean;
}

interface AnonymousAnswer {
  id: string;
  text: string;
}

interface DiscussionMessage {
  id: string;
  userId: string;
  name: string;
  text: string;
  timestamp: string;
}

interface RevealedAnswer {
  playerId: string;
  userId: string;
  playerName: string;
  text: string;
  isBluffer: boolean;
  votesReceived: number;
  votedBy: string[];
}

interface RevealData {
  blufferUserIds: string[];
  blufferNames: string[];
  regularQuestion: string;
  blufferQuestion: string;
  category: string;
  revealedAnswers: RevealedAnswer[];
  voteCounts: Record<string, number>;
  voterBreakdown: Record<string, string[]>;
  roundWinner: 'bluffer' | 'town' | 'tie';
  roundSummary: string;
  scoreChanges: Record<string, number>;
}

interface PrivateCard {
  role: 'bluffer' | 'regular';
  isBluffer: boolean;
  question: string;
  category: string;
  difficulty: string;
  roundNumber: number;
  totalRounds: number;
  timer: number;
}

interface BluffMastersProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

export const BluffMasters: React.FC<BluffMastersProps> = ({ onBack, username, roomId }) => {
  const userId = getUserId();
  const isMultiplayer = Boolean(roomId);

  // Core Game State
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', userId, name: username || 'Player', score: 0, connected: true }
  ]);
  const [gamePhase, setGamePhase] = useState<'answering' | 'discussion' | 'voting' | 'reveal' | 'game_over'>('answering');
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [category, setCategory] = useState("All Categories");
  const [timer, setTimer] = useState(30);
  const [statusMessage, setStatusMessage] = useState("");
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  // Private Role & Question
  const [privateCard, setPrivateCard] = useState<PrivateCard | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Discussion Phase
  const [anonymousAnswers, setAnonymousAnswers] = useState<AnonymousAnswer[]>([]);
  const [discussionMessages, setDiscussionMessages] = useState<DiscussionMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Voting Phase
  const [selectedVoteTarget, setSelectedVoteTarget] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Reveal Phase
  const [revealData, setRevealData] = useState<RevealData | null>(null);

  // Connection & Error Feedback
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Determine if current player is host
  const hostPlayer = players.find(p => p.connected !== false);
  const isHost = Boolean(hostPlayer && (hostPlayer.userId === userId || players[0]?.userId === userId));

  // -------------------------------------------------------------
  // MULTIPLAYER SOCKET SYNCHRONIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Pre-fetch room players if available
    fetch(`${getApiUrl()}/api/rooms/${roomId}`)
      .then(r => r.json())
      .then(roomData => {
        if (roomData && Array.isArray(roomData.players) && roomData.players.length > 0) {
          setPlayers(prev => {
            if (prev.length <= 1) {
              return roomData.players.map((rp: any, idx: number) => ({
                id: rp.userId || rp._id || String(idx),
                userId: rp.userId,
                name: rp.name,
                score: rp.score || 0,
                connected: rp.connected !== false
              }));
            }
            return prev;
          });
        }
      })
      .catch(err => console.warn("Could not pre-fetch room:", err));

    // Join game channel
    socket.emit('joinGame', { roomId, userId }, (res: any) => {
      if (res?.error) console.warn("joinGame error:", res.error);
    });

    // Public state update handler
    const handleGameState = (payload: any) => {
      const gKey = (payload.gameKey || '').toLowerCase();
      if (gKey && !gKey.includes('bluff')) return;
      const s = payload.state || payload;
      if (!s) return;

      if (Array.isArray(s.players)) setPlayers(s.players);
      if (s.gamePhase) setGamePhase(s.gamePhase);
      if (typeof s.roundNumber === 'number') setRoundNumber(s.roundNumber);
      if (typeof s.totalRounds === 'number') setTotalRounds(s.totalRounds);
      if (s.category) setCategory(s.category);
      if (typeof s.timer === 'number') setTimer(s.timer);
      if (Array.isArray(s.anonymousAnswers)) setAnonymousAnswers(s.anonymousAnswers);
      if (Array.isArray(s.discussionMessages)) setDiscussionMessages(s.discussionMessages);
      if (s.revealData !== undefined) setRevealData(s.revealData);
      if (s.gameWinner !== undefined) setGameWinner(s.gameWinner);
      if (s.statusMessage) setStatusMessage(s.statusMessage);

      // Reset submission flags on new round
      if (s.gamePhase === 'answering') {
        const myP = s.players?.find((p: any) => p.userId === userId);
        setHasSubmittedAnswer(Boolean(myP?.hasAnswered));
        setHasVoted(false);
        setSelectedVoteTarget(null);
      }
      if (s.gamePhase === 'voting') {
        const myP = s.players?.find((p: any) => p.userId === userId);
        setHasVoted(Boolean(myP?.hasVoted));
      }
    };

    // Private role & question handler
    const handlePrivateCard = (card: PrivateCard) => {
      setPrivateCard(card);
      setHasSubmittedAnswer(false);
      setAnswerInput("");
    };

    const handlePrivateStateUpdate = (payload: any) => {
      if (payload?.bluffCard) {
        setPrivateCard(payload.bluffCard);
      }
    };

    // Timer tick handler
    const handleTimerTick = (data: { timer?: number }) => {
      if (typeof data.timer === 'number') {
        setTimer(data.timer);
      }
    };

    // Real-time chat message handler
    const handleDiscussionMsg = (msg: DiscussionMessage) => {
      setDiscussionMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on('gameStateUpdate', handleGameState);
    socket.on('privateCard', handlePrivateCard);
    socket.on('privateStateUpdate', handlePrivateStateUpdate);
    socket.on('timerTick', handleTimerTick);
    socket.on('discussionMessage', handleDiscussionMsg);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('gameStateUpdate', handleGameState);
      socket.off('privateCard', handlePrivateCard);
      socket.off('privateStateUpdate', handlePrivateStateUpdate);
      socket.off('timerTick', handleTimerTick);
      socket.off('discussionMessage', handleDiscussionMsg);
    };
  }, [isMultiplayer, roomId, userId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [discussionMessages]);

  // -------------------------------------------------------------
  // USER ACTIONS
  // -------------------------------------------------------------
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || isSubmitting || hasSubmittedAnswer) return;

    setErrorFeedback(null);
    setIsSubmitting(true);

    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'submitAnswer',
          payload: { answer: answerInput.trim(), userId }
        },
        (res: any) => {
          setIsSubmitting(false);
          if (res?.error) {
            setErrorFeedback(res.error);
          } else {
            setHasSubmittedAnswer(true);
          }
        }
      );
    } else {
      // Local fallback
      setIsSubmitting(false);
      setHasSubmittedAnswer(true);
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || gamePhase !== 'discussion') return;

    const text = chatInput.trim();
    setChatInput("");

    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'sendDiscussionMessage',
          payload: { message: text, userId }
        },
        (res: any) => {
          if (res?.error) setErrorFeedback(res.error);
        }
      );
    } else {
      setDiscussionMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          userId,
          name: username,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleStartVotingEarly = () => {
    if (!isHost || !roomId) return;
    socket.emit('gameAction', { roomId, action: 'startVoting', payload: { userId } }, (res: any) => {
      if (res?.error) setErrorFeedback(res.error);
    });
  };

  const handleSubmitVote = (targetUserId: string) => {
    if (hasVoted || gamePhase !== 'voting') return;
    if (targetUserId === userId) {
      setErrorFeedback("You cannot vote for yourself!");
      return;
    }

    setSelectedVoteTarget(targetUserId);
    setErrorFeedback(null);

    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'submitVote',
          payload: { targetUserId, userId }
        },
        (res: any) => {
          if (res?.error) {
            setErrorFeedback(res.error);
            setSelectedVoteTarget(null);
          } else {
            setHasVoted(true);
          }
        }
      );
    } else {
      setHasVoted(true);
    }
  };

  const handleNextRound = () => {
    if (!isHost || !roomId) return;
    socket.emit('gameAction', { roomId, action: 'nextRound', payload: { userId } }, (res: any) => {
      if (res?.error) setErrorFeedback(res.error);
    });
  };

  const handleRestart = () => {
    if (!isHost || !roomId) return;
    socket.emit('gameAction', { roomId, action: 'restartGame', payload: { userId } }, (res: any) => {
      if (res?.error) setErrorFeedback(res.error);
    });
  };

  // Helper counts
  const answeredCount = players.filter(p => p.hasAnswered).length;
  const connectedCount = players.filter(p => p.connected !== false).length;
  const votedCount = players.filter(p => p.hasVoted).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white pb-12">
      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-slate-300 hover:text-white"
              title="Leave Room"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎭</span>
              <div>
                <h1 className="font-extrabold text-lg sm:text-xl tracking-wide bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Bluff Masters
                </h1>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>Round {roundNumber} / {totalRounds}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-medium">{category}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Countdown Timer */}
            {gamePhase !== 'game_over' && (
              <div
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full font-mono font-bold text-sm shadow-sm border ${
                  timer <= 10
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-white/10 text-amber-300 border-white/15'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timer}s</span>
              </div>
            )}

            {/* Connection Status */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Phase Indicator Bar */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between overflow-x-auto text-xs font-semibold">
          {[
            { key: 'answering', label: '1. Secret Question', icon: '🤫' },
            { key: 'discussion', label: '2. Discussion', icon: '🗣️' },
            { key: 'voting', label: '3. Vote Bluffer', icon: '🗳️' },
            { key: 'reveal', label: '4. The Reveal', icon: '🎭' }
          ].map(phase => {
            const isActive = gamePhase === phase.key;
            return (
              <div
                key={phase.key}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md scale-105'
                    : 'text-slate-400'
                }`}
              >
                <span>{phase.icon}</span>
                <span>{phase.label}</span>
              </div>
            );
          })}
        </div>

        {/* Error Feedback Banner */}
        {errorFeedback && (
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-sm flex items-center justify-between">
            <span>⚠️ {errorFeedback}</span>
            <button onClick={() => setErrorFeedback(null)} className="text-rose-300 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 1: ANSWERING (SECRET QUESTION & INPUT)            */}
        {/* ======================================================== */}
        {gamePhase === 'answering' && (
          <div className="space-y-6">
            {/* Private Role & Question Card */}
            {privateCard ? (
              <div
                className={`rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${
                  privateCard.isBluffer
                    ? 'bg-gradient-to-br from-rose-950/80 via-purple-900/60 to-slate-900 border-rose-500/40 shadow-rose-900/30'
                    : 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500/30 shadow-indigo-950/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      privateCard.isBluffer
                        ? 'bg-rose-500 text-white shadow-lg animate-pulse'
                        : 'bg-indigo-500 text-white'
                    }`}
                  >
                    {privateCard.isBluffer ? '🎭 SECRET BLUFFER' : '🕵️ REGULAR PLAYER'}
                  </span>
                  <span className="text-xs text-slate-400 bg-white/10 px-3 py-1 rounded-full">
                    {privateCard.category}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                    {privateCard.isBluffer ? 'YOUR SECRET BLUFFER QUESTION' : 'YOUR QUESTION'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                    "{privateCard.question}"
                  </h2>
                </div>

                {/* Tactical Advice */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300 flex items-start space-x-2">
                  <span className="text-base">💡</span>
                  <div>
                    {privateCard.isBluffer ? (
                      <p>
                        <strong className="text-amber-300">Bluffer Strategy:</strong> Your question is slightly
                        different from the rest of the room! Write an answer vague or clever enough to blend in with
                        whatever their question might be.
                      </p>
                    ) : (
                      <p>
                        <strong className="text-indigo-300">Player Strategy:</strong> Answer honestly and creatively.
                        During discussion, look closely for any answer that seems slightly off-topic!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                <Loader className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
                <p className="text-slate-300">Distributing secret questions...</p>
              </div>
            )}

            {/* Answer Submission Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 shadow-xl">
              {!hasSubmittedAnswer ? (
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-2">
                      Write your answer (will be revealed anonymously):
                    </label>
                    <input
                      type="text"
                      value={answerInput}
                      onChange={e => setAnswerInput(e.target.value)}
                      placeholder="Type your witty answer here..."
                      maxLength={180}
                      autoFocus
                      disabled={isSubmitting}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base sm:text-lg"
                    />
                    <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                      <span>Max 180 characters</span>
                      <span>{answerInput.length}/180</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!answerInput.trim() || isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black text-lg shadow-lg hover:shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Lock In Answer</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-300">Answer Locked In!</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Your answer has been submitted securely. Waiting for remaining players...
                  </p>
                  <div className="inline-block px-4 py-1.5 bg-white/5 rounded-full text-xs font-semibold text-amber-300 border border-white/10">
                    {answeredCount} / {connectedCount} players ready
                  </div>
                </div>
              )}
            </div>

            {/* Live Player Status Grid */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Room Submissions ({answeredCount}/{connectedCount})</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {players.map(p => (
                  <div
                    key={p.userId}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      p.hasAnswered
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold truncate mr-2">{p.name}</span>
                    <span>{p.hasAnswered ? '✓ Ready' : 'Thinking...'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 2: DISCUSSION (ANONYMOUS ANSWERS & CHAT)          */}
        {/* ======================================================== */}
        {gamePhase === 'discussion' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg text-amber-300 flex items-center space-x-2">
                  <span>🗣️ Interrogation Time!</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Read every answer below. One player answered a completely different question. Who is it?
                </p>
              </div>

              {isHost && (
                <button
                  onClick={handleStartVotingEarly}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:shadow-lg transition whitespace-nowrap"
                >
                  Start Voting Now ➔
                </button>
              )}
            </div>

            {/* Anonymous Answer Cards */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Anonymous Answers ({anonymousAnswers.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {anonymousAnswers.map((ans, idx) => (
                  <div
                    key={ans.id}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow hover:border-amber-400/40 transition duration-150 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Answer {String.fromCharCode(65 + idx)}
                      </span>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-white italic">
                      "{ans.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Discussion Chat */}
            <div className="bg-slate-900/90 rounded-2xl border border-white/15 overflow-hidden shadow-2xl flex flex-col h-80">
              <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <span>💬</span>
                  <span>Room Discussion Chat</span>
                </span>
                <span className="text-[11px] text-slate-400">{discussionMessages.length} messages</span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2.5 text-sm">
                {discussionMessages.length === 0 ? (
                  <p className="text-slate-500 text-center py-10 text-xs italic">
                    No messages yet. Start interrogating your friends!
                  </p>
                ) : (
                  discussionMessages.map(msg => {
                    const isMe = msg.userId === userId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5 px-1">{msg.name}</span>
                        <div
                          className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow'
                              : 'bg-white/10 text-white rounded-bl-none border border-white/10'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="p-2.5 bg-white/5 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Drop your suspicions in chat..."
                  maxLength={150}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/20 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-sm disabled:opacity-50 hover:opacity-90 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 3: VOTING (ACCUSE THE BLUFFER)                     */}
        {/* ======================================================== */}
        {gamePhase === 'voting' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-indigo-500/20 border border-rose-500/30 rounded-2xl p-5 text-center space-y-1">
              <span className="text-3xl">🗳️</span>
              <h3 className="text-xl sm:text-2xl font-black text-rose-300">
                Vote for the Bluffer!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                Select the player whose answer felt suspicious or off-topic. You cannot vote for yourself.
              </p>
            </div>

            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {players.map(p => {
                const isSelf = p.userId === userId;
                const isSelected = selectedVoteTarget === p.userId;

                return (
                  <div
                    key={p.userId}
                    className={`rounded-2xl p-4 border transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg ring-2 ring-rose-500'
                        : 'bg-white/10 border-white/15 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-base truncate">
                          {p.name} {isSelf && <span className="text-xs text-slate-400">(You)</span>}
                        </div>
                        <div className="text-xs text-slate-400">Score: {p.score} pts</div>
                      </div>
                    </div>

                    <button
                      disabled={isSelf || hasVoted}
                      onClick={() => handleSubmitVote(p.userId)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                        isSelf
                          ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                          : hasVoted && isSelected
                          ? 'bg-emerald-500 text-white'
                          : hasVoted
                          ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isSelf
                        ? "Can't Vote Self"
                        : isSelected
                        ? '✓ Voted as Bluffer'
                        : hasVoted
                        ? 'Vote Locked'
                        : 'Accuse Bluffer'}
                    </button>
                  </div>
                );
              })}
            </div>

            {hasVoted && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-1">
                <p className="text-sm font-bold text-emerald-300">✓ Your vote has been recorded!</p>
                <p className="text-xs text-slate-400">
                  Waiting for other players to finish voting ({votedCount} / {connectedCount} voted)...
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 4: REVEAL (THE BIG REVEAL & ROUND SCOREBOARD)     */}
        {/* ======================================================== */}
        {gamePhase === 'reveal' && revealData && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Bluffer Revealed Banner */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900/90 via-rose-900/90 to-amber-900/90 border border-amber-400/40 shadow-2xl text-center space-y-3">
              <span className="text-4xl">🎭</span>
              <div className="text-xs font-black uppercase tracking-widest text-amber-300">
                The Bluffer Revealed!
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                {revealData.blufferNames.join(' & ')}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-amber-200 max-w-xl mx-auto">
                {revealData.roundSummary}
              </p>
            </div>

            {/* Questions Comparison Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-5 shadow">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 block mb-1">
                  Regular Question (Town)
                </span>
                <p className="text-lg font-bold text-white">
                  "{revealData.regularQuestion}"
                </p>
              </div>

              <div className="bg-rose-950/60 border border-rose-500/30 rounded-2xl p-5 shadow">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 block mb-1">
                  Bluffer's Secret Question
                </span>
                <p className="text-lg font-bold text-white">
                  "{revealData.blufferQuestion}"
                </p>
              </div>
            </div>

            {/* Revealed Answers with Authors & Votes */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Revealed Answers & Vote Breakdown
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {revealData.revealedAnswers.map(ans => (
                  <div
                    key={ans.userId}
                    className={`rounded-2xl p-4 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      ans.isBluffer
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                        : 'bg-white/10 border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-base text-white">{ans.playerName}</span>
                        {ans.isBluffer && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white">
                            Bluffer
                          </span>
                        )}
                        <span className="text-xs text-amber-300 font-semibold">
                          ({revealData.scoreChanges[ans.userId] >= 0 ? `+${revealData.scoreChanges[ans.userId]}` : revealData.scoreChanges[ans.userId]} pts)
                        </span>
                      </div>
                      <p className="text-base text-slate-200 italic font-medium">
                        "{ans.text}"
                      </p>
                    </div>

                    <div className="text-right sm:border-l sm:border-white/10 sm:pl-4 min-w-[140px]">
                      <div className="text-sm font-bold text-amber-300">
                        {ans.votesReceived} {ans.votesReceived === 1 ? 'Vote' : 'Votes'}
                      </div>
                      {ans.votedBy.length > 0 && (
                        <div className="text-[11px] text-slate-400 truncate">
                          by {ans.votedBy.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Round Controls */}
            {isHost && (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <button
                  onClick={handleNextRound}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black text-lg rounded-xl shadow-xl hover:scale-105 active:scale-95 transition"
                >
                  {roundNumber >= totalRounds ? "View Final Results 🏆" : "Next Round ➔"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 5: GAME OVER (FINAL PODIUM & WINNER)              */}
        {/* ======================================================== */}
        {gamePhase === 'game_over' && (
          <div className="space-y-6 text-center py-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-2xl text-4xl mb-4 border-2 border-white/40">
              👑
            </div>
            <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Bluff Masters Champion!
            </h2>
            <p className="text-lg text-slate-200 font-bold">
              🎉 {gameWinner || 'Everyone Played Well!'} 🎉
            </p>

            {/* Scoreboard Table */}
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Final Scoreboard</span>
              </h3>
              <div className="space-y-2">
                {players
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => (
                    <div
                      key={p.userId}
                      className={`p-3 rounded-xl border flex items-center justify-between text-sm ${
                        idx === 0
                          ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 text-center font-bold text-amber-400">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                        </span>
                        <span className="font-semibold">{p.name}</span>
                      </div>
                      <span className="font-black text-amber-300 text-base">{p.score} pts</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Host Restart Controls */}
            {isHost && (
              <div className="flex justify-center space-x-4 pt-4">
                <button
                  onClick={onBack}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition"
                >
                  Back to Games
                </button>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow hover:scale-105 active:scale-95 transition"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BluffMasters;
