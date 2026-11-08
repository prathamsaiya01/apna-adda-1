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
  Target,
  Vote,
  Wifi,
  Sparkles
} from 'lucide-react';
import { socket, getUserId } from '../socket';

interface Player {
  id: string;
  userId?: string;
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
  timestamp: string | Date;
}

interface WordPair {
  majority: string;
  mrWhite: string;
  category: string;
}

interface PrivateCard {
  role: 'mrwhite' | 'majority';
  word: string;
  category: string;
}

interface MrWhiteProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const MrWhite: React.FC<MrWhiteProps> = ({ onBack, username, roomId }) => {
  const userId = getUserId();
  const isMultiplayer = !!roomId;

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', userId, name: username, isHost: true, hasFlippedCard: false, votes: 0, hasVoted: false }
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWordPair, setCurrentWordPair] = useState<WordPair | null>(null);
  const [myPrivateCard, setMyPrivateCard] = useState<PrivateCard | null>(null);
  const [mrWhitePlayer, setMrWhitePlayer] = useState<string>('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [gamePhase, setGamePhase] = useState<'clues' | 'voting' | 'mrwhite_guess' | 'finished'>('clues');
  const [votingResults, setVotingResults] = useState<{ player: string; votes: number }[]>([]);
  const [mrWhiteGuess, setMrWhiteGuess] = useState('');
  const [gameWinner, setGameWinner] = useState<'majority' | 'mrwhite' | ''>('');
  const [revealedSummary, setRevealedSummary] = useState<any>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fallback word pairs for single-player local mode
  const localWordPairs: WordPair[] = [
    { majority: 'Apple', mrWhite: 'Mango', category: 'Fruits' },
    { majority: 'Orange', mrWhite: 'Lemon', category: 'Fruits' },
    { majority: 'Lion', mrWhite: 'Tiger', category: 'Animals' },
    { majority: 'Dog', mrWhite: 'Wolf', category: 'Animals' },
    { majority: 'Car', mrWhite: 'Truck', category: 'Vehicles' },
    { majority: 'Pizza', mrWhite: 'Burger', category: 'Food' },
    { majority: 'Cricket', mrWhite: 'Baseball', category: 'Sports' },
    { majority: 'Red', mrWhite: 'Pink', category: 'Colors' },
    { majority: 'Doctor', mrWhite: 'Nurse', category: 'Professions' }
  ];

  // ---------------- MULTIPLAYER SYNC ----------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    // Join game channel
    socket.emit('joinGame', { roomId, userId }, (res: any) => {
      if (res?.error) console.warn('joinGame error:', res.error);
    });

    const handleGameState = (payload: any) => {
      if (payload.gameKey !== 'MrWhite') return;
      const s = payload.state;
      if (!s) return;

      setPlayers(s.players || []);
      setGamePhase(s.gamePhase || 'clues');
      setVotingResults(s.votingResults || []);
      setGameWinner(s.gameWinner || '');
      setChatMessages(s.chatMessages || []);
      setGameStarted(true);

      if (s.mrWhitePlayerName) {
        setMrWhitePlayer(s.mrWhitePlayerName);
      }
      if (s.revealedSummary) {
        setRevealedSummary(s.revealedSummary);
      }
    };

    const handlePrivateState = (payload: any) => {
      if (payload.gameKey !== 'MrWhite') return;
      if (payload.privateCard) {
        setMyPrivateCard(payload.privateCard);
      }
    };

    socket.on('gameStateUpdate', handleGameState);
    socket.on('privateStateUpdate', handlePrivateState);

    // Request private card in case of reconnect
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
      const newPlayer: Player = {
        id: Date.now().toString(),
        userId: 'user-' + Date.now(),
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

  const removeLocalPlayer = (playerId: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const startLocalGame = () => {
    if (players.length >= 3) {
      const pair = localWordPairs[Math.floor(Math.random() * localWordPairs.length)];
      setCurrentWordPair(pair);
      const randIdx = Math.floor(Math.random() * players.length);
      setMrWhitePlayer(players[randIdx].name);
      setGameStarted(true);
      setGamePhase('clues');
      setPlayers(prev => prev.map(p => ({ ...p, hasFlippedCard: false, votes: 0, hasVoted: false })));
    }
  };

  const resetGame = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'restartGame', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
    } else {
      setGameStarted(false);
      setCurrentWordPair(null);
      setMrWhitePlayer('');
      setGamePhase('clues');
      setVotingResults([]);
      setMrWhiteGuess('');
      setGameWinner('');
      setPlayers(prev => prev.map(p => ({ ...p, hasFlippedCard: false, votes: 0, hasVoted: false })));
    }
  };

  const flipCard = (playerId: string) => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'flipCard', payload: { userId } });
      return;
    }
    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, hasFlippedCard: !p.hasFlippedCard } : p))
    );
  };

  const startVoting = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'startVoting', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }
    setGamePhase('voting');
    setPlayers(prev => prev.map(p => ({ ...p, votes: 0, hasVoted: false })));
  };

  const voteForPlayer = (targetId: string) => {
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
      return;
    }

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === targetId || p.userId === targetId) {
          return { ...p, votes: p.votes + 1 };
        }
        if (p.name === username) {
          return { ...p, hasVoted: true };
        }
        return p;
      })
    );
  };

  const finishVoting = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'finishVoting', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }

    const results = players
      .map(p => ({ player: p.name, votes: p.votes }))
      .sort((a, b) => b.votes - a.votes);
    setVotingResults(results);

    const mostVoted = results[0]?.player;
    if (mostVoted === mrWhitePlayer) {
      setGamePhase('mrwhite_guess');
    } else {
      setGameWinner('mrwhite');
      setGamePhase('finished');
    }
  };

  const submitMrWhiteGuess = () => {
    if (isMultiplayer && roomId) {
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'submitMrWhiteGuess',
          payload: { guess: mrWhiteGuess, userId }
        },
        (res: any) => {
          if (res?.error) alert(res.error);
        }
      );
      return;
    }

    if (mrWhiteGuess.toLowerCase().trim() === currentWordPair?.majority.toLowerCase()) {
      setGameWinner('mrwhite');
    } else {
      setGameWinner('majority');
    }
    setGamePhase('finished');
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

  const myPlayerObj = players.find(p => p.userId === userId || p.name === username);
  const isMeMrWhite = myPrivateCard
    ? myPrivateCard.role === 'mrwhite'
    : myPlayerObj?.name === mrWhitePlayer;

  // Single-player lobby view
  if (!gameStarted && !isMultiplayer) {
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
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Mr. White
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
                <div className="text-center mb-8">
                  <Target className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Mr. White</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    Majority players get the same secret word, while 1 player (Mr. White) gets a related word.
                    Give clever clues to find Mr. White, but don't give away your word!
                  </p>
                </div>

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
                    {players.map(player => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                      >
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
                            onClick={() => removeLocalPlayer(player.id)}
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
                          onChange={e => setNewPlayerName(e.target.value)}
                          placeholder="Enter player name..."
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          onKeyDown={e => e.key === 'Enter' && addLocalPlayer()}
                        />
                        <button
                          onClick={addLocalPlayer}
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

                <div className="text-center">
                  <button
                    onClick={startLocalGame}
                    disabled={players.length < 3}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Mr. White Game
                  </button>
                  {players.length < 3 && (
                    <p className="text-sm text-gray-500 mt-2">Need at least 3 players to start</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-3">How to Play</h3>
              <p className="text-sm text-slate-600">1. Majority players get the same word, 1 gets a related word.</p>
              <p className="text-sm text-slate-600">2. Give clues about your word without saying it directly.</p>
              <p className="text-sm text-slate-600">3. Vote to eliminate who you think is Mr. White.</p>
              <p className="text-sm text-slate-600">4. If caught, Mr. White can guess the majority word to win.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active Game View
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
                <span className="text-white">{players.length} players</span>
              </div>
              <div className="flex items-center space-x-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-400/30">
                <Target className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-sm text-white">
                  {gamePhase === 'clues' && 'Clue Phase'}
                  {gamePhase === 'voting' && 'Voting Phase'}
                  {gamePhase === 'mrwhite_guess' && "Mr. White's Guess"}
                  {gamePhase === 'finished' && 'Game Over'}
                </span>
              </div>
              {isMultiplayer && roomId && (
                <div className="flex items-center space-x-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                  <Wifi className="w-4 h-4 text-purple-300 animate-pulse" />
                  <span className="text-purple-200 font-mono text-sm">{roomId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Phase Box */}
          <div className="lg:col-span-2 space-y-6">
            {/* CLUES PHASE */}
            {gamePhase === 'clues' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Secret Cards</h2>
                    <p className="text-xs text-slate-500 mt-1">Tap your card below to view your secret role.</p>
                  </div>
                  <button
                    onClick={startVoting}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition shadow flex items-center space-x-2"
                  >
                    <Vote className="w-4 h-4" />
                    <span>Start Voting</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {players.map(player => {
                    const isMe = player.userId === userId || player.name === username;

                    return (
                      <div key={player.userId || player.id} className="relative">
                        <div className="p-5 rounded-xl border-2 transition-all bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-r from-orange-500 to-purple-600 shadow-md">
                              <span className="text-white font-bold">{player.name.charAt(0)}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">
                              {player.name} {isMe && <span className="text-xs text-orange-600">(You)</span>}
                            </h3>

                            {/* Card Display */}
                            {isMe ? (
                              player.hasFlippedCard ? (
                                <button
                                  onClick={() => flipCard(player.id)}
                                  className="w-full p-4 rounded-xl bg-white border-2 border-orange-400 shadow transition"
                                >
                                  {isMeMrWhite ? (
                                    <div className="text-center">
                                      <Target className="w-7 h-7 text-orange-600 mx-auto mb-1" />
                                      <p className="font-black text-orange-800 text-xs">YOU ARE MR. WHITE!</p>
                                      <p className="text-xl font-black text-orange-700 mt-1">
                                        {myPrivateCard?.word || currentWordPair?.mrWhite}
                                      </p>
                                      <p className="text-[10px] text-orange-600 mt-1">
                                        Category: {myPrivateCard?.category || currentWordPair?.category}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <Eye className="w-7 h-7 text-blue-600 mx-auto mb-1" />
                                      <p className="font-black text-blue-800 text-xs">YOUR SECRET WORD</p>
                                      <p className="text-xl font-black text-blue-700 mt-1">
                                        {myPrivateCard?.word || currentWordPair?.majority}
                                      </p>
                                      <p className="text-[10px] text-blue-600 mt-1">
                                        Category: {myPrivateCard?.category || currentWordPair?.category}
                                      </p>
                                    </div>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => flipCard(player.id)}
                                  className="w-full p-4 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl text-white font-bold shadow hover:scale-[1.02] transition"
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

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                  <p className="font-bold flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Clue Phase Instructions:</span>
                  </p>
                  <p>• Only you can see your secret word. Never reveal it in plain text!</p>
                  <p>• Use the room chat to discuss and give clues about your word.</p>
                  <p>• When ready, start voting to find and eliminate Mr. White.</p>
                </div>
              </div>
            )}

            {/* VOTING PHASE */}
            {gamePhase === 'voting' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Voting Phase</h2>
                <p className="text-slate-600 text-sm mb-6">Vote for who you suspect is Mr. White:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {players.map(player => (
                    <button
                      key={player.userId || player.id}
                      onClick={() => voteForPlayer(player.userId || player.id)}
                      disabled={myPlayerObj?.hasVoted}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-orange-50 hover:border-orange-300 transition disabled:opacity-60"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">
                          {player.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{player.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-full border">
                          Votes: {player.votes || 0}
                        </span>
                        <Vote className="w-4 h-4 text-orange-600" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={finishVoting}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition"
                  >
                    Finish Voting & Check Results
                  </button>
                </div>
              </div>
            )}

            {/* MR. WHITE'S GUESS PHASE */}
            {gamePhase === 'mrwhite_guess' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Mr. White's Last Chance!</h2>
                <p className="text-slate-600 text-sm mb-6">
                  <strong>{mrWhitePlayer || 'Mr. White'}</strong> was identified by the players! To steal the victory,
                  Mr. White now has one shot to guess the majority word!
                </p>

                {isMeMrWhite ? (
                  <div className="space-y-4 max-w-md mx-auto">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Guess the Majority Word:
                      </label>
                      <input
                        type="text"
                        value={mrWhiteGuess}
                        onChange={e => setMrWhiteGuess(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Enter your guess..."
                      />
                    </div>
                    <button
                      onClick={submitMrWhiteGuess}
                      disabled={!mrWhiteGuess.trim()}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
                    >
                      Submit Guess
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-orange-600 mx-auto mb-4 animate-bounce" />
                    <p className="text-lg font-bold text-slate-700">
                      Waiting for {mrWhitePlayer || 'Mr. White'} to guess the secret word...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* FINISHED PHASE */}
            {gamePhase === 'finished' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20 text-center">
                <div className="text-6xl mb-4">{gameWinner === 'mrwhite' ? '🎯' : '👥'}</div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Game Over!</h2>

                {gameWinner === 'mrwhite' ? (
                  <p className="text-xl text-orange-600 font-bold mb-4">
                    Mr. White ({mrWhitePlayer}) Wins!
                  </p>
                ) : (
                  <p className="text-xl text-blue-600 font-bold mb-4">
                    The Majority Wins! Mr. White ({mrWhitePlayer}) was defeated.
                  </p>
                )}

                <div className="bg-slate-50 border rounded-xl p-5 mb-6 max-w-md mx-auto text-left text-sm space-y-1.5 text-slate-700">
                  <p>
                    <strong>Majority Word:</strong> {revealedSummary?.majorityWord || currentWordPair?.majority}
                  </p>
                  <p>
                    <strong>Mr. White Word:</strong> {revealedSummary?.mrWhiteWord || currentWordPair?.mrWhite}
                  </p>
                  <p>
                    <strong>Mr. White Player:</strong> {revealedSummary?.mrWhiteName || mrWhitePlayer}
                  </p>
                  <p>
                    <strong>Category:</strong> {revealedSummary?.category || currentWordPair?.category}
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={onBack}
                    className="px-6 py-2.5 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                  >
                    Back to Games
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 flex flex-col h-[520px]">
            <div className="p-4 border-b border-slate-200 flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-slate-900">Room Clues & Chat</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-slate-400 text-center py-12 text-sm">
                  Give clues about your word without spelling it out!
                </p>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-orange-600">{msg.player}</span>
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
                placeholder="Type your clue..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-3 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg disabled:opacity-50"
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

export default MrWhite;
