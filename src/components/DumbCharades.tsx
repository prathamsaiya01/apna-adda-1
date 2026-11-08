import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Users,
  Trophy,
  Star,
  Zap,
  Crown,
  Shuffle,
  CheckCircle,
  XCircle,
  Wifi
} from 'lucide-react';
import { socket, getUserId } from '../socket';

interface Player {
  id: string;
  userId?: string;
  name: string;
  score: number;
  isActive: boolean;
}

interface Movie {
  name: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY HARD';
  timeLimit: number;
}

interface DumbCharadesProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const DumbCharades: React.FC<DumbCharadesProps> = ({ onBack, username, roomId }) => {
  const userId = getUserId();
  const isMultiplayer = !!roomId;

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', userId, name: username, score: 0, isActive: true }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY HARD'>('ALL');
  const [gameRound, setGameRound] = useState(1);

  // Local movies fallback for single player
  const localMovies: Movie[] = [
    { name: 'Sholay', difficulty: 'EASY', timeLimit: 45 },
    { name: 'Dangal', difficulty: 'EASY', timeLimit: 45 },
    { name: '3 Idiots', difficulty: 'EASY', timeLimit: 45 },
    { name: 'PK', difficulty: 'EASY', timeLimit: 45 },
    { name: 'Chhichhore', difficulty: 'MEDIUM', timeLimit: 60 },
    { name: 'Barfi!', difficulty: 'MEDIUM', timeLimit: 60 },
    { name: 'Khosla Ka Ghosla', difficulty: 'HARD', timeLimit: 85 },
    { name: 'Dilwale Dulhania Le Jayenge', difficulty: 'HARD', timeLimit: 85 },
    { name: 'Ghoomketu', difficulty: 'VERY HARD', timeLimit: 100 }
  ];

  // ---------------- MULTIPLAYER SYNC ----------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    socket.emit('joinGame', { roomId, userId }, (res: any) => {
      if (res?.error) console.warn('joinGame error:', res.error);
    });

    const handleGameState = (payload: any) => {
      if (payload.gameKey !== 'DumbCharades') return;
      const s = payload.state;
      if (!s) return;

      setPlayers(s.players || []);
      setCurrentPlayerIndex(s.currentPlayerIndex ?? 0);
      setSelectedDifficulty(s.selectedDifficulty || 'ALL');
      setTimeLeft(s.timeLeft ?? 0);
      setIsTimerRunning(s.isTimerRunning || false);
      setGameRound(s.gameRound ?? 1);
      setGameStarted(true);

      // If actor has received the secret movie from privateStateUpdate, keep it.
      // Otherwise public movie only has difficulty and timeLimit.
      if (!currentMovie || !currentMovie.name) {
        if (s.movie) setCurrentMovie(s.movie);
      }
    };

    const handlePrivateState = (payload: any) => {
      if (payload.gameKey !== 'DumbCharades') return;
      if (payload.movie) {
        setCurrentMovie(payload.movie);
      }
    };

    const handleTimerTick = (data: { timeLeft?: number }) => {
      if (typeof data.timeLeft === 'number') {
        setTimeLeft(data.timeLeft);
      }
    };

    socket.on('gameStateUpdate', handleGameState);
    socket.on('privateStateUpdate', handlePrivateState);
    socket.on('timerTick', handleTimerTick);

    // Initial private data fetch
    socket.emit('gameAction', { roomId, action: 'getPrivateData', payload: { userId } }, (res: any) => {
      if (res?.movie) setCurrentMovie(res.movie);
    });

    return () => {
      socket.off('gameStateUpdate', handleGameState);
      socket.off('privateStateUpdate', handlePrivateState);
      socket.off('timerTick', handleTimerTick);
    };
  }, [isMultiplayer, roomId, userId]);

  // Single player timer effect
  useEffect(() => {
    if (isMultiplayer) return;
    let interval: number | undefined;
    if (isTimerRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [isMultiplayer, isTimerRunning, timeLeft]);

  const addLocalPlayer = () => {
    if (newPlayerName.trim() && players.length < 20) {
      setPlayers(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          userId: 'user-' + Date.now(),
          name: newPlayerName.trim(),
          score: 0,
          isActive: true
        }
      ]);
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const removeLocalPlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(prev => prev.filter(p => p.id !== id));
    }
  };

  const generateLocalMovie = () => {
    let pool = localMovies;
    if (selectedDifficulty !== 'ALL') {
      pool = localMovies.filter(m => m.difficulty === selectedDifficulty);
    }
    if (pool.length === 0) pool = localMovies;
    const rand = pool[Math.floor(Math.random() * pool.length)];
    setCurrentMovie(rand);
    setTimeLeft(rand.timeLimit);
    setIsTimerRunning(false);
  };

  const startLocalGame = () => {
    if (players.length >= 1) {
      setGameStarted(true);
      setGameRound(1);
      generateLocalMovie();
    }
  };

  const handleStartTimer = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'startTimer', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'pauseTimer', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'resetTimer', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    setIsTimerRunning(false);
    if (currentMovie) setTimeLeft(currentMovie.timeLimit);
  };

  const handleMarkCorrect = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'markCorrect', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    const pts = getDifficultyPoints(currentMovie?.difficulty);
    setPlayers(prev => prev.map((p, idx) => (idx === currentPlayerIndex ? { ...p, score: p.score + pts } : p)));
    nextLocalTurn();
  };

  const handleMarkIncorrect = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'markIncorrect', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    nextLocalTurn();
  };

  const handleNewMovie = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'newMovie', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    generateLocalMovie();
  };

  const handleSetDifficulty = (diff: any) => {
    setSelectedDifficulty(diff);
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'setDifficulty', payload: { difficulty: diff, userId } });
    }
  };

  const nextLocalTurn = () => {
    setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    setGameRound(prev => prev + 1);
    generateLocalMovie();
  };

  const getDifficultyPoints = (diff?: string) => {
    switch (diff) {
      case 'EASY': return 1;
      case 'MEDIUM': return 2;
      case 'HARD': return 3;
      case 'VERY HARD': return 5;
      default: return 1;
    }
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'EASY': return 'from-green-400 to-green-500';
      case 'MEDIUM': return 'from-yellow-400 to-orange-500';
      case 'HARD': return 'from-orange-500 to-red-500';
      case 'VERY HARD': return 'from-red-500 to-purple-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeActor = players[currentPlayerIndex];
  const isMeActor = isMultiplayer
    ? activeActor && (activeActor.userId === userId || activeActor.name === username)
    : activeActor?.name === username;

  if (!gameStarted && !isMultiplayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button onClick={onBack} className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Games</span>
              </button>
              <div className="flex items-center space-x-3">
                <Play className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Dumb Charades
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Play className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Dumb Charades</h2>
              <p className="text-slate-600">Act out Bollywood movies without speaking!</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Players ({players.length}/20)</h3>
                <button onClick={() => setShowAddPlayer(true)} className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-semibold">
                  Add Player
                </button>
              </div>

              <div className="space-y-2">
                {players.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border">
                    <span className="font-semibold text-slate-800">{p.name}</span>
                    {players.length > 1 && (
                      <button onClick={() => removeLocalPlayer(p.id)} className="text-xs text-red-500 hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {showAddPlayer && (
                <div className="mt-4 flex space-x-2">
                  <input
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    placeholder="Player name..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <button onClick={addLocalPlayer} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold">
                    Add
                  </button>
                </div>
              )}
            </div>

            <button onClick={startLocalGame} className="w-full py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-xl font-bold">
              Start Game
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={onBack} className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Games</span>
            </button>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-300" />
                <span className="text-white">Round {gameRound}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-slate-300" />
                <span className="text-white">{players.length} players</span>
              </div>
              {isMultiplayer && roomId && (
                <div className="flex items-center space-x-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-400/30">
                  <Wifi className="w-4 h-4 text-orange-300 animate-pulse" />
                  <span className="text-orange-200 font-mono text-sm">{roomId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-white font-bold text-xl">{activeActor?.name.charAt(0)}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">
                  {isMeActor ? "It's Your Turn to Act!" : `${activeActor?.name}'s Turn to Act`}
                </h3>
                <p className="text-slate-500 text-sm">
                  {isMeActor
                    ? "Act out the secret movie title without speaking!"
                    : "Watch the actor carefully and guess the movie name aloud!"}
                </p>
              </div>

              {currentMovie && (
                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${getDifficultyColor(
                      currentMovie.difficulty
                    )} text-white mb-4 text-xs font-bold`}
                  >
                    <span>{currentMovie.difficulty}</span>
                    <span>• {getDifficultyPoints(currentMovie.difficulty)} pts</span>
                  </div>

                  {/* Secret Movie Title Box */}
                  <div className="bg-slate-900 text-white p-6 rounded-2xl mb-6 shadow-xl max-w-lg mx-auto">
                    {isMeActor && currentMovie.name ? (
                      <div>
                        <h2 className="text-3xl font-extrabold mb-1 tracking-wide">{currentMovie.name}</h2>
                        <p className="text-xs text-orange-400 font-semibold">Only you (the actor) can see this!</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <p className="text-slate-400 text-xs font-semibold mb-1">SECRET MOVIE TITLE</p>
                        <p className="text-2xl font-mono tracking-widest text-slate-300">••••••••••••</p>
                        <p className="text-xs text-slate-500 mt-2">Only the actor can view the movie name.</p>
                      </div>
                    )}
                  </div>

                  {/* Synchronized Timer */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div
                      className={`text-5xl font-mono font-black ${
                        timeLeft <= 15 ? 'text-red-600 animate-pulse' : timeLeft <= 35 ? 'text-amber-500' : 'text-emerald-600'
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                    {(isMeActor || !isMultiplayer) && (
                      <div className="flex space-x-2">
                        {!isTimerRunning ? (
                          <button
                            onClick={handleStartTimer}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center space-x-1.5 transition shadow"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start</span>
                          </button>
                        ) : (
                          <button
                            onClick={handlePauseTimer}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm flex items-center space-x-1.5 transition shadow"
                          >
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause</span>
                          </button>
                        )}
                        <button
                          onClick={handleResetTimer}
                          className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actor Controls */}
                  {(isMeActor || !isMultiplayer) && (
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={handleMarkCorrect}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Correct! (+{getDifficultyPoints(currentMovie.difficulty)} pts)</span>
                      </button>
                      <button
                        onClick={handleMarkIncorrect}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center space-x-2"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Pass / Skip</span>
                      </button>
                      <button
                        onClick={handleNewMovie}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center space-x-1.5"
                      >
                        <Shuffle className="w-4 h-4" />
                        <span>New Movie</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Scoreboard */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Scoreboard</h3>
            <div className="space-y-3">
              {players
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => {
                  const isActor = activeActor && (p.userId === activeActor.userId || p.name === activeActor.name);
                  return (
                    <div
                      key={p.userId || p.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isActor ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-xs text-slate-400">#{idx + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{p.name}</p>
                          {isActor && <span className="text-[10px] text-orange-600 font-semibold">Actor</span>}
                        </div>
                      </div>
                      <span className="font-mono font-black text-lg text-orange-600">{p.score} pts</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DumbCharades;
