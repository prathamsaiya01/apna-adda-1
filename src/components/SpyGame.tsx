import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Users,
  MessageCircle,
  Send,
  RotateCcw,
  Crown,
  MapPin,
  Wifi,
  Vote,
  Target
} from 'lucide-react';
import { socket, getUserId } from '../socket';
import { secureChoice, secureRandomIndex } from '../utils/secureRandom';

interface Player {
  id: string;
  userId?: string;
  name: string;
  isHost: boolean;
  hasFlippedCard: boolean;
  votes?: number;
  hasVoted?: boolean;
}

interface ChatMessage {
  id: string;
  player: string;
  message: string;
  timestamp: string | Date;
}

interface PrivateCard {
  isSpy: boolean;
  location: string | null;
}

interface SpyGameProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const SpyGame: React.FC<SpyGameProps> = ({ onBack, username, roomId }) => {
  const userId = getUserId();
  const isMultiplayer = !!roomId;

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', userId, name: username, isHost: true, hasFlippedCard: false }
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [spyPlayer, setSpyPlayer] = useState<string>('');
  const [myPrivateCard, setMyPrivateCard] = useState<PrivateCard | null>(null);
  const [gamePhase, setGamePhase] = useState<'playing' | 'voting' | 'finished'>('playing');
  const [gameWinner, setGameWinner] = useState<string>('');
  const [winReason, setWinReason] = useState<string>('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [spyGuessLocation, setSpyGuessLocation] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fallback locations for single-player local mode
  const localLocations = [
    'Hospital', 'Airport', 'Restaurant', 'Library', 'Beach', 'Hotel', 'Casino',
    'School', 'Space Station', 'Cruise Ship', 'Movie Set', 'Amusement Park',
    'Submarine', 'Train Station', 'Police Station', 'Zoo', 'Gym', 'Theater'
  ];

  // ---------------- MULTIPLAYER SYNC ----------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    socket.emit('joinGame', { roomId, userId }, (res: any) => {
      if (res?.error) console.warn('joinGame error:', res.error);
    });

    const handleGameState = (payload: any) => {
      if (payload.gameKey !== 'SpyGame') return;
      const s = payload.state;
      if (!s) return;

      setPlayers(s.players || []);
      setGamePhase(s.gamePhase || 'playing');
      setGameWinner(s.gameWinner || '');
      setWinReason(s.winReason || '');
      setChatMessages(s.chatMessages || []);
      setGameStarted(true);

      if (s.currentLocation) setCurrentLocation(s.currentLocation);
      if (s.spyPlayerName) setSpyPlayer(s.spyPlayerName);
    };

    const handlePrivateState = (payload: any) => {
      if (payload.gameKey !== 'SpyGame') return;
      if (payload.privateCard) {
        setMyPrivateCard(payload.privateCard);
      }
    };

    socket.on('gameStateUpdate', handleGameState);
    socket.on('privateStateUpdate', handlePrivateState);

    // Initial private card fetch
    socket.emit('gameAction', { roomId, action: 'getPrivateCard', payload: { userId } }, (res: any) => {
      if (res?.card) setMyPrivateCard(res.card);
    });

    return () => {
      socket.off('gameStateUpdate', handleGameState);
      socket.off('privateStateUpdate', handlePrivateState);
    };
  }, [isMultiplayer, roomId, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addLocalPlayer = () => {
    if (newPlayerName.trim() && players.length < 20) {
      setPlayers([
        ...players,
        {
          id: Date.now().toString(),
          userId: 'user-' + Date.now(),
          name: newPlayerName.trim(),
          isHost: false,
          hasFlippedCard: false
        }
      ]);
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const removeLocalPlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const startLocalGame = () => {
    if (players.length >= 3) {
      const loc = secureChoice(localLocations) || localLocations[0];
      setCurrentLocation(loc);
      const rand = secureRandomIndex(players.length);
      setSpyPlayer(players[rand].name);
      setGameStarted(true);
      setGamePhase('playing');
      setPlayers(prev => prev.map(p => ({ ...p, hasFlippedCard: false })));
    }
  };

  const resetGame = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'restartGame', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
    } else {
      setGameStarted(false);
      setCurrentLocation('');
      setSpyPlayer('');
      setGamePhase('playing');
      setGameWinner('');
      setWinReason('');
      setPlayers(prev => prev.map(p => ({ ...p, hasFlippedCard: false })));
    }
  };

  const flipCard = (id: string) => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'flipCard', payload: { userId } });
      return;
    }
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, hasFlippedCard: !p.hasFlippedCard } : p)));
  };

  const startVoting = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'startVoting', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    setGamePhase('voting');
  };

  const votePlayer = (targetId: string) => {
    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'votePlayer',
          payload: { targetUserId: targetId, userId }
        },
        (res: any) => {
          if (res?.error) alert(res.error);
        }
      );
    }
  };

  const submitSpyGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spyGuessLocation.trim()) return;

    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'spyGuessLocation',
          payload: { location: spyGuessLocation.trim(), userId }
        },
        (res: any) => {
          if (res?.error) alert(res.error);
          else setSpyGuessLocation('');
        }
      );
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (isMultiplayer && roomId) {
      socket.emit('gameAction', {
        roomId,
        action: 'sendChat',
        payload: { message: newMessage.trim(), userId }
      });
      setNewMessage('');
      return;
    }

    const msg: ChatMessage = {
      id: Date.now().toString(),
      player: username,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const myPlayer = players.find(p => p.userId === userId || p.name === username);
  const isMeSpy = myPrivateCard ? myPrivateCard.isSpy : myPlayer?.name === spyPlayer;
  const myLocation = myPrivateCard ? myPrivateCard.location : currentLocation;

  // Single player setup
  if (!gameStarted && !isMultiplayer) {
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
                <span>Back to Games</span>
              </button>
              <div className="flex items-center space-x-3">
                <Eye className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Spy Game
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Eye className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Spy Game</h2>
              <p className="text-slate-600">
                One player is secretly the spy! Everyone else knows the secret location.
                Ask questions to find the spy, but don't give away the location!
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Players ({players.length}/20)</h3>
                <button
                  onClick={() => setShowAddPlayer(true)}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-semibold"
                >
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
                  <button onClick={addLocalPlayer} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold">
                    Add
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={startLocalGame}
              disabled={players.length < 3}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              Start Game
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Active game view
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
              <span>Back to Games</span>
            </button>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-300" />
                <span className="text-white">{players.length} players</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                <Eye className="w-4 h-4 text-purple-300" />
                <span className="font-semibold text-sm text-white">
                  {gamePhase === 'playing' ? 'Investigation' : gamePhase === 'voting' ? 'Voting Phase' : 'Game Over'}
                </span>
              </div>
              {isMultiplayer && roomId && (
                <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
                  <Wifi className="w-4 h-4 text-blue-300 animate-pulse" />
                  <span className="text-blue-200 font-mono text-sm">{roomId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Cards & Status */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Player Cards</h2>
                  <p className="text-xs text-slate-500">Tap your personal card to view your role.</p>
                </div>
                {gamePhase === 'playing' && (
                  <button
                    onClick={startVoting}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow hover:opacity-90 flex items-center space-x-2"
                  >
                    <Vote className="w-4 h-4" />
                    <span>Accuse / Vote</span>
                  </button>
                )}
              </div>

              {/* Player Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {players.map(player => {
                  const isMe = player.userId === userId || player.name === username;

                  return (
                    <div key={player.userId || player.id} className="relative">
                      <div className="p-5 rounded-xl border-2 transition-all bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-r from-purple-500 to-blue-600 shadow-md">
                            <span className="text-white font-bold">{player.name.charAt(0)}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 mb-2">
                            {player.name} {isMe && <span className="text-xs text-purple-600">(You)</span>}
                          </h3>

                          {isMe ? (
                            player.hasFlippedCard ? (
                              <button
                                onClick={() => flipCard(player.id)}
                                className="w-full p-4 rounded-xl bg-white border-2 border-purple-400 shadow transition"
                              >
                                {isMeSpy ? (
                                  <div className="text-center">
                                    <Eye className="w-7 h-7 text-purple-600 mx-auto mb-1 animate-pulse" />
                                    <p className="font-black text-purple-800 text-xs">YOU ARE THE SPY!</p>
                                    <p className="text-xs text-purple-600 mt-1">
                                      Blend in & guess the secret location!
                                    </p>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <MapPin className="w-7 h-7 text-emerald-600 mx-auto mb-1" />
                                    <p className="font-black text-emerald-800 text-xs">SECRET LOCATION</p>
                                    <p className="text-lg font-black text-emerald-700 mt-1">{myLocation}</p>
                                    <p className="text-[10px] text-emerald-600 mt-0.5">Find who doesn't know it!</p>
                                  </div>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => flipCard(player.id)}
                                className="w-full p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white font-bold shadow hover:scale-[1.02] transition"
                              >
                                <EyeOff className="w-6 h-6 mx-auto mb-1 opacity-80" />
                                <p className="text-sm">Tap to Reveal</p>
                              </button>
                            )
                          ) : (
                            <div className="w-full p-4 bg-slate-200 rounded-xl text-slate-500 text-xs font-semibold flex items-center justify-center">
                              <span>{player.hasFlippedCard ? 'Card Revealed' : 'Card Hidden'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Spy Guess Location Box (visible only to Spy) */}
              {isMeSpy && gamePhase !== 'finished' && (
                <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-5 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-purple-900 text-sm">
                      Spy Escape: Guess the Secret Location
                    </h4>
                  </div>
                  <form onSubmit={submitSpyGuess} className="flex space-x-2">
                    <input
                      type="text"
                      value={spyGuessLocation}
                      onChange={e => setSpyGuessLocation(e.target.value)}
                      placeholder="e.g. Hospital, Airport, Library..."
                      className="flex-1 px-4 py-2.5 border border-purple-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!spyGuessLocation.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm disabled:opacity-50"
                    >
                      Guess & Win
                    </button>
                  </form>
                </div>
              )}

              {/* Voting Phase */}
              {gamePhase === 'voting' && (
                <div className="p-5 bg-slate-50 rounded-2xl border mb-6">
                  <h4 className="font-bold text-slate-900 mb-3 text-sm">Vote for the Suspected Spy:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {players.map(p => (
                      <button
                        key={p.userId || p.id}
                        onClick={() => votePlayer(p.userId || p.id)}
                        disabled={myPlayer?.hasVoted}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:bg-purple-50 transition disabled:opacity-60"
                      >
                        <span className="font-bold text-sm text-slate-800">{p.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full">
                            Votes: {p.votes || 0}
                          </span>
                          <Vote className="w-4 h-4 text-purple-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Finished Results */}
              {gamePhase === 'finished' && (
                <div className="p-6 bg-slate-50 rounded-2xl border text-center">
                  <div className="text-5xl mb-3">{gameWinner === 'spy' ? '🕵️‍♂️' : '🎉'}</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">
                    {gameWinner === 'spy' ? 'The Spy Wins!' : 'The Civilians Win!'}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">{winReason}</p>
                  <p className="text-xs text-slate-500 mb-6">
                    Location: <strong>{currentLocation}</strong> • Spy: <strong>{spyPlayer}</strong>
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button onClick={onBack} className="px-5 py-2 bg-slate-700 text-white rounded-xl text-sm font-bold">
                      Back to Games
                    </button>
                    <button
                      onClick={resetGame}
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-bold"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 flex flex-col h-[520px]">
            <div className="p-4 border-b border-slate-200 flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900">Room Discussion</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-slate-400 text-center py-12 text-sm">
                  Ask subtle questions to spot the spy without revealing the location!
                </p>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-purple-600">{msg.player}</span>
                      <span className="text-[10px] text-slate-400">
                        {typeof msg.timestamp === 'string'
                          ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800">{msg.message}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Ask or discuss..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpyGame;
