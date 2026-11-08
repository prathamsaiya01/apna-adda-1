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
  Loader,
  Crown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Pause,
  Plus,
  Minus,
  RefreshCw,
  AlertCircle,
  Shuffle,
  Flame,
  MessageSquare
} from 'lucide-react';
import { socket, getUserId, getApiUrl } from '../socket';
import {
  BLUFF_CATEGORIES,
  BLUFF_MASTERS_QUESTIONS,
  BluffQuestionPair,
  getQuestionsByCategory
} from '../data/bluffMastersQuestions';

// -------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------
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

interface OfflinePlayer {
  id: number;
  name: string;
  score: number;
  roundScore: number;
  answer?: string;
  votedForId?: number | null;
}

interface BluffMastersProps {
  onBack: () => void;
  onGoToMultiplayer?: () => void;
  username: string;
  roomId?: string | null;
}

export const BluffMasters: React.FC<BluffMastersProps> = ({
  onBack,
  onGoToMultiplayer,
  username,
  roomId
}) => {
  const userId = getUserId();
  const isMultiplayer = Boolean(roomId);

  // Mode Selection: 'offline' (Pass & Play on 1 phone) | 'online' (Separate phones) | null (show chooser)
  const [gameMode, setGameMode] = useState<'offline' | 'online' | null>(
    isMultiplayer ? 'online' : null
  );

  // =============================================================
  // OFFLINE PASS & PLAY STATE (ALL PLAYERS TOGETHER ON ONE PHONE)
  // =============================================================
  const [offlinePlayerNames, setOfflinePlayerNames] = useState<string[]>([
    username || 'Player 1',
    'Player 2',
    'Player 3',
    'Player 4'
  ]);
  const [offlineCategory, setOfflineCategory] = useState<string>('All Categories');
  const [offlineTotalRounds, setOfflineTotalRounds] = useState<number>(3);
  const [offlineRoundNumber, setOfflineRoundNumber] = useState<number>(1);
  const [offlineStep, setOfflineStep] = useState<
    'setup' | 'pass_phone' | 'answering' | 'discussion' | 'pass_vote' | 'reveal' | 'game_over'
  >('setup');

  const [offlinePlayers, setOfflinePlayers] = useState<OfflinePlayer[]>([]);
  const [offlineBlufferId, setOfflineBlufferId] = useState<number>(0);
  const [offlineCurrentTurnIndex, setOfflineCurrentTurnIndex] = useState<number>(0);
  const [offlineCurrentVoterIndex, setOfflineCurrentVoterIndex] = useState<number>(0);
  const [offlineCurrentQuestion, setOfflineCurrentQuestion] = useState<BluffQuestionPair | null>(null);
  const [offlineUsedQuestionIds, setOfflineUsedQuestionIds] = useState<Set<number>>(new Set());
  const [offlineTempAnswer, setOfflineTempAnswer] = useState<string>('');
  const [offlineDiscussionTimer, setOfflineDiscussionTimer] = useState<number>(60);
  const [offlineTimerActive, setOfflineTimerActive] = useState<boolean>(false);
  const [offlineShuffledAnswers, setOfflineShuffledAnswers] = useState<Array<{ id: number; text: string; playerId: number }>>([]);
  const [offlineRevealResult, setOfflineRevealResult] = useState<{
    blufferId: number;
    blufferName: string;
    regularQuestion: string;
    blufferQuestion: string;
    roundWinner: 'bluffer' | 'town';
    roundSummary: string;
    voteCounts: Record<number, number>;
    votersFor: Record<number, string[]>;
  } | null>(null);

  // =============================================================
  // ONLINE MULTIPLAYER STATE (ROOM REQUIRED)
  // =============================================================
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', userId, name: username || 'Player', score: 0, connected: true }
  ]);
  const [gamePhase, setGamePhase] = useState<'answering' | 'discussion' | 'voting' | 'reveal' | 'game_over'>('answering');
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [category, setCategory] = useState('All Categories');
  const [timer, setTimer] = useState(30);
  const [statusMessage, setStatusMessage] = useState('');
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  // Private Role & Question
  const [privateCard, setPrivateCard] = useState<PrivateCard | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Discussion Phase (Online)
  const [anonymousAnswers, setAnonymousAnswers] = useState<AnonymousAnswer[]>([]);
  const [discussionMessages, setDiscussionMessages] = useState<DiscussionMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Voting Phase (Online)
  const [selectedVoteTarget, setSelectedVoteTarget] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Reveal Phase (Online)
  const [revealData, setRevealData] = useState<RevealData | null>(null);

  // Connection & Error Feedback
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const hostPlayer = players.find(p => p.connected !== false);
  const isHost = Boolean(hostPlayer && (hostPlayer.userId === userId || players[0]?.userId === userId));

  // -------------------------------------------------------------
  // ONLINE SOCKET LIFECYCLE
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Fetch existing room players
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
      .catch(err => console.warn('Could not pre-fetch room:', err));

    // Join room's game socket channel
    socket.emit('joinGame', { roomId, userId }, (res: any) => {
      if (res?.error) console.warn('joinGame error:', res.error);
    });

    // Proactively request private card in case of reload
    socket.emit(
      'gameAction',
      {
        roomId,
        action: 'getPrivateCard',
        payload: { userId }
      },
      (res: any) => {
        if (res?.card) {
          setPrivateCard(res.card);
        }
      }
    );

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

    const handlePrivateCard = (card: PrivateCard) => {
      setPrivateCard(card);
      setHasSubmittedAnswer(false);
      setAnswerInput('');
    };

    const handlePrivateStateUpdate = (payload: any) => {
      if (payload?.bluffCard) {
        setPrivateCard(payload.bluffCard);
      }
    };

    const handleTimerTick = (data: { timer?: number }) => {
      if (typeof data.timer === 'number') {
        setTimer(data.timer);
      }
    };

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

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [discussionMessages]);

  // Offline discussion timer tick
  useEffect(() => {
    if (gameMode !== 'offline' || offlineStep !== 'discussion' || !offlineTimerActive) return;

    const interval = setInterval(() => {
      setOfflineDiscussionTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setOfflineTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, offlineStep, offlineTimerActive]);

  // -------------------------------------------------------------
  // OFFLINE PASS & PLAY GAME ENGINE
  // -------------------------------------------------------------
  const startOfflineGame = () => {
    const validNames = offlinePlayerNames.filter(n => n.trim().length > 0);
    if (validNames.length < 3) {
      alert('Bluff Masters requires at least 3 players to spot the secret Bluffer!');
      return;
    }

    const initialPlayers: OfflinePlayer[] = validNames.map((name, idx) => ({
      id: idx,
      name: name.trim(),
      score: 0,
      roundScore: 0,
      answer: '',
      votedForId: null
    }));

    setOfflinePlayers(initialPlayers);
    setOfflineRoundNumber(1);
    setOfflineUsedQuestionIds(new Set());
    startOfflineRound(initialPlayers, 1, new Set());
  };

  const startOfflineRound = (
    currentPlayers: OfflinePlayer[],
    roundNum: number,
    usedIds: Set<number>
  ) => {
    // 1. Pick an unused question from category
    const pool = getQuestionsByCategory(offlineCategory);
    let available = pool.filter(q => !usedIds.has(q.id));
    if (available.length === 0) {
      available = pool; // reset pool if exhausted
    }
    const chosen = available[Math.floor(Math.random() * available.length)];
    const newUsedIds = new Set(usedIds);
    newUsedIds.add(chosen.id);
    setOfflineUsedQuestionIds(newUsedIds);
    setOfflineCurrentQuestion(chosen);

    // 2. Pick a random Bluffer among players
    const blufferIdx = Math.floor(Math.random() * currentPlayers.length);
    setOfflineBlufferId(blufferIdx);

    // 3. Reset player round state
    const resetPlayers = currentPlayers.map(p => ({
      ...p,
      roundScore: 0,
      answer: '',
      votedForId: null
    }));
    setOfflinePlayers(resetPlayers);

    // 4. Begin turn loop with Player 0
    setOfflineCurrentTurnIndex(0);
    setOfflineTempAnswer('');
    setOfflineStep('pass_phone');
  };

  const handleOfflineLockAnswer = () => {
    if (!offlineTempAnswer.trim()) return;

    // Save answer
    const updated = [...offlinePlayers];
    updated[offlineCurrentTurnIndex].answer = offlineTempAnswer.trim();
    setOfflinePlayers(updated);
    setOfflineTempAnswer('');

    // If next player exists, pass phone
    if (offlineCurrentTurnIndex + 1 < offlinePlayers.length) {
      setOfflineCurrentTurnIndex(offlineCurrentTurnIndex + 1);
      setOfflineStep('pass_phone');
    } else {
      // All answered! Transition to discussion
      const shuffled = updated
        .map(p => ({ id: p.id, text: p.answer || '', playerId: p.id }))
        .sort(() => Math.random() - 0.5);

      setOfflineShuffledAnswers(shuffled);
      setOfflineDiscussionTimer(60);
      setOfflineTimerActive(true);
      setOfflineStep('discussion');
    }
  };

  const handleStartOfflineVoting = () => {
    setOfflineTimerActive(false);
    setOfflineCurrentVoterIndex(0);
    setOfflineStep('pass_vote');
  };

  const handleOfflineCastVote = (targetPlayerId: number) => {
    const updated = [...offlinePlayers];
    updated[offlineCurrentVoterIndex].votedForId = targetPlayerId;
    setOfflinePlayers(updated);

    if (offlineCurrentVoterIndex + 1 < offlinePlayers.length) {
      setOfflineCurrentVoterIndex(offlineCurrentVoterIndex + 1);
    } else {
      // All votes cast! Calculate results
      resolveOfflineRound(updated);
    }
  };

  const resolveOfflineRound = (finalPlayers: OfflinePlayer[]) => {
    const voteCounts: Record<number, number> = {};
    const votersFor: Record<number, string[]> = {};

    finalPlayers.forEach(p => {
      voteCounts[p.id] = 0;
      votersFor[p.id] = [];
    });

    finalPlayers.forEach(p => {
      if (p.votedForId !== null && p.votedForId !== undefined) {
        voteCounts[p.votedForId] = (voteCounts[p.votedForId] || 0) + 1;
        votersFor[p.votedForId].push(p.name);
      }
    });

    // Find highest votes
    let maxVotes = 0;
    for (const pid in voteCounts) {
      if (voteCounts[pid] > maxVotes) maxVotes = voteCounts[pid];
    }

    const mostVoted = Object.keys(voteCounts)
      .map(Number)
      .filter(pid => voteCounts[pid] === maxVotes);

    const blufferPlayer = finalPlayers[offlineBlufferId];
    const blufferName = blufferPlayer ? blufferPlayer.name : 'The Bluffer';
    const blufferCaught = mostVoted.length === 1 && mostVoted[0] === offlineBlufferId && maxVotes > 0;
    const blufferVotes = voteCounts[offlineBlufferId] || 0;

    let roundWinner: 'bluffer' | 'town' = 'bluffer';
    let roundSummary = '';

    const scoreDeltas: Record<number, number> = {};
    finalPlayers.forEach(p => {
      scoreDeltas[p.id] = 0;
    });

    if (blufferCaught) {
      roundWinner = 'town';
      scoreDeltas[offlineBlufferId] += 1; // +1 consolation
      finalPlayers.forEach(p => {
        if (p.id !== offlineBlufferId && p.votedForId === offlineBlufferId) {
          scoreDeltas[p.id] += 2; // +2 for catching
        }
      });
      roundSummary = `🎯 Busted! ${blufferName} was caught by the group! (+2 pts to correct voters, +1 pt to Bluffer).`;
    } else {
      roundWinner = 'bluffer';
      if (blufferVotes === 0) {
        scoreDeltas[offlineBlufferId] += 5; // Fooled everyone
        roundSummary = `🎭 Masterclass Bluff! ${blufferName} fooled EVERYONE with 0 votes! (+5 pts).`;
      } else {
        scoreDeltas[offlineBlufferId] += 3; // Survived
        roundSummary = `🎉 Escaped! ${blufferName} survived the vote! (+3 pts).`;
      }
      finalPlayers.forEach(p => {
        if (p.id !== offlineBlufferId && p.votedForId === offlineBlufferId) {
          scoreDeltas[p.id] += 2;
        }
      });
    }

    // Apply scores
    const scoredPlayers = finalPlayers.map(p => ({
      ...p,
      roundScore: scoreDeltas[p.id] || 0,
      score: p.score + (scoreDeltas[p.id] || 0)
    }));
    setOfflinePlayers(scoredPlayers);

    setOfflineRevealResult({
      blufferId: offlineBlufferId,
      blufferName,
      regularQuestion: offlineCurrentQuestion?.regularQuestion || '',
      blufferQuestion: offlineCurrentQuestion?.blufferQuestion || '',
      roundWinner,
      roundSummary,
      voteCounts,
      votersFor
    });

    setOfflineStep('reveal');
  };

  const handleNextOfflineRound = () => {
    if (offlineRoundNumber >= offlineTotalRounds) {
      setOfflineStep('game_over');
    } else {
      const nextRound = offlineRoundNumber + 1;
      setOfflineRoundNumber(nextRound);
      startOfflineRound(offlinePlayers, nextRound, offlineUsedQuestionIds);
    }
  };

  // Add / Remove offline players
  const handleAddPlayer = () => {
    if (offlinePlayerNames.length < 10) {
      setOfflinePlayerNames([...offlinePlayerNames, `Player ${offlinePlayerNames.length + 1}`]);
    }
  };

  const handleRemovePlayer = (idx: number) => {
    if (offlinePlayerNames.length > 3) {
      setOfflinePlayerNames(offlinePlayerNames.filter((_, i) => i !== idx));
    }
  };

  // -------------------------------------------------------------
  // ONLINE ACTIONS
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
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'sendDiscussionMessage',
          payload: { message: chatInput.trim(), userId }
        },
        (res: any) => {
          if (res?.error) setErrorFeedback(res.error);
        }
      );
    }
    setChatInput('');
  };

  const handleStartVotingEarly = () => {
    if (!isHost || !roomId) return;
    socket.emit(
      'gameAction',
      {
        roomId,
        action: 'startVoting',
        payload: { userId }
      },
      (res: any) => {
        if (res?.error) setErrorFeedback(res.error);
      }
    );
  };

  const handleVoteForPlayer = (targetUserId: string) => {
    if (hasVoted || targetUserId === userId || !roomId) return;

    setSelectedVoteTarget(targetUserId);
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
        } else {
          setHasVoted(true);
        }
      }
    );
  };

  const handleNextRound = () => {
    if (!isHost || !roomId) return;
    socket.emit(
      'gameAction',
      {
        roomId,
        action: 'nextRound',
        payload: { userId }
      },
      (res: any) => {
        if (res?.error) setErrorFeedback(res.error);
      }
    );
  };

  const handleRestart = () => {
    if (!isHost || !roomId) return;
    socket.emit(
      'gameAction',
      {
        roomId,
        action: 'restartGame',
        payload: { userId }
      },
      (res: any) => {
        if (res?.error) setErrorFeedback(res.error);
      }
    );
  };

  // =============================================================
  // VIEW 1: MODE SELECTION MODAL (WHEN NO ROOM SPECIFIED)
  // =============================================================
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
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" /> Apna Adda Party
          </div>
        </header>

        <main className="max-w-2xl mx-auto w-full my-auto text-center space-y-8 py-8">
          <div className="space-y-3">
            <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 border border-amber-500/30 shadow-2xl shadow-amber-950/60 text-amber-400">
              <span className="text-5xl">🎭</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              BLUFF MASTERS
            </h1>
            <p className="text-slate-300 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
              One secret Bluffer receives a slightly different question. Everyone answers anonymously. Can you deduce the impostor?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            {/* Mode 1: Pass & Play (All Players Together on 1 Phone) */}
            <div
              onClick={() => setGameMode('offline')}
              className="group cursor-pointer p-6 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-400 transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-amber-950/50 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Users className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  In-Person / House Party
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition">
                  Pass & Play (1 Phone)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sitting together with friends? Pass one device around to see secret questions, submit witty answers, and debate out loud!
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                Play on This Phone <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Mode 2: Online Multiplayer (Separate Phones) */}
            <div
              onClick={() => {
                if (onGoToMultiplayer) {
                  onGoToMultiplayer();
                } else {
                  setGameMode('online');
                }
              }}
              className="group cursor-pointer p-6 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-purple-500/30 hover:border-purple-400 transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-purple-950/50 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Wifi className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Separate Devices
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                  Online Multiplayer
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Play with friends across separate phones using a 4-letter room code. Real-time synchronized chat, private cards, and voting!
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
                Join / Create Room <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-500 py-2">
          3 to 10 players • 100+ Curated Question Pairs • Anti-Cheat Role Isolation
        </footer>
      </div>
    );
  }

  // =============================================================
  // VIEW 2: ONLINE MODE BUT ROOM NOT YET CREATED
  // =============================================================
  if (gameMode === 'online' && !roomId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between items-center text-center">
        <header className="max-w-md w-full flex items-center justify-between">
          <button
            onClick={() => setGameMode(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <span>🎭</span> Online Bluff Masters
          </div>
        </header>

        <main className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Crown className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Online Multiplayer Room</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              To play Online Bluff Masters across multiple phones, create or join a room in the Multiplayer Rooms tab!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (onGoToMultiplayer) onGoToMultiplayer();
                else onBack();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-sm shadow-lg transition"
            >
              Open Multiplayer Rooms
            </button>
            <button
              onClick={() => setGameMode('offline')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition"
            >
              Play Pass & Play (1 Phone) Instead
            </button>
          </div>
        </main>

        <div className="text-xs text-slate-600">Apna Adda PocketParty</div>
      </div>
    );
  }

  // =============================================================
  // VIEW 3: OFFLINE PASS & PLAY (1 PHONE PARTY MODE)
  // =============================================================
  if (gameMode === 'offline') {
    // -----------------------------------------------------------
    // STEP 3.1: SETUP (3-10 PLAYERS, CATEGORY, ROUNDS)
    // -----------------------------------------------------------
    if (offlineStep === 'setup') {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col justify-between">
          <header className="max-w-2xl mx-auto w-full flex items-center justify-between">
            <button
              onClick={() => setGameMode(null)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Switch Mode
            </button>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>🎭</span> Pass & Play Setup
            </div>
          </header>

          <main className="max-w-xl mx-auto w-full my-auto space-y-6 py-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Party Players (3–10)</h2>
              <p className="text-xs text-slate-400">
                Enter everyone's name who is playing together in the room:
              </p>
            </div>

            {/* Player Names Input List */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/10 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-sm font-semibold mb-2">
                <span className="text-slate-300">Players ({offlinePlayerNames.length}):</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddPlayer}
                    disabled={offlinePlayerNames.length >= 10}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Player
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {offlinePlayerNames.map((pName, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-bold text-amber-400">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={pName}
                      onChange={e => {
                        const updated = [...offlinePlayerNames];
                        updated[idx] = e.target.value;
                        setOfflinePlayerNames(updated);
                      }}
                      placeholder={`Player ${idx + 1}`}
                      maxLength={20}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {offlinePlayerNames.length > 3 && (
                      <button
                        onClick={() => handleRemovePlayer(idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Category Picker */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Question Category:
              </label>
              <select
                value={offlineCategory}
                onChange={e => setOfflineCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/20 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {BLUFF_CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Rounds Selector */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Rounds to Play</div>
                <div className="text-xs text-slate-400">Select total rounds for this match</div>
              </div>
              <div className="flex gap-2">
                {[3, 5, 7].map(r => (
                  <button
                    key={r}
                    onClick={() => setOfflineTotalRounds(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      offlineTotalRounds === r
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {r} Rounds
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startOfflineGame}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Party Game</span>
            </button>
          </main>

          <footer className="text-center text-xs text-slate-500">
            Pass the phone privately to each player • All answers will be revealed anonymously
          </footer>
        </div>
      );
    }

    // -----------------------------------------------------------
    // STEP 3.2: PASS PHONE COVER (PRIVACY SCREEN)
    // -----------------------------------------------------------
    if (offlineStep === 'pass_phone') {
      const activePlayer = offlinePlayers[offlineCurrentTurnIndex];
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>🎭</span> Round {offlineRoundNumber} of {offlineTotalRounds}
          </div>

          <main className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Pass the phone to:
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                {activePlayer ? activePlayer.name : 'Next Player'}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              ⚠️ <strong>Privacy Guard:</strong> Make sure nobody else is looking at the screen before tapping below.
            </div>

            <button
              onClick={() => setOfflineStep('answering')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
            >
              I am {activePlayer?.name} — Reveal My Question 🔓
            </button>
          </main>

          <div className="text-xs text-slate-600">Player {offlineCurrentTurnIndex + 1} of {offlinePlayers.length}</div>
        </div>
      );
    }

    // -----------------------------------------------------------
    // STEP 3.3: PRIVATE QUESTION & ANSWER (OFFLINE)
    // -----------------------------------------------------------
    if (offlineStep === 'answering') {
      const activePlayer = offlinePlayers[offlineCurrentTurnIndex];
      const isBluffer = offlineCurrentTurnIndex === offlineBlufferId;
      const questionText = isBluffer
        ? offlineCurrentQuestion?.blufferQuestion
        : offlineCurrentQuestion?.regularQuestion;

      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 flex flex-col justify-between">
          <header className="max-w-lg mx-auto w-full flex items-center justify-between">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Round {offlineRoundNumber}/{offlineTotalRounds}
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full text-slate-300">
              Player: <span className="text-white font-bold">{activePlayer?.name}</span>
            </div>
          </header>

          <main className="max-w-lg mx-auto w-full my-auto space-y-5 py-4">
            {/* Secret Role Badge */}
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isBluffer
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
              }`}
            >
              <div className="text-2xl">{isBluffer ? '🎭' : '🔍'}</div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider">
                  {isBluffer ? 'You are the Secret Bluffer!' : 'You are a Regular Player!'}
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">
                  {isBluffer
                    ? 'Your question is slightly different. Blend in with clever answers!'
                    : 'Answer truthfully. Look out for any weird answers during discussion!'}
                </div>
              </div>
            </div>

            {/* Secret Question Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-white/15 shadow-2xl space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>{offlineCurrentQuestion?.category}</span>
                <span className="text-slate-400 text-[10px]">SECRET QUESTION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                "{questionText}"
              </h2>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Write your witty answer:
              </label>
              <input
                type="text"
                value={offlineTempAnswer}
                onChange={e => setOfflineTempAnswer(e.target.value)}
                placeholder="Type your answer here..."
                maxLength={180}
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Will be revealed anonymously</span>
                <span>{offlineTempAnswer.length}/180</span>
              </div>

              <button
                onClick={handleOfflineLockAnswer}
                disabled={!offlineTempAnswer.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-40 flex items-center justify-center space-x-2"
              >
                <Lock className="w-5 h-5" />
                <span>Lock In & Hide Answer</span>
              </button>
            </div>
          </main>

          <footer className="text-center text-xs text-slate-600">
            Your answer will be hidden before passing to the next player
          </footer>
        </div>
      );
    }

    // -----------------------------------------------------------
    // STEP 3.4: DISCUSSION PHASE (PHONE IN CENTER OF TABLE)
    // -----------------------------------------------------------
    if (offlineStep === 'discussion') {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 flex flex-col justify-between">
          <header className="max-w-3xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>🗣️</span> Discussion Time
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOfflineTimerActive(!offlineTimerActive)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs"
              >
                {offlineTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <div
                className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                  offlineDiscussionTimer <= 10
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-white/10 text-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{offlineDiscussionTimer}s</span>
              </div>
              <button
                onClick={() => setOfflineDiscussionTimer(t => t + 30)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-300 font-semibold"
              >
                +30s
              </button>
            </div>
          </header>

          <main className="max-w-2xl mx-auto w-full my-auto space-y-6 py-4">
            <div className="text-center space-y-1">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                📱 Put Phone in Center of Table
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Anonymous Answers Revealed!
              </h2>
              <p className="text-xs text-slate-400">
                One of these answers answered a DIFFERENT question! Interrogate everyone!
              </p>
            </div>

            {/* Shuffled Anonymous Answers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {offlineShuffledAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900 border border-white/15 shadow-lg space-y-1 hover:border-amber-500/40 transition"
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Answer #{idx + 1}
                  </div>
                  <p className="text-base text-slate-100 font-semibold italic">
                    "{item.text}"
                  </p>
                </div>
              ))}
            </div>

            {/* Interrogation Prompts */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-2">
              <span className="text-base">💡</span>
              <div>
                <strong>Discussion Advice:</strong> Ask each other to explain their logic. Does someone's answer seem suspiciously vague, completely off-topic, or strangely specific?
              </div>
            </div>

            <button
              onClick={handleStartOfflineVoting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center space-x-2"
            >
              <span>Everyone Ready? Proceed to Voting ➔</span>
            </button>
          </main>

          <footer className="text-center text-xs text-slate-600">
            Category: {offlineCurrentQuestion?.category}
          </footer>
        </div>
      );
    }

    // -----------------------------------------------------------
    // STEP 3.5: SECRET BALLOT VOTING (OFFLINE PASS & PLAY)
    // -----------------------------------------------------------
    if (offlineStep === 'pass_vote') {
      const activeVoter = offlinePlayers[offlineCurrentVoterIndex];
      const eligibleTargets = offlinePlayers.filter(p => p.id !== activeVoter?.id);

      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Secret Voting ({offlineCurrentVoterIndex + 1}/{offlinePlayers.length})
          </div>

          <main className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Pass phone to:
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {activeVoter?.name}
              </h2>
              <p className="text-xs text-slate-400">
                Who do you suspect is the secret Bluffer?
              </p>
            </div>

            <div className="space-y-2">
              {eligibleTargets.map(target => (
                <button
                  key={target.id}
                  onClick={() => handleOfflineCastVote(target.id)}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400 text-left flex items-center justify-between transition group"
                >
                  <span className="font-bold text-sm text-slate-200 group-hover:text-white">
                    {target.name}
                  </span>
                  <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                    Vote Bluffer ➔
                  </span>
                </button>
              ))}
            </div>
          </main>

          <div className="text-xs text-slate-600">Your vote is completely secret!</div>
        </div>
      );
    }

    // -----------------------------------------------------------
    // STEP 3.6: THE DRAMATIC REVEAL (OFFLINE)
    // -----------------------------------------------------------
    if (offlineStep === 'reveal' && offlineRevealResult) {
      const {
        blufferName,
        regularQuestion,
        blufferQuestion,
        roundWinner,
        roundSummary,
        voteCounts,
        votersFor
      } = offlineRevealResult;

      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 flex flex-col justify-between">
          <header className="max-w-3xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>🎭</span> Round {offlineRoundNumber} Results
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full text-slate-300">
              {offlineRoundNumber >= offlineTotalRounds ? 'Final Round' : `Round ${offlineRoundNumber}/${offlineTotalRounds}`}
            </div>
          </header>

          <main className="max-w-3xl mx-auto w-full my-auto space-y-6 py-6 animate-in fade-in duration-300">
            {/* Bluffer Announcement Banner */}
            <div
              className={`p-6 rounded-3xl border text-center space-y-2 shadow-2xl ${
                roundWinner === 'town'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}
            >
              <div className="text-4xl">{roundWinner === 'town' ? '🎯' : '🎭'}</div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {roundWinner === 'town'
                  ? `BUSTED! ${blufferName} WAS THE BLUFFER!`
                  : `BLUFFER ESCAPED! ${blufferName} FOOLED THE GROUP!`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {roundSummary}
              </p>
            </div>

            {/* Questions Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  📌 Regular Players' Question
                </div>
                <p className="text-sm font-bold text-white">
                  "{regularQuestion}"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                  🎭 Bluffer's Secret Question
                </div>
                <p className="text-sm font-bold text-white">
                  "{blufferQuestion}"
                </p>
              </div>
            </div>

            {/* Full Answer Authorship & Votes Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Answers, Authors & Votes:
              </h3>
              <div className="space-y-2.5">
                {offlinePlayers.map(p => {
                  const isBluffer = p.id === offlineBlufferId;
                  const votes = voteCounts[p.id] || 0;
                  const voters = votersFor[p.id] || [];

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isBluffer
                          ? 'bg-rose-950/30 border-rose-500/40 ring-1 ring-rose-500/30'
                          : 'bg-slate-900 border-white/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{p.name}</span>
                          {isBluffer && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white">
                              Bluffer
                            </span>
                          )}
                          <span className="text-xs font-bold text-amber-400">
                            (+{p.roundScore} pts)
                          </span>
                        </div>
                        <p className="text-sm text-slate-200 italic font-medium">
                          "{p.answer}"
                        </p>
                      </div>

                      <div className="text-right sm:border-l sm:border-white/10 sm:pl-4 min-w-[120px]">
                        <div className="text-xs font-bold text-amber-300">
                          {votes} {votes === 1 ? 'Vote' : 'Votes'}
                        </div>
                        {voters.length > 0 && (
                          <div className="text-[10px] text-slate-400">
                            by {voters.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Scoreboard */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Standings:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {offlinePlayers
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-300 truncate">
                        {idx + 1}. {p.name}
                      </span>
                      <span className="font-black text-amber-400">{p.score} pts</span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={handleNextOfflineRound}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition"
            >
              {offlineRoundNumber >= offlineTotalRounds
                ? 'View Final Results 🏆'
                : `Next Round (${offlineRoundNumber + 1}/${offlineTotalRounds}) ➔`}
            </button>
          </main>

          <footer className="text-center text-xs text-slate-600">Apna Adda PocketParty</footer>
        </div>
      );
    }

    // -----------------------------------------------------------
    // STEP 3.7: FINAL PODIUM & GAME OVER (OFFLINE)
    // -----------------------------------------------------------
    if (offlineStep === 'game_over') {
      const sorted = [...offlinePlayers].sort((a, b) => b.score - a.score);
      const winner = sorted[0];

      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Party Completed!
          </div>

          <main className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-4xl shadow-2xl border-2 border-white/40">
              👑
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Bluff Masters Champion!
              </h2>
              <p className="text-xl font-bold text-white">
                🎉 {winner ? winner.name : 'Everyone'} Wins! 🎉
              </p>
            </div>

            {/* Scoreboard List */}
            <div className="space-y-2 text-left">
              {sorted.map((p, idx) => (
                <div
                  key={p.id}
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
                    <span>{p.name}</span>
                  </div>
                  <span className="font-black text-amber-300">{p.score} pts</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const resetScores = offlinePlayers.map(p => ({
                    ...p,
                    score: 0,
                    roundScore: 0,
                    answer: '',
                    votedForId: null
                  }));
                  setOfflinePlayers(resetScores);
                  setOfflineRoundNumber(1);
                  setOfflineUsedQuestionIds(new Set());
                  startOfflineRound(resetScores, 1, new Set());
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-sm shadow hover:scale-105 active:scale-95 transition"
              >
                Play Again
              </button>
              <button
                onClick={() => setOfflineStep('setup')}
                className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition"
              >
                New Setup
              </button>
            </div>
          </main>

          <button
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-white transition"
          >
            ← Back to Adda
          </button>
        </div>
      );
    }
  }

  // =============================================================
  // VIEW 4: ONLINE MULTIPLAYER GAMEPLAY (ROOM CONNECTED)
  // =============================================================
  const answeredCount = players.filter(p => p.hasAnswered).length;
  const connectedCount = players.filter(p => p.connected !== false).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-neutral-950 text-white flex flex-col justify-between p-3 sm:p-6">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            title="Leave Game"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎭</span>
              <h1 className="text-xl font-black text-amber-400 tracking-wide">
                Bluff Masters
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Round {roundNumber} / {totalRounds} • {category}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow ${
              timer <= 10
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse'
                : 'bg-white/10 text-amber-300 border border-white/15'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timer}s</span>
          </div>

          <div
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isConnected ? 'Live' : 'Connecting...'}</span>
          </div>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="max-w-4xl mx-auto w-full my-auto py-4 sm:py-6">
        {/* Error Feedback Banner */}
        {errorFeedback && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center justify-between">
            <span>{errorFeedback}</span>
            <button onClick={() => setErrorFeedback(null)} className="text-xs underline ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Phase Navigation Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-6 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <div
            className={`py-2 px-1 rounded-xl transition ${
              gamePhase === 'answering'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            1. Secret Question
          </div>
          <div
            className={`py-2 px-1 rounded-xl transition ${
              gamePhase === 'discussion'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            2. Discussion
          </div>
          <div
            className={`py-2 px-1 rounded-xl transition ${
              gamePhase === 'voting'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            3. Vote Bluffer
          </div>
          <div
            className={`py-2 px-1 rounded-xl transition ${
              gamePhase === 'reveal'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            4. The Reveal
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHASE 1: ANSWERING (PRIVATE QUESTION DELIVERY)           */}
        {/* ======================================================== */}
        {gamePhase === 'answering' && (
          <div className="space-y-6">
            {privateCard ? (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative overflow-hidden">
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 border ${
                    privateCard.isBluffer
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}
                >
                  <span>{privateCard.isBluffer ? '🎭 Secret Role: BLUFFER' : '🔍 Secret Role: REGULAR PLAYER'}</span>
                </div>

                <div className="space-y-2 mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Your Secret Question:
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                    "{privateCard.question}"
                  </h2>
                </div>

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
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold truncate">{p.name}</span>
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
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center space-x-2">
                    <span>🗣️</span>
                    <span>Anonymous Answers</span>
                  </h2>
                  <p className="text-xs text-slate-300">
                    One answer was written for a completely different question! Spot the imposter.
                  </p>
                </div>
                {isHost && (
                  <button
                    onClick={handleStartVotingEarly}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1 shadow"
                  >
                    <span>Proceed to Vote</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {anonymousAnswers.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 shadow hover:border-amber-500/40 transition group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                      <span className="text-amber-400 uppercase tracking-wider">Answer #{idx + 1}</span>
                      <span className="text-[10px] text-slate-500">Anonymous</span>
                    </div>
                    <p className="text-base text-slate-100 font-medium italic group-hover:text-white transition">
                      "{item.text}"
                    </p>
                  </div>
                ))}
              </div>

              {/* Live Room Discussion Chat */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Room Interrogation Chat</span>
                </h3>

                <div className="h-44 overflow-y-auto bg-slate-950/60 rounded-xl p-3 border border-white/10 space-y-2 mb-3">
                  {discussionMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                      Interrogate each other! Ask why someone gave that specific answer.
                    </div>
                  ) : (
                    discussionMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`text-xs ${
                          msg.userId === userId ? 'text-amber-300' : 'text-slate-300'
                        }`}
                      >
                        <strong className="font-bold text-white mr-1.5">{msg.name}:</strong>
                        <span>{msg.text}</span>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Accuse a suspect or defend your answer..."
                    maxLength={140}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 3: VOTING (ACCUSE THE SUSPECTED BLUFFER)           */}
        {/* ======================================================== */}
        {gamePhase === 'voting' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Who is the Secret Bluffer?
              </h2>
              <p className="text-sm text-slate-300">
                Cast your vote for the player whose answer sounded out-of-place!
              </p>
            </div>

            {/* Voting Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {players.map(p => {
                const isSelf = p.userId === userId;
                const isTarget = selectedVoteTarget === p.userId;

                return (
                  <button
                    key={p.userId}
                    disabled={isSelf || hasVoted}
                    onClick={() => handleVoteForPlayer(p.userId)}
                    className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between space-y-3 ${
                      isSelf
                        ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                        : isTarget
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xl scale-[1.02]'
                        : 'bg-white/10 border-white/15 hover:bg-white/20 hover:border-amber-400 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-base truncate">{p.name}</span>
                      {isSelf && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-400">
                          You
                        </span>
                      )}
                      {isTarget && (
                        <CheckCircle className="w-5 h-5 text-slate-950 fill-current" />
                      )}
                    </div>

                    <div className="text-xs font-semibold flex items-center justify-between w-full opacity-80">
                      <span>{p.score} pts</span>
                      <span>{isSelf ? 'Cannot vote self' : hasVoted ? (isTarget ? 'Voted' : 'Locked') : 'Tap to accuse'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {hasVoted && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-emerald-300 text-sm font-semibold">
                ✓ Vote registered! Waiting for remaining players to cast their ballots...
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 4: THE REVEAL (BLUFFER EXPOSED & COMPARISON)      */}
        {/* ======================================================== */}
        {gamePhase === 'reveal' && revealData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Outcome Banner */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border text-center space-y-3 shadow-2xl ${
                revealData.roundWinner === 'town'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}
            >
              <div className="text-4xl">
                {revealData.roundWinner === 'town' ? '🎯' : '🎭'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {revealData.roundWinner === 'town'
                  ? `BUSTED! ${revealData.blufferNames.join(', ')} WAS THE BLUFFER!`
                  : `BLUFFER ESCAPED! ${revealData.blufferNames.join(', ')} SURVIVED!`}
              </h2>
              <p className="text-sm sm:text-base text-slate-200 font-medium">
                {revealData.roundSummary}
              </p>
            </div>

            {/* Questions Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5 shadow">
                <div className="text-xs font-black uppercase tracking-wider text-indigo-400">
                  📌 Regular Players' Question
                </div>
                <p className="text-base font-bold text-white leading-snug">
                  "{revealData.regularQuestion}"
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1.5 shadow">
                <div className="text-xs font-black uppercase tracking-wider text-rose-400">
                  🎭 Bluffer's Secret Question
                </div>
                <p className="text-base font-bold text-white leading-snug">
                  "{revealData.blufferQuestion}"
                </p>
              </div>
            </div>

            {/* Answers & Authorship Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Revealed Answers & Votes:
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
                  {roundNumber >= totalRounds ? 'View Final Results 🏆' : 'Next Round ➔'}
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
