import { ArrowLeft, Play, Pause, RotateCcw, Users, Clock, Trophy, Star, Zap, Crown, Shuffle, CheckCircle, XCircle } from 'lucide-react';
import MultiplayerManager from '../utils/multiplayer';

interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
}

interface Movie {
  name: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY HARD';
  timeLimit: number; // in seconds
}

interface DumbCharadesProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const DumbCharades: React.FC<DumbCharadesProps> = ({ onBack, username, roomId }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: username, score: 0, isActive: true }
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
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerManager] = useState(() => MultiplayerManager.getInstance());

  // Movie database with difficulty levels and time limits
  const movies: Movie[] = [
    // EASY (Popular & Common) - 90 seconds
    { name: 'Sholay', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Dangal', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Kabir Singh', difficulty: 'EASY', timeLimit: 90 },
    { name: '3 Idiots', difficulty: 'EASY', timeLimit: 90 },
    { name: 'PK', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Zindagi Na Milegi Dobara', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Andhadhun', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Chak De! India', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Yeh Jawaani Hai Deewani', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Gully Boy', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Dil Chahta Hai', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Kal Ho Naa Ho', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Kuch Kuch Hota Hai', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Kabhi Alvida Naa Kehna', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Taare Zameen Par', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Bajrangi Bhaijaan', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Kick', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Don', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Jab We Met', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Bodyguard', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Sultan', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Bang Bang', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Raees', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Chennai Express', difficulty: 'EASY', timeLimit: 90 },
    { name: 'Happy New Year', difficulty: 'EASY', timeLimit: 90 },

    // MEDIUM (Interesting Names) - 120 seconds
    { name: 'Chhichhore', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Barfi!', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Kai Po Che!', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Haider', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Kahaani', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Badlapur', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Talaash', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Tumhari Sulu', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Bareilly Ki Barfi', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Stree', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Once Upon A Time in Mumbaai', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Band Baaja Baaraat', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Rocket Singh: Salesman of the Year', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Dum Laga Ke Haisha', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Shubh Mangal Zyada Saavdhan', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Lootera', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Raajneeti', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Love Aaj Kal', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Wake Up Sid', difficulty: 'MEDIUM', timeLimit: 120 },
    { name: 'Hawa Hawai', difficulty: 'MEDIUM', timeLimit: 120 },

    // HARD (Classic & Twisters) - 150 seconds
    { name: 'Khosla Ka Ghosla', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Saajan Chale Sasural', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Dilwale Dulhania Le Jayenge', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Tanu Weds Manu Returns', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Hum Saath-Saath Hain', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Kabhi Khushi Kabhie Gham', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Bheja Fry', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Do Ankhen Barah Haath', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Sadma', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Akele Hum Akele Tum', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Hum Hai Rahi Pyar Ke', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Andaaz Apna Apna', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Ghar Ho To Aisa', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Hum Tumhare Hain Sanam', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Mujhse Dosti Karoge', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Chupke Chupke', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Angoor', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Amar Akbar Anthony', difficulty: 'HARD', timeLimit: 150 },
    { name: 'Kati Patang', difficulty: 'HARD', timeLimit: 150 },

    // VERY HARD (Funny / Rare) - 180 seconds
    { name: 'Ghoomketu', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Titli', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Chhoti Si Baat', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Jaane Bhi Do Yaaro', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Dhobi Ghat', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Ankur Arora Murder Case', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Saheb Biwi Aur Gangster', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Kis Kisko Pyaar Karoon', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Jal Bin Machhli Nritya Bin Bijli', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Do Aur Do Paanch', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Kissi Se Na Kehna', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Chhoti Bahu', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Khubsoorat', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Kaagaz Ke Phool', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Half Ticket', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Do Phool', difficulty: 'VERY HARD', timeLimit: 180 },
    { name: 'Ram Teri Ganga Maili', difficulty: 'VERY HARD', timeLimit: 180 }
  ];

  // Initialize multiplayer mode if roomId is provided
  useEffect(() => {
    if (roomId) {
      setIsMultiplayer(true);
      
      // Load room data from multiplayer manager
      const room = multiplayerManager.getRoom(roomId);
      if (room) {
        const roomPlayers: Player[] = room.players.map((playerName: string, index: number) => ({
          id: (index + 1).toString(),
          name: playerName,
          score: 0,
          isActive: true
        }));
        setPlayers(roomPlayers);
        
        // Listen for room updates
        const handleRoomUpdate = (updatedRoom: any) => {
          const updatedPlayers: Player[] = updatedRoom.players.map((playerName: string, index: number) => ({
            id: (index + 1).toString(),
            name: playerName,
            score: 0,
            isActive: true
          }));
          setPlayers(updatedPlayers);
        };
        
        multiplayerManager.on(`room:${roomId}`, handleRoomUpdate);
        
        return () => {
          multiplayerManager.off(`room:${roomId}`, handleRoomUpdate);
        };
      } else {
        // Fallback to single player
        setPlayers([{ id: '1', name: username, score: 0, isActive: true }]);
        }
    }
  }, [roomId, username, multiplayerManager]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 20) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0,
        isActive: true
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const removePlayer = (playerId: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const startGame = () => {
    if (players.length >= 1) {
      setGameStarted(true);
      setGameRound(1);
      generateNewMovie();
    }
  };

  const generateNewMovie = () => {
    let availableMovies = movies;
    
    if (selectedDifficulty !== 'ALL') {
      availableMovies = movies.filter(movie => movie.difficulty === selectedDifficulty);
    }
    
    const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
    setCurrentMovie(randomMovie);
    setTimeLeft(randomMovie.timeLimit);
    setIsTimerRunning(false);
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (currentMovie) {
      setTimeLeft(currentMovie.timeLimit);
    }
  };

  const nextPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    generateNewMovie();
    setGameRound(prev => prev + 1);
  };

  const markCorrect = () => {
    // Add point to current player
    setPlayers(prev => prev.map((player, index) => 
      index === currentPlayerIndex 
        ? { ...player, score: player.score + getDifficultyPoints(currentMovie?.difficulty || 'EASY') }
        : player
    ));
    nextPlayer();
  };

  const markIncorrect = () => {
    nextPlayer();
  };

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 1;
      case 'MEDIUM': return 2;
      case 'HARD': return 3;
      case 'VERY HARD': return 5;
      default: return 1;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'from-green-400 to-green-500';
      case 'MEDIUM': return 'from-yellow-400 to-orange-500';
      case 'HARD': return 'from-orange-500 to-red-500';
      case 'VERY HARD': return 'from-red-500 to-purple-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return <Star className="w-4 h-4" />;
      case 'MEDIUM': return <Zap className="w-4 h-4" />;
      case 'HARD': return <Trophy className="w-4 h-4" />;
      case 'VERY HARD': return <Crown className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{isMultiplayer ? 'Back to Room' : 'Back to Games'}</span>
              </button>
              <div className="flex items-center space-x-3">
                <Play className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Dumb Charades {isMultiplayer && roomId && <span className="text-sm font-normal">({roomId})</span>}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Setup */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
                <div className="text-center mb-8">
                  <Play className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Dumb Charades</h2>
                  {isMultiplayer && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800 font-medium">Multiplayer Room: {roomId}</p>
                      <p className="text-sm text-purple-600">Playing with friends online!</p>
                    </div>
                  )}
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    Act out Bollywood movies without speaking! Choose your difficulty level and 
                    get ready for some hilarious charades action.
                  </p>
                </div>

                {/* Difficulty Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Difficulty</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {['ALL', 'EASY', 'MEDIUM', 'HARD', 'VERY HARD'].map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty as any)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedDifficulty === difficulty
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-slate-200 hover:border-orange-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          {difficulty !== 'ALL' && getDifficultyIcon(difficulty)}
                          <span className="text-sm font-medium">{difficulty}</span>
                        </div>
                        {difficulty !== 'ALL' && (
                          <p className="text-xs text-slate-500 mt-1">
                            {difficulty === 'EASY' && '90s • 1pt'}
                            {difficulty === 'MEDIUM' && '120s • 2pts'}
                            {difficulty === 'HARD' && '150s • 3pts'}
                            {difficulty === 'VERY HARD' && '180s • 5pts'}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {!isMultiplayer && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Players ({players.length}/20)</h3>
                      {players.length < 20 && (
                        <button
                          onClick={() => setShowAddPlayer(true)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors duration-200"
                        >
                          Add Player
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold">{player.name.charAt(0)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-slate-900">{player.name}</span>
                              <p className="text-sm text-slate-600">Ready to act!</p>
                            </div>
                          </div>
                          {players.length > 1 && (
                            <button
                              onClick={() => removePlayer(player.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {showAddPlayer && (
                      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Enter player name..."
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                          />
                          <button
                            onClick={addPlayer}
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors duration-200"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setShowAddPlayer(false)}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={startGame}
                    disabled={players.length < 1}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Charades!
                  </button>
                </div>
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">How to Play</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-sm text-slate-600">One player acts out the movie title without speaking</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-sm text-slate-600">Other players guess the movie name</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-sm text-slate-600">Use gestures, expressions, and body language only</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-sm text-slate-600">Score points based on difficulty level</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Difficulty Levels</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-green-500" />
                      <span>Easy</span>
                    </span>
                    <span className="text-slate-600">90s • 1pt</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span>Medium</span>
                    </span>
                    <span className="text-slate-600">120s • 2pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <Trophy className="w-3 h-3 text-orange-500" />
                      <span>Hard</span>
                    </span>
                    <span className="text-slate-600">150s • 3pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <Crown className="w-3 h-3 text-purple-500" />
                      <span>Very Hard</span>
                    </span>
                    <span className="text-slate-600">180s • 5pts</span>
                  </div>
                </div>
              </div>
            </div>
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
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
            >
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
                <div className="flex items-center space-x-2">
                  <Play className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-medium">{roomId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Player & Movie */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">{players[currentPlayerIndex].name.charAt(0)}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{players[currentPlayerIndex].name}'s Turn</h3>
                <p className="text-slate-600">Act out this movie for others to guess!</p>
              </div>

              {currentMovie && (
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${getDifficultyColor(currentMovie.difficulty)} text-white mb-4`}>
                    {getDifficultyIcon(currentMovie.difficulty)}
                    <span className="font-medium">{currentMovie.difficulty}</span>
                    <span className="text-sm">• {getDifficultyPoints(currentMovie.difficulty)} pts</span>
                  </div>
                  
                  <div className="bg-slate-900 text-white p-6 rounded-xl mb-6 shadow-lg">
                    <h2 className="text-3xl font-bold mb-2">{currentMovie.name}</h2>
                    <p className="text-slate-300">Only the actor should see this!</p>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className={`text-4xl font-bold ${
                      timeLeft <= 30 ? 'text-red-600' : timeLeft <= 60 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="flex space-x-2">
                      {!isTimerRunning ? (
                        <button
                          onClick={startTimer}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start</span>
                        </button>
                      ) : (
                        <button
                          onClick={pauseTimer}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Pause className="w-4 h-4" />
                          <span>Pause</span>
                        </button>
                      )}
                      <button
                        onClick={resetTimer}
                        className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={markCorrect}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Correct! (+{getDifficultyPoints(currentMovie.difficulty)} pts)</span>
                    </button>
                    <button
                      onClick={markIncorrect}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Skip/Wrong</span>
                    </button>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={generateNewMovie}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <Shuffle className="w-4 h-4" />
                      <span>New Movie</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scoreboard */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Scoreboard</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.name === players[currentPlayerIndex].name
                          ? 'bg-orange-100 border-2 border-orange-300'
                          : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded-full text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-semibold">{player.name.charAt(0)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900">{player.name}</span>
                          {player.name === players[currentPlayerIndex].name && (
                            <p className="text-xs text-orange-600 font-medium">Current Turn</p>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {player.score}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DumbCharades;
