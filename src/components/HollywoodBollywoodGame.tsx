import { ArrowLeft, Film, Star, Music, Users, Plus, Edit3, Check, X, Trophy, Clock, Shuffle, Eye, EyeOff } from 'lucide-react';
import MultiplayerManager from '../utils/multiplayer';

interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
}

interface MovieData {
  id: string;
  actor: string;
  actress: string;
  movie: string;
  song: string;
  category: 'Bollywood' | 'Hollywood';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  addedBy?: string;
}

interface HollywoodBollywoodGameProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const HollywoodBollywoodGame: React.FC<HollywoodBollywoodGameProps> = ({ onBack, username, roomId }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: username, score: 0, isActive: true }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<MovieData | null>(null);
  const [showInitials, setShowInitials] = useState(false);
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
  const [gameRound, setGameRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per round
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
  const [customMovies, setCustomMovies] = useState<MovieData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Bollywood' | 'Hollywood'>('All');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerManager] = useState(() => MultiplayerManager.getInstance());
  const [usedMovieIds, setUsedMovieIds] = useState<Set<string>>(new Set());

  // Pre-loaded movie database
  const defaultMovies: MovieData[] = [
    {
      id: '1',
      actor: 'Shah Rukh Khan',
      actress: 'Kajol',
      movie: 'Dilwale Dulhania Le Jayenge',
      song: 'Tujhe Dekha To',
      category: 'Bollywood',
      difficulty: 'Easy'
    },
    {
      id: '2',
      actor: 'Aamir Khan',
      actress: 'Kareena Kapoor',
      movie: '3 Idiots',
      song: 'All Izz Well',
      category: 'Bollywood',
      difficulty: 'Easy'
    },
    {
      id: '3',
      actor: 'Salman Khan',
      actress: 'Katrina Kaif',
      movie: 'Ek Tha Tiger',
      song: 'Mashallah',
      category: 'Bollywood',
      difficulty: 'Easy'
    },
    {
      id: '4',
      actor: 'Akshay Kumar',
      actress: 'Sonakshi Sinha',
      movie: 'Rowdy Rathore',
      song: 'Chinta Ta Ta',
      category: 'Bollywood',
      difficulty: 'Easy'
    },
    {
      id: '5',
      actor: 'Ranveer Singh',
      actress: 'Deepika Padukone',
      movie: 'Ram-Leela',
      song: 'Lahu Munh Lag Gaya',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '6',
      actor: 'Ajay Devgn',
      actress: 'Tabu',
      movie: 'Drishyam',
      song: 'Soch Na Sake',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '7',
      actor: 'Shahid Kapoor',
      actress: 'Kiara Advani',
      movie: 'Kabir Singh',
      song: 'Bekhayali',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '8',
      actor: 'Varun Dhawan',
      actress: 'Alia Bhatt',
      movie: 'Badrinath Ki Dulhania',
      song: 'Tamma Tamma Again',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '9',
      actor: 'Amitabh Bachchan',
      actress: 'Jaya Bachchan',
      movie: 'Sholay',
      song: 'Yeh Dosti',
      category: 'Bollywood',
      difficulty: 'Easy'
    },
    {
      id: '10',
      actor: 'Saif Ali Khan',
      actress: 'Kareena Kapoor',
      movie: 'Tashan',
      song: 'Dil Haara',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '11',
      actor: 'Rajkummar Rao',
      actress: 'Kriti Sanon',
      movie: 'Hum Do Hamare Do',
      song: 'Bansuri',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '12',
      actor: 'Aamir Khan',
      actress: 'Rani Mukerji',
      movie: 'Ghulam',
      song: 'Aati Kya Khandala',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '13',
      actor: 'Govinda',
      actress: 'Karisma Kapoor',
      movie: 'Coolie No. 1',
      song: 'Main To Raste Se Ja Raha Tha',
      category: 'Bollywood',
      difficulty: 'Hard'
    },
    {
      id: '14',
      actor: 'Shah Rukh Khan',
      actress: 'Preity Zinta',
      movie: 'Veer-Zaara',
      song: 'Tere Liye',
      category: 'Bollywood',
      difficulty: 'Hard'
    },
    {
      id: '15',
      actor: 'Ranbir Kapoor',
      actress: 'Nargis Fakhri',
      movie: 'Rockstar',
      song: 'Tum Ho',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '16',
      actor: 'Farhan Akhtar',
      actress: 'Priyanka Chopra',
      movie: 'Don 2',
      song: 'Zaraa Dil Ko Thaam Lo',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '17',
      actor: 'John Abraham',
      actress: 'Bipasha Basu',
      movie: 'Jism',
      song: 'Jaadu Hai Nasha Hai',
      category: 'Bollywood',
      difficulty: 'Hard'
    },
    {
      id: '18',
      actor: 'Ajay Devgn',
      actress: 'Kareena Kapoor',
      movie: 'Singham',
      song: 'Saathiyaa',
      category: 'Bollywood',
      difficulty: 'Easy'
    },
    {
      id: '19',
      actor: 'Emraan Hashmi',
      actress: 'Mallika Sherawat',
      movie: 'Murder',
      song: 'Bheege Honth Tere',
      category: 'Bollywood',
      difficulty: 'Hard'
    },
    {
      id: '20',
      actor: 'Saif Ali Khan',
      actress: 'Rani Mukerji',
      movie: 'Hum Tum',
      song: 'Hum Tum',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '21',
      actor: 'Ranveer Singh',
      actress: 'Deepika Padukone',
      movie: 'Padmaavat',
      song: 'Ghoomar',
      category: 'Bollywood',
      difficulty: 'Easy'
    },
    {
      id: '22',
      actor: 'Rajkummar Rao',
      actress: 'Shraddha Kapoor',
      movie: 'Stree',
      song: 'Milegi Milegi',
      category: 'Bollywood',
      difficulty: 'Medium'
    },
    {
      id: '23',
      actor: 'Akshay Kumar',
      actress: 'Vidya Balan',
      movie: 'Bhool Bhulaiyaa',
      song: 'Mere Dholna',
      category: 'Bollywood',
      difficulty: 'Medium'
    }
  ];

  // Load custom movies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hollywoodBollywoodCustomMovies');
    if (saved) {
      setCustomMovies(JSON.parse(saved));
    }
  }, []);

  // Save custom movies to localStorage
  useEffect(() => {
    localStorage.setItem('hollywoodBollywoodCustomMovies', JSON.stringify(customMovies));
  }, [customMovies]);

  // Initialize multiplayer mode if roomId is provided
  useEffect(() => {
    if (roomId) {
      setIsMultiplayer(true);
      
      const room = multiplayerManager.getRoom(roomId);
      if (room) {
        const roomPlayers: Player[] = room.players.map((playerName: string, index: number) => ({
          id: (index + 1).toString(),
          name: playerName,
          score: 0,
          isActive: true
        }));
        setPlayers(roomPlayers);
        
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
            handleTimeUp();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const getAllMovies = () => {
    const allMovies = [...defaultMovies, ...customMovies];
    if (selectedCategory === 'All') return allMovies;
    return allMovies.filter(movie => movie.category === 'Bollywood');
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
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

  const addCustomMovie = () => {
    if (newMovie.actor && newMovie.actress && newMovie.movie && newMovie.song) {
      const movieData: MovieData = {
        id: Date.now().toString(),
        ...newMovie,
        category: 'Bollywood',
        addedBy: username
      };
      setCustomMovies([...customMovies, movieData]);
      setNewMovie({
        actor: '',
        actress: '',
        movie: '',
        song: '',
        category: 'Bollywood' as 'Bollywood' | 'Hollywood',
        difficulty: 'Medium'
      });
      setShowAddMovie(false);
    }
  };

  const startGame = () => {
    if (players.length >= 1) {
      setGameStarted(true);
      setGameRound(1);
      generateNewMovie();
      setTimeLeft(120);
    }
  };

  const generateNewMovie = () => {
    const availableMovies = getAllMovies();
    if (availableMovies.length === 0) return;
    
    // Filter out already used movies
    const unusedMovies = availableMovies.filter(movie => !usedMovieIds.has(movie.id));
    
    // If all movies have been used, reset the used movies set
    if (unusedMovies.length === 0) {
      setUsedMovieIds(new Set());
      const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
      setUsedMovieIds(new Set([randomMovie.id]));
      setCurrentMovie(randomMovie);
    } else {
      const randomMovie = unusedMovies[Math.floor(Math.random() * unusedMovies.length)];
      setUsedMovieIds(prev => new Set([...prev, randomMovie.id]));
      setCurrentMovie(randomMovie);
    }
    
    setShowInitials(false);
    setPlayerGuesses({ actor: '', actress: '', movie: '', song: '' });
    setRevealedFields({ actor: false, actress: false, movie: false, song: false });
  };

  const showMovieInitials = () => {
    setShowInitials(true);
    setIsTimerRunning(true);
  };

  const getInitials = (text: string) => {
    return text.charAt(0).toUpperCase();
  };

  const checkGuess = (field: keyof typeof playerGuesses) => {
    if (!currentMovie) return;
    
    const guess = playerGuesses[field].toLowerCase().trim();
    const actual = currentMovie[field].toLowerCase().trim();
    
    // Check for exact match or partial match (first name)
    const isMatch = guess === actual || 
                   actual.startsWith(guess + ' ') || 
                   guess === actual.split(' ')[0];
    
    if (isMatch) {
      setRevealedFields(prev => ({ ...prev, [field]: true }));
      
      // Award points based on difficulty
      const points = currentMovie.difficulty === 'Easy' ? 1 : 
                    currentMovie.difficulty === 'Medium' ? 2 : 3;
      
      setPlayers(prev => prev.map((player, index) => 
        index === currentPlayerIndex 
          ? { ...player, score: player.score + points }
          : player
      ));
      
      return true;
    }
    return false;
  };

  const handleTimeUp = () => {
    // Reveal all answers when time is up
    setRevealedFields({ actor: true, actress: true, movie: true, song: true });
    setTimeout(() => {
      nextRound();
    }, 3000);
  };

  const nextRound = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setGameRound(prev => prev + 1);
    generateNewMovie();
    setTimeLeft(120);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'from-green-400 to-green-500';
      case 'Medium': return 'from-yellow-400 to-orange-500';
      case 'Hard': return 'from-red-500 to-purple-600';
      default: return 'from-gray-400 to-gray-500';
    }
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
                <Film className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Hollywood-Bollywood Game {isMultiplayer && roomId && <span className="text-sm font-normal">({roomId})</span>}
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
                  <Film className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Hollywood-Bollywood Game</h2>
                  {isMultiplayer && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800 font-medium">Multiplayer Room: {roomId}</p>
                      <p className="text-sm text-purple-600">Playing with friends online!</p>
                    </div>
                  )}
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    🎬 The ultimate movie buff challenge! Guess the Actor, Actress, Movie, and Song from their initials. 
                    Example: S (Salman), A (Anushka), M (Sultan), J (Jag Ghoomeya) ⭐
                  </p>
                </div>

                {/* Category Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Category</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {['All'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category as any)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedCategory === category
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-slate-200 hover:border-orange-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Film className="w-4 h-4" />
                          <span className="font-medium">{category}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {category === 'All' && `${getAllMovies().length} movies`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Movie Button */}
                <div className="mb-8 text-center">
                  <button
                    onClick={() => setShowAddMovie(true)}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto text-lg"
                  >
                    <Plus className="w-6 h-6" />
                    <span>🎬 Add Your Movie</span>
                  </button>
                  <p className="text-sm text-slate-500 mt-2">Add your favorite movies to make the game more personal!</p>
                </div>

                {/* Add Movie Form */}
                {showAddMovie && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <Film className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-green-900">Add Your Custom Movie</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Actor Name"
                        value={newMovie.actor}
                        onChange={(e) => setNewMovie({...newMovie, actor: e.target.value})}
                        className="px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Actress Name"
                        value={newMovie.actress}
                        onChange={(e) => setNewMovie({...newMovie, actress: e.target.value})}
                        className="px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Movie Name"
                        value={newMovie.movie}
                        onChange={(e) => setNewMovie({...newMovie, movie: e.target.value})}
                        className="px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Song Name"
                        value={newMovie.song}
                        onChange={(e) => setNewMovie({...newMovie, song: e.target.value})}
                        className="px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <select
                        value={newMovie.difficulty}
                        onChange={(e) => setNewMovie({...newMovie, difficulty: e.target.value as any})}
                        className="px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                      >
                        <option value="Easy">Easy (1 pt)</option>
                        <option value="Medium">Medium (2 pts)</option>
                        <option value="Hard">Hard (3 pts)</option>
                      </select>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={addCustomMovie}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Add Movie</span>
                      </button>
                      <button
                        onClick={() => setShowAddMovie(false)}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}

                {!isMultiplayer && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Players ({players.length}/8)</h3>
                      {players.length < 8 && (
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
                              <p className="text-sm text-slate-600">Movie buff ready!</p>
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
                    disabled={players.length < 1 || getAllMovies().length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Movie Game!
                  </button>
                  {getAllMovies().length === 0 && (
                    <p className="text-sm text-red-500 mt-2">Add some movies to start playing!</p>
                  )}
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
                  <p className="text-sm text-slate-600">One player shows initials: A (Actor), A (Actress), M (Movie), S (Song)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-sm text-slate-600">Others guess all four within 2 minutes</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-sm text-slate-600">Score points for each correct guess</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-sm text-slate-600">Add your own movies to make it personal!</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Scoring System</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Easy</span>
                    </span>
                    <span className="text-slate-600">1 point each</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium</span>
                    </span>
                    <span className="text-slate-600">2 points each</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Hard</span>
                    </span>
                    <span className="text-slate-600">3 points each</span>
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
                <Clock className="w-5 h-5 text-slate-300" />
                <span className={`font-mono text-lg ${timeLeft <= 30 ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-slate-300" />
                <span className="text-white">Round {gameRound}</span>
              </div>
              {isMultiplayer && roomId && (
                <div className="flex items-center space-x-2">
                  <Film className="w-5 h-5 text-orange-400" />
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
                <p className="text-slate-600">Show the initials and let others guess!</p>
              </div>

              {currentMovie && (
                <div className="space-y-6">
                  {/* Movie Info for Current Player */}
                  {!showInitials && (
                    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(currentMovie.difficulty)} text-white mb-4`}>
                        <span className="text-sm font-medium">{currentMovie.difficulty}</span>
                        <span className="text-sm">• {currentMovie.category}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-slate-300 text-sm">Actor</p>
                          <p className="text-xl font-bold">{currentMovie.actor}</p>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm">Actress</p>
                          <p className="text-xl font-bold">{currentMovie.actress}</p>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm">Movie</p>
                          <p className="text-xl font-bold">{currentMovie.movie}</p>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm">Song</p>
                          <p className="text-xl font-bold">{currentMovie.song}</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-center mt-4">Only {players[currentPlayerIndex].name} should see this!</p>
                    </div>
                  )}

                  {/* Show Initials Button */}
                  {!showInitials && (
                    <div className="text-center">
                      <button
                        onClick={showMovieInitials}
                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                      >
                        <Eye className="w-5 h-5" />
                        <span>Show Initials to Others</span>
                      </button>
                    </div>
                  )}

                  {/* Initials Display */}
                  {showInitials && (
                    <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-8 rounded-xl shadow-lg">
                      <h3 className="text-2xl font-bold text-center mb-2">Guess These Initials!</h3>
                      <p className="text-center text-orange-100 mb-6">
                        {players[currentPlayerIndex].name} is showing • Everyone else guess!
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                          <Star className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm opacity-80">Actor</p>
                          <p className="text-4xl font-bold">{getInitials(currentMovie.actor)}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                          <Star className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm opacity-80">Actress</p>
                          <p className="text-4xl font-bold">{getInitials(currentMovie.actress)}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                          <Film className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm opacity-80">Movie</p>
                          <p className="text-4xl font-bold">{getInitials(currentMovie.movie)}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                          <Music className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm opacity-80">Song</p>
                          <p className="text-4xl font-bold">{getInitials(currentMovie.song)}</p>
                        </div>
                      </div>
                      <div className="text-center mt-6">
                        <p className="text-orange-100 text-sm">
                          🎬 Example: S = Salman, A = Anushka, M = Sultan, J = Jag Ghoomeya
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Guessing Interface */}
                  {showInitials && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(playerGuesses).map(([field, value]) => (
                        <div key={field} className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700 capitalize">
                            {field} {revealedFields[field as keyof typeof revealedFields] && '✅'}
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setPlayerGuesses({...playerGuesses, [field]: e.target.value})}
                              placeholder={`Guess the ${field}...`}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                              disabled={revealedFields[field as keyof typeof revealedFields]}
                            />
                            <button
                              onClick={() => checkGuess(field as keyof typeof playerGuesses)}
                              disabled={!value.trim() || revealedFields[field as keyof typeof revealedFields]}
                              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              Check
                            </button>
                          </div>
                          {revealedFields[field as keyof typeof revealedFields] && (
                            <p className="text-green-600 font-medium">
                              ✅ {currentMovie[field as keyof MovieData]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next Round Button */}
                  {showInitials && (
                    <div className="text-center">
                      <button
                        onClick={nextRound}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                      >
                        <Shuffle className="w-5 h-5" />
                        <span>Next Round</span>
                      </button>
                    </div>
                  )}
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

export default HollywoodBollywoodGame;
