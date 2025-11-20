import { ArrowLeft, Users, MessageCircle, Send, Eye, EyeOff, Crown, Target, Clock, Star, ThumbsUp, ThumbsDown, HelpCircle, Minus } from 'lucide-react';
import MultiplayerManager from '../utils/multiplayer';

interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
  guessesLeft: number;
}

interface ChatMessage {
  id: string;
  player: string;
  message: string;
  timestamp: Date;
  type: 'question' | 'answer' | 'guess' | 'system';
  response?: 'yes' | 'no' | 'maybe-yes' | 'maybe-no' | 'not-sure';
}

interface Celebrity {
  id: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface WhoAmIProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const WhoAmI: React.FC<WhoAmIProps> = ({ onBack, username, roomId }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: username, score: 0, isActive: true, guessesLeft: 3 }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCelebrity, setCurrentCelebrity] = useState<Celebrity | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newGuess, setNewGuess] = useState('');
  const [gameRound, setGameRound] = useState(1);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [gameWinner, setGameWinner] = useState<string>('');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerManager] = useState(() => MultiplayerManager.getInstance());
  const [showCelebrityName, setShowCelebrityName] = useState(false);

  // Celebrity database
  const celebrities: Celebrity[] = [
    // Bollywood Actors
    { id: '1', name: 'Shah Rukh Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
    { id: '2', name: 'Salman Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
    { id: '3', name: 'Aamir Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
    { id: '4', name: 'Akshay Kumar', category: 'Bollywood Actor', difficulty: 'Easy' },
    { id: '5', name: 'Ranveer Singh', category: 'Bollywood Actor', difficulty: 'Medium' },
    { id: '6', name: 'Ranbir Kapoor', category: 'Bollywood Actor', difficulty: 'Medium' },
    { id: '7', name: 'Varun Dhawan', category: 'Bollywood Actor', difficulty: 'Medium' },
    { id: '8', name: 'Rajkummar Rao', category: 'Bollywood Actor', difficulty: 'Hard' },
    
    // Bollywood Actresses
    { id: '9', name: 'Deepika Padukone', category: 'Bollywood Actress', difficulty: 'Easy' },
    { id: '10', name: 'Priyanka Chopra', category: 'Bollywood Actress', difficulty: 'Easy' },
    { id: '11', name: 'Kareena Kapoor', category: 'Bollywood Actress', difficulty: 'Easy' },
    { id: '12', name: 'Alia Bhatt', category: 'Bollywood Actress', difficulty: 'Medium' },
    { id: '13', name: 'Katrina Kaif', category: 'Bollywood Actress', difficulty: 'Medium' },
    { id: '14', name: 'Anushka Sharma', category: 'Bollywood Actress', difficulty: 'Medium' },
    { id: '15', name: 'Kriti Sanon', category: 'Bollywood Actress', difficulty: 'Hard' },
    
    // Cricketers
    { id: '16', name: 'Virat Kohli', category: 'Cricketer', difficulty: 'Easy' },
    { id: '17', name: 'MS Dhoni', category: 'Cricketer', difficulty: 'Easy' },
    { id: '18', name: 'Rohit Sharma', category: 'Cricketer', difficulty: 'Easy' },
    { id: '19', name: 'Hardik Pandya', category: 'Cricketer', difficulty: 'Medium' },
    { id: '20', name: 'KL Rahul', category: 'Cricketer', difficulty: 'Medium' },
    { id: '21', name: 'Jasprit Bumrah', category: 'Cricketer', difficulty: 'Hard' },
    
    // Singers
    { id: '22', name: 'Arijit Singh', category: 'Singer', difficulty: 'Easy' },
    { id: '23', name: 'Shreya Ghoshal', category: 'Singer', difficulty: 'Easy' },
    { id: '24', name: 'Armaan Malik', category: 'Singer', difficulty: 'Medium' },
    { id: '25', name: 'Neha Kakkar', category: 'Singer', difficulty: 'Medium' },
    { id: '26', name: 'Rahat Fateh Ali Khan', category: 'Singer', difficulty: 'Hard' },
    
    // Directors
    { id: '27', name: 'Karan Johar', category: 'Director', difficulty: 'Medium' },
    { id: '28', name: 'Rohit Shetty', category: 'Director', difficulty: 'Medium' },
    { id: '29', name: 'Sanjay Leela Bhansali', category: 'Director', difficulty: 'Hard' },
    
    // Sports
    { id: '30', name: 'PV Sindhu', category: 'Badminton Player', difficulty: 'Medium' },
    { id: '31', name: 'Mary Kom', category: 'Boxer', difficulty: 'Medium' },
    { id: '32', name: 'Neeraj Chopra', category: 'Javelin Thrower', difficulty: 'Hard' },
    
    // Influencers/YouTubers
    { id: '33', name: 'CarryMinati', category: 'YouTuber', difficulty: 'Medium' },
    { id: '34', name: 'Bhuvan Bam', category: 'YouTuber', difficulty: 'Medium' },
    { id: '35', name: 'Ashish Chanchlani', category: 'YouTuber', difficulty: 'Hard' }
  ];

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
          isActive: true,
          guessesLeft: 3
        }));
        setPlayers(roomPlayers);
        
        const handleRoomUpdate = (updatedRoom: any) => {
          const updatedPlayers: Player[] = updatedRoom.players.map((playerName: string, index: number) => ({
            id: (index + 1).toString(),
            name: playerName,
            score: 0,
            isActive: true,
            guessesLeft: 3
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

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0,
        isActive: true,
        guessesLeft: 3
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
    if (players.length >= 2) {
      setGameStarted(true);
      setGameRound(1);
      generateNewCelebrity();
      setQuestionsAsked(0);
      setChatMessages([]);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        player: 'System',
        message: `🎭 Round ${gameRound} started! ${players[currentPlayerIndex].name} has the celebrity name. Others can ask up to 20 Yes/No questions and have 3 guesses each!`,
        timestamp: new Date(),
        type: 'system'
      };
      setChatMessages([welcomeMessage]);
    }
  };

  const generateNewCelebrity = () => {
    const randomCelebrity = celebrities[Math.floor(Math.random() * celebrities.length)];
    setCurrentCelebrity(randomCelebrity);
    setShowCelebrityName(false);
  };

  const sendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || questionsAsked >= 20) return;

    const questionMessage: ChatMessage = {
      id: Date.now().toString(),
      player: username,
      message: newQuestion.trim(),
      timestamp: new Date(),
      type: 'question'
    };

    setChatMessages(prev => [...prev, questionMessage]);
    setQuestionsAsked(prev => prev + 1);
    setNewQuestion('');
  };

  const respondToQuestion = (response: 'yes' | 'no' | 'maybe-yes' | 'maybe-no' | 'not-sure') => {
    if (chatMessages.length === 0) return;
    
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (lastMessage.type !== 'question' || lastMessage.response) return;

    const responseText = {
      'yes': '✅ Yes',
      'no': '❌ No',
      'maybe-yes': '🤔 Maybe Yes',
      'maybe-no': '🤷 Maybe No',
      'not-sure': '❓ Not Sure'
    }[response];

    const answerMessage: ChatMessage = {
      id: Date.now().toString(),
      player: players[currentPlayerIndex].name,
      message: responseText,
      timestamp: new Date(),
      type: 'answer',
      response
    };

    setChatMessages(prev => [...prev, answerMessage]);
  };

  const submitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuess.trim() || !currentCelebrity) return;

    const isCorrect = newGuess.toLowerCase().trim() === currentCelebrity.name.toLowerCase();
    
    const guessMessage: ChatMessage = {
      id: Date.now().toString(),
      player: username,
      message: `🎯 Guess: ${newGuess.trim()}`,
      timestamp: new Date(),
      type: 'guess'
    };

    setChatMessages(prev => [...prev, guessMessage]);

    if (isCorrect) {
      // Correct guess - player wins points
      setPlayers(prev => prev.map(player => 
        player.name === username 
          ? { ...player, score: player.score + getDifficultyPoints(currentCelebrity.difficulty) }
          : player
      ));

      const winMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        player: 'System',
        message: `🎉 ${username} guessed correctly! The answer was ${currentCelebrity.name}. +${getDifficultyPoints(currentCelebrity.difficulty)} points!`,
        timestamp: new Date(),
        type: 'system'
      };

      setChatMessages(prev => [...prev, winMessage]);
      
      setTimeout(() => {
        nextRound();
      }, 3000);
    } else {
      // Wrong guess - reduce guesses
      setPlayers(prev => prev.map(player => 
        player.name === username 
          ? { ...player, guessesLeft: Math.max(0, player.guessesLeft - 1) }
          : player
      ));

      const wrongMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        player: 'System',
        message: `❌ Wrong guess! ${username} has ${Math.max(0, players.find(p => p.name === username)?.guessesLeft! - 1)} guesses left.`,
        timestamp: new Date(),
        type: 'system'
      };

      setChatMessages(prev => [...prev, wrongMessage]);

      // Check if player is out of guesses
      const currentPlayer = players.find(p => p.name === username);
      if (currentPlayer && currentPlayer.guessesLeft <= 1) {
        const eliminatedMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          player: 'System',
          message: `💔 ${username} is out of guesses!`,
          timestamp: new Date(),
          type: 'system'
        };

        setChatMessages(prev => [...prev, eliminatedMessage]);
      }
    }

    setNewGuess('');
  };

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 1;
      case 'Medium': return 2;
      case 'Hard': return 3;
      default: return 1;
    }
  };

  const nextRound = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setGameRound(prev => prev + 1);
    generateNewCelebrity();
    setQuestionsAsked(0);
    setPlayers(prev => prev.map(p => ({ ...p, guessesLeft: 3 })));
    setChatMessages([]);
    
    const newRoundMessage: ChatMessage = {
      id: Date.now().toString(),
      player: 'System',
      message: `🎭 Round ${gameRound + 1} started! ${players[(currentPlayerIndex + 1) % players.length].name} has the new celebrity name!`,
      timestamp: new Date(),
      type: 'system'
    };
    setChatMessages([newRoundMessage]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                <Target className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Who Am I? {isMultiplayer && roomId && <span className="text-sm font-normal">({roomId})</span>}
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
                  <Target className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Who Am I?</h2>
                  {isMultiplayer && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800 font-medium">Multiplayer Room: {roomId}</p>
                      <p className="text-sm text-purple-600">Playing with friends online!</p>
                    </div>
                  )}
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    🎭 Guess the celebrity through Yes/No questions! One player gets a secret name, 
                    others ask up to 20 questions and have 3 guesses each to identify the celebrity.
                  </p>
                </div>

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
                              <p className="text-sm text-slate-600">Ready to guess!</p>
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
                    disabled={players.length < 2}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Who Am I!
                  </button>
                  {players.length < 2 && (
                    <p className="text-sm text-gray-500 mt-2">Need at least 2 players to start</p>
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
                  <p className="text-sm text-slate-600">One player gets a secret celebrity name</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-sm text-slate-600">Others ask up to 20 Yes/No questions</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-sm text-slate-600">Each player has 3 chances to guess the name</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-sm text-slate-600">Score points for correct guesses based on difficulty</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Celebrity Categories</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• Bollywood Actors & Actresses</p>
                  <p>• Cricketers & Sports Stars</p>
                  <p>• Singers & Musicians</p>
                  <p>• Directors & YouTubers</p>
                  <p>• And many more!</p>
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
                <MessageCircle className="w-5 h-5 text-slate-300" />
                <span className="text-white">{questionsAsked}/20 questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-slate-300" />
                <span className="text-white">Round {gameRound}</span>
              </div>
              {isMultiplayer && roomId && (
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-400" />
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
            {/* Current Player & Celebrity */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">{players[currentPlayerIndex].name.charAt(0)}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{players[currentPlayerIndex].name} has the celebrity!</h3>
                <p className="text-slate-600">Others can ask Yes/No questions and make guesses</p>
              </div>

              {currentCelebrity && (
                <div className="space-y-6">
                  {/* Celebrity Name for Current Player */}
                  {players[currentPlayerIndex].name === username && (
                    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(currentCelebrity.difficulty)} text-white`}>
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-medium">{currentCelebrity.difficulty}</span>
                        </div>
                        <button
                          onClick={() => setShowCelebrityName(!showCelebrityName)}
                          className="flex items-center space-x-2 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                        >
                          {showCelebrityName ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <span className="text-sm">{showCelebrityName ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      
                      {showCelebrityName && (
                        <div className="text-center">
                          <h2 className="text-3xl font-bold mb-2">{currentCelebrity.name}</h2>
                          <p className="text-slate-300">{currentCelebrity.category}</p>
                        </div>
                      )}
                      
                      {!showCelebrityName && (
                        <div className="text-center">
                          <p className="text-slate-300 mb-2">Your Celebrity:</p>
                          <p className="text-lg font-medium">Click "Show" to reveal the name</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Response Buttons for Current Player */}
                  {players[currentPlayerIndex].name === username && chatMessages.length > 0 && 
                   chatMessages[chatMessages.length - 1].type === 'question' && 
                   !chatMessages[chatMessages.length - 1].response && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                      <h4 className="font-semibold text-orange-800 mb-4 text-center">
                        Respond to: "{chatMessages[chatMessages.length - 1].message}"
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <button
                          onClick={() => respondToQuestion('yes')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => respondToQuestion('no')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>No</span>
                        </button>
                        <button
                          onClick={() => respondToQuestion('maybe-yes')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Maybe Yes</span>
                        </button>
                        <button
                          onClick={() => respondToQuestion('maybe-no')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <Minus className="w-4 h-4" />
                          <span>Maybe No</span>
                        </button>
                        <button
                          onClick={() => respondToQuestion('not-sure')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Not Sure</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question Form for Other Players */}
                  {players[currentPlayerIndex].name !== username && questionsAsked < 20 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h4 className="font-semibold text-blue-800 mb-4">Ask a Yes/No Question</h4>
                      <form onSubmit={sendQuestion} className="flex space-x-3">
                        <input
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="e.g., Is this person a male actor?"
                          className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!newQuestion.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Ask</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Guess Form for Other Players */}
                  {players[currentPlayerIndex].name !== username && 
                   players.find(p => p.name === username)?.guessesLeft! > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <h4 className="font-semibold text-green-800 mb-4">
                        Make a Guess ({players.find(p => p.name === username)?.guessesLeft} left)
                      </h4>
                      <form onSubmit={submitGuess} className="flex space-x-3">
                        <input
                          type="text"
                          value={newGuess}
                          onChange={(e) => setNewGuess(e.target.value)}
                          placeholder="Enter celebrity name..."
                          className="flex-1 px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!newGuess.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Target className="w-4 h-4" />
                          <span>Guess</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Game Chat</h3>
              </div>
              <div className="p-6 h-96 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Game chat will appear here...</p>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col space-y-1 ${
                        msg.type === 'system' ? 'items-center' : 'items-start'
                      }`}>
                        {msg.type === 'system' ? (
                          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                            {msg.message}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium text-sm ${
                                msg.type === 'question' ? 'text-blue-600' :
                                msg.type === 'answer' ? 'text-orange-600' :
                                msg.type === 'guess' ? 'text-green-600' :
                                'text-slate-600'
                              }`}>
                                {msg.player}
                              </span>
                              <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                              {msg.type === 'question' && <MessageCircle className="w-3 h-3 text-blue-500" />}
                              {msg.type === 'guess' && <Target className="w-3 h-3 text-green-500" />}
                            </div>
                            <p className={`px-4 py-2 rounded-lg max-w-md ${
                              msg.type === 'question' ? 'bg-blue-100 text-blue-800' :
                              msg.type === 'answer' ? 'bg-orange-100 text-orange-800' :
                              msg.type === 'guess' ? 'bg-green-100 text-green-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {msg.message}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scoreboard & Game Info */}
          <div className="space-y-6">
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
                              <p className="text-xs text-orange-600 font-medium">Has Celebrity</p>
                            )}
                            {player.name !== players[currentPlayerIndex].name && (
                              <p className="text-xs text-slate-600">{player.guessesLeft} guesses left</p>
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

            {/* Game Status */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Game Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Round:</span>
                  <span className="font-medium">{gameRound}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Questions Asked:</span>
                  <span className="font-medium">{questionsAsked}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Player:</span>
                  <span className="font-medium">{players[currentPlayerIndex].name}</span>
                </div>
                {currentCelebrity && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Category:</span>
                    <span className="font-medium">{currentCelebrity.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhoAmI;
