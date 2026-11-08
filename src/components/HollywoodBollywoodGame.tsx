import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Film,
  Star,
  Music,
  Users,
  Plus,
  Check,
  X,
  Trophy,
  Clock,
  Shuffle,
  Wifi,
  Sparkles
} from 'lucide-react';
import { socket, getUserId } from '../socket';
import { secureChoice, secureRandomIndex } from '../utils/secureRandom';

interface Player {
  id: string;
  userId?: string;
  name: string;
  score: number;
  isActive: boolean;
}

interface MovieData {
  id?: string;
  actor: string;
  actress: string;
  movie: string;
  song: string;
  category: 'Bollywood' | 'Hollywood';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface HollywoodBollywoodGameProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const HollywoodBollywoodGame: React.FC<HollywoodBollywoodGameProps> = ({ onBack, username, roomId }) => {
  const userId = getUserId();
  const isMultiplayer = !!roomId;

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', userId, name: username, score: 0, isActive: true }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<MovieData | null>(null);
  const [showInitials, setShowInitials] = useState(true);
  const [initials, setInitials] = useState({ actor: '', actress: '', movie: '', song: '' });
  const [playerGuesses, setPlayerGuesses] = useState({
    actor: '',
    actress: '',
    movie: '',
    song: ''
  });
  const [revealedFields, setRevealedFields] = useState({
    actor: false,
    actress: false,
    movie: false,
    song: false
  });
  const [revealedData, setRevealedData] = useState({
    actor: '',
    actress: '',
    movie: '',
    song: ''
  });
  const [gameRound, setGameRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [newMovie, setNewMovie] = useState({
    actor: '',
    actress: '',
    movie: '',
    song: '',
    category: 'Bollywood' as 'Bollywood' | 'Hollywood',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard'
  });

  // Local movies fallback for single player
  const defaultLocalMovies: MovieData[] = [
    { actor: 'Shah Rukh Khan', actress: 'Kajol', movie: 'Dilwale Dulhania Le Jayenge', song: 'Tujhe Dekha To', category: 'Bollywood', difficulty: 'Easy' },
    { actor: 'Aamir Khan', actress: 'Kareena Kapoor', movie: '3 Idiots', song: 'All Izz Well', category: 'Bollywood', difficulty: 'Easy' },
    { actor: 'Salman Khan', actress: 'Katrina Kaif', movie: 'Ek Tha Tiger', song: 'Mashallah', category: 'Bollywood', difficulty: 'Easy' },
    { actor: 'Ranveer Singh', actress: 'Deepika Padukone', movie: 'Ram-Leela', song: 'Lahu Munh Lag Gaya', category: 'Bollywood', difficulty: 'Medium' },
    { actor: 'Govinda', actress: 'Karisma Kapoor', movie: 'Coolie No. 1', song: 'Main To Raste Se Ja Raha Tha', category: 'Bollywood', difficulty: 'Hard' }
  ];

  // ---------------- MULTIPLAYER SYNC ----------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    socket.emit('joinGame', { roomId, userId }, (res: any) => {
      if (res?.error) console.warn('joinGame error:', res.error);
    });

    const handleGameState = (payload: any) => {
      if (payload.gameKey !== 'HollywoodBollywoodGame') return;
      const s = payload.state;
      if (!s) return;

      setPlayers(s.players || []);
      setCurrentPlayerIndex(s.currentPlayerIndex ?? 0);
      setGameRound(s.gameRound ?? 1);
      setTimeLeft(s.timeLeft ?? 120);
      setIsTimerRunning(s.isTimerRunning ?? false);
      if (s.initials) setInitials(s.initials);
      if (s.revealedFields) setRevealedFields(s.revealedFields);
      if (s.revealedData) setRevealedData(s.revealedData);
      setGameStarted(true);
      setShowInitials(true);
    };

    const handleTimerTick = (data: { timeLeft?: number }) => {
      if (typeof data.timeLeft === 'number') {
        setTimeLeft(data.timeLeft);
      }
    };

    socket.on('gameStateUpdate', handleGameState);
    socket.on('timerTick', handleTimerTick);

    return () => {
      socket.off('gameStateUpdate', handleGameState);
      socket.off('timerTick', handleTimerTick);
    };
  }, [isMultiplayer, roomId, userId]);

  // Local timer effect for single player
  useEffect(() => {
    if (isMultiplayer) return;
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMultiplayer, isTimerRunning, timeLeft]);

  const addLocalPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
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
    const movie = secureChoice(defaultLocalMovies) || defaultLocalMovies[0];
    setCurrentMovie(movie);
    setInitials({
      actor: movie.actor.charAt(0).toUpperCase(),
      actress: movie.actress.charAt(0).toUpperCase(),
      movie: movie.movie.charAt(0).toUpperCase(),
      song: movie.song.charAt(0).toUpperCase()
    });
    setRevealedFields({ actor: false, actress: false, movie: false, song: false });
    setRevealedData({ actor: '', actress: '', movie: '', song: '' });
    setPlayerGuesses({ actor: '', actress: '', movie: '', song: '' });
    setTimeLeft(120);
    setIsTimerRunning(true);
    setShowInitials(true);
  };

  const startLocalGame = () => {
    if (players.length >= 1) {
      setGameStarted(true);
      setGameRound(1);
      generateLocalMovie();
    }
  };

  const checkGuess = (field: 'actor' | 'actress' | 'movie' | 'song') => {
    const guess = playerGuesses[field].trim();
    if (!guess) return;

    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'submitGuess',
          payload: { field, guess, userId }
        },
        (res: any) => {
          if (res?.error) {
            alert(res.error);
          } else if (res?.isMatch) {
            setPlayerGuesses(prev => ({ ...prev, [field]: '' }));
          } else {
            alert('Incorrect guess, try again!');
          }
        }
      );
      return;
    }

    // Local single-player check
    if (!currentMovie) return;
    const actual = currentMovie[field].toLowerCase().trim();
    const g = guess.toLowerCase();
    const isMatch = g === actual || actual.startsWith(g + ' ') || g === actual.split(' ')[0];

    if (isMatch) {
      setRevealedFields(prev => ({ ...prev, [field]: true }));
      setRevealedData(prev => ({ ...prev, [field]: currentMovie[field] }));
      setPlayers(prev =>
        prev.map((p, idx) => (idx === currentPlayerIndex ? { ...p, score: p.score + 1 } : p))
      );
      setPlayerGuesses(prev => ({ ...prev, [field]: '' }));
    } else {
      alert('Incorrect guess, try again!');
    }
  };

  const handleNextRound = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'nextRound', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    setGameRound(prev => prev + 1);
    generateLocalMovie();
  };

  const handleAddCustomMovie = () => {
    if (!newMovie.actor || !newMovie.actress || !newMovie.movie || !newMovie.song) {
      alert('Please fill out all fields for the movie');
      return;
    }

    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'addCustomMovie',
          payload: { movie: newMovie, userId }
        },
        (res: any) => {
          if (res?.error) alert(res.error);
          else {
            alert('Movie added to the game pool!');
            setShowAddMovie(false);
            setNewMovie({
              actor: '',
              actress: '',
              movie: '',
              song: '',
              category: 'Bollywood',
              difficulty: 'Medium'
            });
          }
        }
      );
      return;
    }

    defaultLocalMovies.push(newMovie);
    alert('Movie added!');
    setShowAddMovie(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activePlayer = players[currentPlayerIndex];

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
                <Film className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Hollywood-Bollywood Game
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Film className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Hollywood-Bollywood Game</h2>
              <p className="text-slate-600">
                Guess the Actor, Actress, Movie, and Song from their initials!
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Players ({players.length}/8)</h3>
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
                <Clock className="w-5 h-5 text-slate-300" />
                <span className={`font-mono text-lg ${timeLeft <= 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-slate-300" />
                <span className="text-white">Round {gameRound}</span>
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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
              {/* Initials Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-extrabold flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Guess the Initials!</span>
                  </h3>
                  <button
                    onClick={() => setShowAddMovie(!showAddMovie)}
                    className="flex items-center space-x-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Movie</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <Star className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Actor</p>
                    <p className="text-4xl font-black mt-1">{initials.actor || '?'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <Star className="w-6 h-6 mx-auto mb-1 text-pink-300" />
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Actress</p>
                    <p className="text-4xl font-black mt-1">{initials.actress || '?'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <Film className="w-6 h-6 mx-auto mb-1 text-blue-300" />
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Movie</p>
                    <p className="text-4xl font-black mt-1">{initials.movie || '?'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <Music className="w-6 h-6 mx-auto mb-1 text-emerald-300" />
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Song</p>
                    <p className="text-4xl font-black mt-1">{initials.song || '?'}</p>
                  </div>
                </div>
              </div>

              {/* Add Custom Movie Collapsible */}
              {showAddMovie && (
                <div className="p-5 bg-orange-50 border border-orange-200 rounded-2xl mb-6">
                  <h4 className="font-bold text-orange-900 text-sm mb-3">Add Custom Movie to Game:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Actor Name"
                      value={newMovie.actor}
                      onChange={e => setNewMovie({ ...newMovie, actor: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Actress Name"
                      value={newMovie.actress}
                      onChange={e => setNewMovie({ ...newMovie, actress: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Movie Name"
                      value={newMovie.movie}
                      onChange={e => setNewMovie({ ...newMovie, movie: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Song Name"
                      value={newMovie.song}
                      onChange={e => setNewMovie({ ...newMovie, song: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm bg-white"
                    />
                  </div>
                  <button
                    onClick={handleAddCustomMovie}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
                  >
                    Save & Add Movie
                  </button>
                </div>
              )}

              {/* Guessing Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {(['actor', 'actress', 'movie', 'song'] as const).map(field => {
                  const isRevealed = revealedFields[field];
                  const answerVal = revealedData[field];

                  return (
                    <div key={field} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {field}
                        </label>
                        {isRevealed && <span className="text-xs font-bold text-emerald-600">✓ Solved</span>}
                      </div>

                      {isRevealed ? (
                        <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-lg text-emerald-900 font-bold text-sm">
                          {answerVal || 'Revealed'}
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={playerGuesses[field]}
                            onChange={e => setPlayerGuesses({ ...playerGuesses, [field]: e.target.value })}
                            placeholder={`Guess ${field} (starts with ${initials[field] || '?'})...`}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                            onKeyDown={e => e.key === 'Enter' && checkGuess(field)}
                          />
                          <button
                            onClick={() => checkGuess(field)}
                            disabled={!playerGuesses[field].trim()}
                            className="px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                          >
                            Guess
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Next Round */}
              <div className="text-center pt-2">
                <button
                  onClick={handleNextRound}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center space-x-2 mx-auto transition"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Next Movie / Round</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Scoreboard</h3>
            <div className="space-y-3">
              {players
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.userId || p.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-xs text-slate-400">#{idx + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <p className="font-bold text-sm text-slate-900">{p.name}</p>
                    </div>
                    <span className="font-mono font-black text-lg text-pink-600">{p.score} pts</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HollywoodBollywoodGame;
