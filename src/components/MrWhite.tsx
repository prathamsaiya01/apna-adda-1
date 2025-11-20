import { ArrowLeft, Eye, EyeOff, Users, MessageCircle, Send, Shuffle, RotateCcw, Crown, Target, Vote } from 'lucide-react';
import MultiplayerManager from '../utils/multiplayer';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  hasFlippedCard: boolean;
  votes: number;
  hasVoted: boolean;
}

interface ChatMessage {
  id: string;
  player: string;
  message: string;
  timestamp: Date;
}

interface WordPair {
  majority: string;
  mrWhite: string;
  category: string;
}

interface MrWhiteProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const MrWhite: React.FC<MrWhiteProps> = ({ onBack, username, roomId }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: username, isHost: true, hasFlippedCard: false, votes: 0, hasVoted: false }
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWordPair, setCurrentWordPair] = useState<WordPair | null>(null);
  const [mrWhitePlayer, setMrWhitePlayer] = useState<string>('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [gamePhase, setGamePhase] = useState<'clues' | 'voting' | 'mrwhite_guess' | 'finished'>('clues');
  const [votingResults, setVotingResults] = useState<{player: string, votes: number}[]>([]);
  const [mrWhiteGuess, setMrWhiteGuess] = useState('');
  const [gameWinner, setGameWinner] = useState<'majority' | 'mrwhite' | ''>('');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerManager] = useState(() => MultiplayerManager.getInstance());

  // Word pairs for Mr. White game
  const wordPairs: WordPair[] = [
    // Fruits
    { majority: 'Apple', mrWhite: 'Mango', category: 'Fruits' },
    { majority: 'Orange', mrWhite: 'Lemon', category: 'Fruits' },
    { majority: 'Banana', mrWhite: 'Plantain', category: 'Fruits' },
    { majority: 'Grapes', mrWhite: 'Berries', category: 'Fruits' },
    { majority: 'Watermelon', mrWhite: 'Cantaloupe', category: 'Fruits' },
    
    // Animals
    { majority: 'Lion', mrWhite: 'Tiger', category: 'Animals' },
    { majority: 'Dog', mrWhite: 'Wolf', category: 'Animals' },
    { majority: 'Elephant', mrWhite: 'Rhino', category: 'Animals' },
    { majority: 'Eagle', mrWhite: 'Hawk', category: 'Animals' },
    { majority: 'Dolphin', mrWhite: 'Whale', category: 'Animals' },
    
    // Vehicles
    { majority: 'Car', mrWhite: 'Truck', category: 'Vehicles' },
    { majority: 'Bicycle', mrWhite: 'Motorcycle', category: 'Vehicles' },
    { majority: 'Airplane', mrWhite: 'Helicopter', category: 'Vehicles' },
    { majority: 'Train', mrWhite: 'Metro', category: 'Vehicles' },
    { majority: 'Boat', mrWhite: 'Ship', category: 'Vehicles' },
    
    // Food
    { majority: 'Pizza', mrWhite: 'Burger', category: 'Food' },
    { majority: 'Rice', mrWhite: 'Wheat', category: 'Food' },
    { majority: 'Chocolate', mrWhite: 'Candy', category: 'Food' },
    { majority: 'Coffee', mrWhite: 'Tea', category: 'Food' },
    { majority: 'Bread', mrWhite: 'Roti', category: 'Food' },
    
    // Sports
    { majority: 'Cricket', mrWhite: 'Baseball', category: 'Sports' },
    { majority: 'Football', mrWhite: 'Rugby', category: 'Sports' },
    { majority: 'Tennis', mrWhite: 'Badminton', category: 'Sports' },
    { majority: 'Swimming', mrWhite: 'Diving', category: 'Sports' },
    { majority: 'Basketball', mrWhite: 'Volleyball', category: 'Sports' },
    
    // Colors
    { majority: 'Red', mrWhite: 'Pink', category: 'Colors' },
    { majority: 'Blue', mrWhite: 'Navy', category: 'Colors' },
    { majority: 'Green', mrWhite: 'Lime', category: 'Colors' },
    { majority: 'Yellow', mrWhite: 'Gold', category: 'Colors' },
    { majority: 'Purple', mrWhite: 'Violet', category: 'Colors' },
    
    // Weather
    { majority: 'Rain', mrWhite: 'Storm', category: 'Weather' },
    { majority: 'Snow', mrWhite: 'Hail', category: 'Weather' },
    { majority: 'Sunny', mrWhite: 'Bright', category: 'Weather' },
    { majority: 'Wind', mrWhite: 'Breeze', category: 'Weather' },
    { majority: 'Cloud', mrWhite: 'Fog', category: 'Weather' },
    
    // Objects
    { majority: 'Book', mrWhite: 'Magazine', category: 'Objects' },
    { majority: 'Phone', mrWhite: 'Tablet', category: 'Objects' },
    { majority: 'Chair', mrWhite: 'Stool', category: 'Objects' },
    { majority: 'Pen', mrWhite: 'Pencil', category: 'Objects' },
    { majority: 'Watch', mrWhite: 'Clock', category: 'Objects' },
    
    // Professions
    { majority: 'Doctor', mrWhite: 'Nurse', category: 'Professions' },
    { majority: 'Teacher', mrWhite: 'Professor', category: 'Professions' },
    { majority: 'Chef', mrWhite: 'Cook', category: 'Professions' },
    { majority: 'Pilot', mrWhite: 'Captain', category: 'Professions' },
    { majority: 'Engineer', mrWhite: 'Architect', category: 'Professions' }
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
          isHost: playerName === room.host,
          hasFlippedCard: false,
          votes: 0,
          hasVoted: false
        }));
        setPlayers(roomPlayers);
        
        // Listen for room updates
        const handleRoomUpdate = (updatedRoom: any) => {
          const updatedPlayers: Player[] = updatedRoom.players.map((playerName: string, index: number) => ({
            id: (index + 1).toString(),
            name: playerName,
            isHost: playerName === updatedRoom.host,
            hasFlippedCard: false,
            votes: 0,
            hasVoted: false
          }));
          setPlayers(updatedPlayers);
        };
        
        multiplayerManager.on(`room:${roomId}`, handleRoomUpdate);
        
        return () => {
          multiplayerManager.off(`room:${roomId}`, handleRoomUpdate);
        };
      } else {
        // Fallback to single player
        setPlayers([{ id: '1', name: username, isHost: true, hasFlippedCard: false, votes: 0, hasVoted: false }]);
      }
    }
  }, [roomId, username, multiplayerManager]);

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 20) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        isHost: false,
        hasFlippedCard: false,
        votes: 0,
        hasVoted: false
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
    if (players.length >= 6) {
      // Randomly select word pair
      const randomWordPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
      setCurrentWordPair(randomWordPair);
      
      // Randomly select Mr. White
      const randomMrWhiteIndex = Math.floor(Math.random() * players.length);
      setMrWhitePlayer(players[randomMrWhiteIndex].name);
      
      setGameStarted(true);
      setGamePhase('clues');
      // Reset all card flip states
      setPlayers(prev => prev.map(p => ({ ...p, hasFlippedCard: false, votes: 0, hasVoted: false })));
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentWordPair(null);
    setMrWhitePlayer('');
    setGamePhase('clues');
    setVotingResults([]);
    setMrWhiteGuess('');
    setGameWinner('');
    setPlayers(prev => prev.map(p => ({ ...p, hasFlippedCard: false, votes: 0, hasVoted: false })));
  };

  const flipCard = (playerId: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, hasFlippedCard: !p.hasFlippedCard } : p
    ));
  };

  const startVoting = () => {
    setGamePhase('voting');
    setPlayers(prev => prev.map(p => ({ ...p, votes: 0, hasVoted: false })));
  };

  const voteForPlayer = (votedPlayerId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === votedPlayerId) {
        return { ...p, votes: p.votes + 1 };
      }
      if (p.name === username) {
        return { ...p, hasVoted: true };
      }
      return p;
    }));
  };

  const finishVoting = () => {
    const results = players.map(p => ({ player: p.name, votes: p.votes }))
                          .sort((a, b) => b.votes - a.votes);
    setVotingResults(results);
    
    const mostVotedPlayer = results[0].player;
    
    if (mostVotedPlayer === mrWhitePlayer) {
      // Mr. White was voted out - they get a chance to guess
      setGamePhase('mrwhite_guess');
    } else {
      // Wrong person voted out - Mr. White wins
      setGameWinner('mrwhite');
      setGamePhase('finished');
    }
  };

  const submitMrWhiteGuess = () => {
    if (mrWhiteGuess.toLowerCase().trim() === currentWordPair?.majority.toLowerCase()) {
      setGameWinner('mrwhite');
    } else {
      setGameWinner('majority');
    }
    setGamePhase('finished');
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        player: username,
        message: newMessage.trim(),
        timestamp: new Date()
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                  Mr. White {isMultiplayer && roomId && <span className="text-sm font-normal">({roomId})</span>}
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
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Mr. White</h2>
                  {isMultiplayer && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 font-medium">Multiplayer Room: {roomId}</p>
                      <p className="text-sm text-orange-600">Playing with friends online!</p>
                    </div>
                  )}
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    5 players get the same word, 1 player (Mr. White) gets a related word. 
                    Give clues to find Mr. White, but don't reveal your word!
                  </p>
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
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-slate-900">{player.name}</span>
                                {player.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                              </div>
                              <p className="text-sm text-slate-600">Ready to play</p>
                            </div>
                          </div>
                          {!player.isHost && players.length > 1 && (
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
                    disabled={players.length < 6}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Mr. White Game
                  </button>
                  {players.length < 6 && (
                    <p className="text-sm text-gray-500 mt-2">Need at least 6 players to start</p>
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
                  <p className="text-sm text-slate-600">5 players get the same word, 1 gets a related word (Mr. White)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-sm text-slate-600">Give clues about your word without saying it directly</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-sm text-slate-600">Vote to eliminate who you think is Mr. White</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-sm text-slate-600">If Mr. White is caught, they can guess the majority word to win</p>
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
              onClick={resetGame}
              className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
            >
              <RotateCcw className="w-5 h-5" />
              <span>New Game</span>
            </button>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-300" />
                <span className="text-white">{players.length} players</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-white">
                  {gamePhase === 'clues' && 'Clue Phase'}
                  {gamePhase === 'voting' && 'Voting Phase'}
                  {gamePhase === 'mrwhite_guess' && 'Mr. White Guess'}
                  {gamePhase === 'finished' && 'Game Over'}
                </span>
              </div>
              {isMultiplayer && roomId && (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-medium">{roomId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Cards */}
          <div className="lg:col-span-2">
            {gamePhase === 'clues' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Player Cards</h2>
                  <button
                    onClick={startVoting}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Vote className="w-4 h-4" />
                    <span>Start Voting</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {players.map((player) => (
                    <div key={player.id} className="relative">
                      <div className="p-6 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-r from-orange-500 to-purple-600 shadow-lg">
                            <span className="text-white font-bold">{player.name.charAt(0)}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 mb-2">{player.name}</h3>
                          
                          {player.hasFlippedCard ? (
                            <button
                              onClick={() => flipCard(player.id)}
                              className="w-full p-4 rounded-lg bg-white border-2 border-orange-300 hover:border-orange-400 transition-all duration-200 shadow-lg"
                            >
                              {player.name === mrWhitePlayer ? (
                                <div className="text-center">
                                  <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                  <p className="font-bold text-orange-800">YOU ARE MR. WHITE!</p>
                                  <p className="text-lg font-bold text-orange-700 mt-1">{currentWordPair?.mrWhite}</p>
                                  <p className="text-sm text-orange-600 mt-1">Guess the majority word</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                  <p className="font-bold text-blue-800">MAJORITY WORD</p>
                                  <p className="text-lg font-bold text-blue-700 mt-1">{currentWordPair?.majority}</p>
                                  <p className="text-sm text-blue-600 mt-1">Find Mr. White!</p>
                                </div>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => flipCard(player.id)}
                              className="w-full p-4 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg border-2 border-orange-400 hover:from-orange-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                              <div className="text-center">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-white font-bold">?</span>
                                </div>
                                <p className="text-white font-semibold">Tap to Reveal</p>
                                <p className="text-orange-100 text-sm mt-1">Your secret word</p>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Clue Phase Instructions:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Each player should tap their card to see their word privately</li>
                        <li>• Take turns giving clues about your word (without saying it directly)</li>
                        <li>• Listen carefully to identify who might be Mr. White</li>
                        <li>• When ready, click "Start Voting" to eliminate suspected Mr. White</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {gamePhase === 'voting' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Voting Phase</h2>
                <p className="text-slate-600 mb-6">Vote for who you think is Mr. White:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => voteForPlayer(player.id)}
                      disabled={players.find(p => p.name === username)?.hasVoted}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-semibold">{player.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-slate-900">{player.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Votes: {player.votes}</span>
                        <Vote className="w-4 h-4 text-orange-600" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={finishVoting}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors duration-200"
                  >
                    Finish Voting
                  </button>
                </div>
              </div>
            )}

            {gamePhase === 'mrwhite_guess' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Mr. White's Last Chance!</h2>
                <p className="text-slate-600 mb-6">
                  <strong>{mrWhitePlayer}</strong> was voted out as Mr. White! 
                  They can now guess the majority word to win the game.
                </p>
                
                {username === mrWhitePlayer ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Guess the majority word:
                      </label>
                      <input
                        type="text"
                        value={mrWhiteGuess}
                        onChange={(e) => setMrWhiteGuess(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        placeholder="Enter your guess..."
                      />
                    </div>
                    <button
                      onClick={submitMrWhiteGuess}
                      disabled={!mrWhiteGuess.trim()}
                      className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Submit Guess
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                    <p className="text-lg text-slate-700">Waiting for {mrWhitePlayer} to make their guess...</p>
                  </div>
                )}
              </div>
            )}

            {gamePhase === 'finished' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">
                    {gameWinner === 'mrwhite' ? '🎯' : '👥'}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Game Over!</h2>
                  
                  {gameWinner === 'mrwhite' ? (
                    <div>
                      <p className="text-xl text-orange-600 font-semibold mb-2">Mr. White Wins!</p>
                      <p className="text-slate-600 mb-4">
                        {mrWhitePlayer} successfully {votingResults.length > 0 && votingResults[0].player === mrWhitePlayer 
                          ? 'guessed the majority word' 
                          : 'avoided being voted out'}!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl text-blue-600 font-semibold mb-2">Majority Wins!</p>
                      <p className="text-slate-600 mb-4">
                        The majority successfully identified and eliminated Mr. White!
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-2">Game Summary:</h3>
                    <p className="text-sm text-slate-600">
                      <strong>Majority Word:</strong> {currentWordPair?.majority}<br/>
                      <strong>Mr. White Word:</strong> {currentWordPair?.mrWhite}<br/>
                      <strong>Mr. White:</strong> {mrWhitePlayer}<br/>
                      <strong>Category:</strong> {currentWordPair?.category}
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={onBack}
                      className="px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-colors duration-200"
                    >
                      Back to Games
                    </button>
                    <button
                      onClick={resetGame}
                      className="px-6 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors duration-200"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Box (Multiplayer) or Game Info */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            {isMultiplayer ? (
              <>
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Room Chat</h3>
                  </div>
                </div>
                <div className="p-4 h-96 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {chatMessages.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No messages yet...</p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-orange-600">{msg.player}</span>
                            <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                          </div>
                          <p className="text-slate-800 bg-slate-50 rounded-lg px-3 py-2">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Game Info</h3>
                </div>
                <div className="p-6 space-y-4">
                  {currentWordPair && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Current Game:</h4>
                      <p className="text-sm text-orange-700">
                        <strong>Category:</strong> {currentWordPair.category}<br/>
                        <strong>Phase:</strong> {gamePhase.charAt(0).toUpperCase() + gamePhase.slice(1).replace('_', ' ')}<br/>
                        <strong>Players:</strong> {players.length}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Winning Conditions:</h4>
                    <div className="text-sm text-slate-600 space-y-2">
                      <p>• <strong>Mr. White wins if:</strong> They avoid being voted out OR correctly guess the majority word after being voted out</p>
                      <p>• <strong>Majority wins if:</strong> They vote out Mr. White AND Mr. White fails to guess their word</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MrWhite;
