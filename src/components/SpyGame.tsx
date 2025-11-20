import { ArrowLeft, Eye, EyeOff, Users, MessageCircle, Send, Shuffle, RotateCcw, Crown, MapPin } from 'lucide-react';
import MultiplayerManager from '../utils/multiplayer';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  hasFlippedCard: boolean;
}

interface ChatMessage {
  id: string;
  player: string;
  message: string;
  timestamp: Date;
}

interface SpyGameProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const SpyGame: React.FC<SpyGameProps> = ({ onBack, username, roomId }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: username, isHost: true, hasFlippedCard: false }
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [spyPlayer, setSpyPlayer] = useState<string>('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerManager] = useState(() => MultiplayerManager.getInstance());

  // Spy game locations
  const locations = [
    'Hospital', 'Airport', 'Restaurant', 'Library', 'Beach', 'Hotel', 'Casino',
    'School', 'Factory', 'Space Station', 'Cruise Ship', 'Movie Set', 'Amusement Park',
    'Submarine', 'Train Station', 'Police Station', 'Hospitality Suite', 'Zoo', 'Gym',
    'Theater', 'Fire Station', 'Shopping Mall', 'Sports Stadium', 'Embassy', 'Nightclub',
    'Cemetery', 'University Campus', 'Power Plant', 'Courtroom', 'Aquarium', 'Concert Hall',
    'Television Studio', 'Bus Station', 'Military Base', 'Science Lab', 'Botanical Garden',
    'Ski Resort', 'Golf Course', 'Prison', 'Circus', 'Observatory', 'Farm', 'Desert Tent',
    'Mountain Cabin', 'Art Gallery', 'Ferry Terminal', 'Bakery', 'Garage', 'Race Track', 'Park'
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
          hasFlippedCard: false
        }));
        setPlayers(roomPlayers);
        
        // Listen for room updates
        const handleRoomUpdate = (updatedRoom: any) => {
          const updatedPlayers: Player[] = updatedRoom.players.map((playerName: string, index: number) => ({
            id: (index + 1).toString(),
            name: playerName,
            isHost: playerName === updatedRoom.host,
            hasFlippedCard: false
          }));
          setPlayers(updatedPlayers);
        };
        
        multiplayerManager.on(`room:${roomId}`, handleRoomUpdate);
        
        return () => {
          multiplayerManager.off(`room:${roomId}`, handleRoomUpdate);
        };
      } else {
        // Fallback to single player
        setPlayers([{ id: '1', name: username, isHost: true, hasFlippedCard: false }]);
        }
    }
  }, [roomId, username, multiplayerManager]);

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 20) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        isHost: false,
        hasFlippedCard: false
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
    if (players.length >= 3) {
      // Randomly select location
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      setCurrentLocation(randomLocation);
      
      // Randomly select spy
      const randomSpyIndex = Math.floor(Math.random() * players.length);
      setSpyPlayer(players[randomSpyIndex].name);
      
      setGameStarted(true);
      // Reset all card flip states
      setPlayers(prev => prev.map(p => ({ ...p, hasFlippedCard: false })));
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentLocation('');
    setSpyPlayer('');
    setPlayers(prev => prev.map(p => ({ ...p, hasFlippedCard: false })));
  };

  const flipCard = (playerId: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, hasFlippedCard: !p.hasFlippedCard } : p
    ));
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
                className="flex items-center space-x-2 text-slate-600 hover:text-purple-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{isMultiplayer ? 'Back to Room' : 'Back to Games'}</span>
              </button>
              <div className="flex items-center space-x-3">
                <Eye className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Spy Game {isMultiplayer && roomId && <span className="text-sm font-normal">({roomId})</span>}
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
                  <Eye className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Spy Game</h2>
                  {isMultiplayer && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800 font-medium">Multiplayer Room: {roomId}</p>
                      <p className="text-sm text-purple-600">Playing with friends online!</p>
                    </div>
                  )}
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    One player is secretly the spy! Everyone else knows the location. 
                    Ask questions to find the spy, but don't give away the location!
                  </p>
                </div>

                {!isMultiplayer && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Players ({players.length}/20)</h3>
                      {players.length < 20 && (
                        <button
                          onClick={() => setShowAddPlayer(true)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors duration-200"
                        >
                          Add Player
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
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
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                          />
                          <button
                            onClick={addPlayer}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors duration-200"
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
                    disabled={players.length < 3}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Spy Game
                  </button>
                  {players.length < 3 && (
                    <p className="text-sm text-gray-500 mt-2">Need at least 3 players to start</p>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Box (Multiplayer Only) */}
            {isMultiplayer && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
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
                            <span className="font-medium text-sm text-purple-600">{msg.player}</span>
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
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Game Rules */}
            {!isMultiplayer && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">How to Play</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-sm text-slate-600">One player is randomly chosen as the spy</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-sm text-slate-600">Everyone else knows the secret location</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-sm text-slate-600">Ask questions to find the spy without revealing the location</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <p className="text-sm text-slate-600">Spy wins by guessing the location correctly</p>
                  </div>
                </div>
              </div>
            )}
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
              className="flex items-center space-x-2 text-slate-600 hover:text-purple-600 transition-colors duration-200"
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
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-white">Location: {currentLocation}</span>
              </div>
              {isMultiplayer && roomId && (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">{roomId}</span>
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
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Player Cards</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <div key={player.id} className="relative">
                    <div className="p-6 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg">
                          <span className="text-white font-bold">{player.name.charAt(0)}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{player.name}</h3>
                        
                        {player.hasFlippedCard ? (
                          <button
                            onClick={() => flipCard(player.id)}
                            className="w-full p-4 rounded-lg bg-white border-2 border-purple-300 hover:border-purple-400 transition-all duration-200 shadow-lg"
                          >
                            {player.name === spyPlayer ? (
                              <div className="text-center">
                                <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <p className="font-bold text-purple-800">YOU ARE THE SPY!</p>
                                <p className="text-sm text-purple-700 mt-1">Guess the location</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <p className="font-bold text-purple-800 text-lg">{currentLocation}</p>
                                <p className="text-sm text-purple-700 mt-1">Find the spy!</p>
                              </div>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => flipCard(player.id)}
                            className="w-full p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg border-2 border-purple-400 hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                          >
                            <div className="text-center">
                              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-white font-bold">?</span>
                              </div>
                              <p className="text-white font-semibold">Tap to Reveal</p>
                              <p className="text-purple-100 text-sm mt-1">Your secret role</p>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Game Instructions:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Each player should tap their card to see their role privately</li>
                      <li>• Take turns asking questions about the location</li>
                      <li>• Non-spies: Find the spy without revealing the location</li>
                      <li>• Spy: Try to guess the location from the questions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Box (Multiplayer) or Game Info */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            {isMultiplayer ? (
              <>
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
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
                            <span className="font-medium text-sm text-purple-600">{msg.player}</span>
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
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">How to Play</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-sm text-slate-600">One player is randomly chosen as the spy</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-sm text-slate-600">Everyone else knows the secret location</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-sm text-slate-600">Ask questions to find the spy without revealing the location</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <p className="text-sm text-slate-600">Spy wins by guessing the location correctly</p>
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

export default SpyGame;
