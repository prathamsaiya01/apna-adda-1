import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Send,
  Eye,
  EyeOff,
  Crown,
  Target,
  Star,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Minus,
  Wifi
} from 'lucide-react';
import { socket, getUserId } from '../socket';

interface Player {
  id: string;
  userId?: string;
  name: string;
  score: number;
  isActive: boolean;
  guessesLeft: number;
}

interface ChatMessage {
  id: string;
  player: string;
  message: string;
  timestamp: string | Date;
  type: 'question' | 'answer' | 'guess' | 'system';
  response?: 'yes' | 'no' | 'maybe-yes' | 'maybe-no' | 'not-sure' | null;
}

interface Celebrity {
  id?: string;
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
  const userId = getUserId();
  const isMultiplayer = !!roomId;

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', userId, name: username, score: 0, isActive: true, guessesLeft: 3 }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCelebrity, setCurrentCelebrity] = useState<Celebrity | null>(null);
  const [showCelebrityName, setShowCelebrityName] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newGuess, setNewGuess] = useState('');
  const [gameRound, setGameRound] = useState(1);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [difficulty, setDifficulty] = useState<string>('Easy');
  const [category, setCategory] = useState<string>('');

  const chatRef = useRef<HTMLDivElement | null>(null);

  // Local celebrity database for single player fallback
  const localCelebrities: Celebrity[] = [
    { name: 'Shah Rukh Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
    { name: 'Salman Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
    { name: 'Aamir Khan', category: 'Bollywood Actor', difficulty: 'Easy' },
    { name: 'Deepika Padukone', category: 'Bollywood Actress', difficulty: 'Easy' },
    { name: 'Virat Kohli', category: 'Cricketer', difficulty: 'Easy' },
    { name: 'MS Dhoni', category: 'Cricketer', difficulty: 'Easy' },
    { name: 'Arijit Singh', category: 'Singer', difficulty: 'Easy' },
    { name: 'Ranveer Singh', category: 'Bollywood Actor', difficulty: 'Medium' },
    { name: 'Alia Bhatt', category: 'Bollywood Actress', difficulty: 'Medium' },
    { name: 'PV Sindhu', category: 'Badminton Player', difficulty: 'Medium' },
    { name: 'Neeraj Chopra', category: 'Javelin Thrower', difficulty: 'Hard' }
  ];

  // ---------------- MULTIPLAYER SYNC ----------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    socket.emit('joinGame', { roomId, userId }, (res: any) => {
      if (res?.error) console.warn('joinGame error:', res.error);
    });

    const handleGameState = (payload: any) => {
      if (payload.gameKey !== 'WhoAmI') return;
      const s = payload.state;
      if (!s) return;

      setPlayers(s.players || []);
      setCurrentPlayerIndex(s.currentPlayerIndex ?? 0);
      setQuestionsAsked(s.questionsAsked ?? 0);
      setGameRound(s.gameRound ?? 1);
      setChatMessages(s.chatMessages || []);
      setDifficulty(s.difficulty || 'Easy');
      setCategory(s.category || '');
      setGameStarted(true);

      if (s.revealedCelebrity) {
        setCurrentCelebrity(s.revealedCelebrity);
        setShowCelebrityName(true);
      }
    };

    const handlePrivateState = (payload: any) => {
      if (payload.gameKey !== 'WhoAmI') return;
      if (payload.holderData?.celebrity) {
        setCurrentCelebrity(payload.holderData.celebrity);
      }
    };

    socket.on('gameStateUpdate', handleGameState);
    socket.on('privateStateUpdate', handlePrivateState);

    // Initial private data fetch
    socket.emit('gameAction', { roomId, action: 'getPrivateData', payload: { userId } }, (res: any) => {
      if (res?.data?.celebrity) setCurrentCelebrity(res.data.celebrity);
    });

    return () => {
      socket.off('gameStateUpdate', handleGameState);
      socket.off('privateStateUpdate', handlePrivateState);
    };
  }, [isMultiplayer, roomId, userId]);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addLocalPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
      setPlayers(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          userId: 'user-' + Date.now(),
          name: newPlayerName.trim(),
          score: 0,
          isActive: true,
          guessesLeft: 3
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

  const startLocalGame = () => {
    if (players.length >= 2) {
      setGameStarted(true);
      setGameRound(1);
      const random = localCelebrities[Math.floor(Math.random() * localCelebrities.length)];
      setCurrentCelebrity(random);
      setShowCelebrityName(false);
      setQuestionsAsked(0);
      setChatMessages([
        {
          id: Date.now().toString(),
          player: 'System',
          message: `🎭 Round 1 started! ${players[0].name} has the celebrity name. Others ask Yes/No questions and have 3 guesses each!`,
          timestamp: new Date().toISOString(),
          type: 'system'
        }
      ]);
    }
  };

  const sendQuestion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newQuestion.trim() || questionsAsked >= 20) return;

    if (isMultiplayer && roomId) {
      socket.emit('gameAction', {
        roomId,
        action: 'askQuestion',
        payload: { question: newQuestion.trim(), userId }
      }, (res: any) => {
        if (res?.error) alert(res.error);
        else setNewQuestion('');
      });
      return;
    }

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        player: username,
        message: newQuestion.trim(),
        timestamp: new Date().toISOString(),
        type: 'question',
        response: null
      }
    ]);
    setQuestionsAsked(prev => prev + 1);
    setNewQuestion('');
  };

  const respondToQuestion = (response: 'yes' | 'no' | 'maybe-yes' | 'maybe-no' | 'not-sure') => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', {
        roomId,
        action: 'answerQuestion',
        payload: { response, userId }
      }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      return;
    }

    const lastIdx = [...chatMessages].reverse().findIndex(m => m.type === 'question' && !m.response);
    if (lastIdx === -1) return;
    const realIdx = chatMessages.length - 1 - lastIdx;

    const answerText = {
      'yes': '✅ Yes',
      'no': '❌ No',
      'maybe-yes': '🤔 Maybe Yes',
      'maybe-no': '🤷 Maybe No',
      'not-sure': '❓ Not Sure'
    }[response];

    setChatMessages(prev => {
      const copy = [...prev];
      copy[realIdx] = { ...copy[realIdx], response };
      copy.push({
        id: Date.now().toString(),
        player: players[currentPlayerIndex]?.name || 'Host',
        message: answerText,
        timestamp: new Date().toISOString(),
        type: 'answer',
        response
      });
      return copy;
    });
  };

  const submitGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGuess.trim()) return;

    if (isMultiplayer && roomId) {
      socket.emit('gameAction', {
        roomId,
        action: 'makeGuess',
        payload: { guess: newGuess.trim(), userId }
      }, (res: any) => {
        if (res?.error) alert(res.error);
        else setNewGuess('');
      });
      return;
    }

    // Local guess logic
    if (!currentCelebrity) return;
    const guessText = newGuess.trim();
    const isCorrect = guessText.toLowerCase() === currentCelebrity.name.toLowerCase();

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        player: username,
        message: `🎯 Guess: ${guessText}`,
        timestamp: new Date().toISOString(),
        type: 'guess'
      }
    ]);

    if (isCorrect) {
      const pts = currentCelebrity.difficulty === 'Easy' ? 1 : currentCelebrity.difficulty === 'Medium' ? 2 : 3;
      setPlayers(prev => prev.map(p => p.name === username ? { ...p, score: p.score + pts } : p));
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          player: 'System',
          message: `🎉 ${username} guessed correctly! The answer was ${currentCelebrity.name}. +${pts} points!`,
          timestamp: new Date().toISOString(),
          type: 'system'
        }
      ]);
    } else {
      setPlayers(prev => prev.map(p => p.name === username ? { ...p, guessesLeft: Math.max(0, p.guessesLeft - 1) } : p));
    }
    setNewGuess('');
  };

  const currentHolder = players[currentPlayerIndex];
  const isMeHolder = isMultiplayer
    ? currentHolder && (currentHolder.userId === userId || currentHolder.name === username)
    : currentHolder?.name === username;

  const myGuessesLeft = players.find(p => p.userId === userId || p.name === username)?.guessesLeft ?? 3;

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
                  Who Am I?
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Who Am I?</h2>
              <p className="text-slate-600">
                Guess the secret celebrity using up to 20 Yes/No questions and 3 guesses!
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Players ({players.length}/8)</h3>
                <button
                  onClick={() => setShowAddPlayer(true)}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-semibold"
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
                  <button onClick={addLocalPlayer} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold">
                    Add
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={startLocalGame}
              disabled={players.length < 2}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-xl font-bold disabled:opacity-50"
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
              className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Games</span>
            </button>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-slate-300" />
                <span className="text-white font-mono">{questionsAsked}/20 questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-slate-300" />
                <span className="text-white">Round {gameRound}</span>
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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-white font-bold text-xl">{currentHolder?.name.charAt(0)}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">
                  {isMeHolder ? 'You hold the Secret Celebrity!' : `${currentHolder?.name} has the celebrity!`}
                </h3>
                <p className="text-slate-500 text-sm">
                  {isMeHolder
                    ? 'Answer other players’ Yes/No questions truthfully.'
                    : 'Ask Yes/No questions or make your guess!'}
                </p>
              </div>

              {/* Secret Celebrity Box for Holder */}
              {isMeHolder && currentCelebrity && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-xs font-bold">
                      {currentCelebrity.difficulty} Difficulty
                    </span>
                    <button
                      onClick={() => setShowCelebrityName(!showCelebrityName)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition"
                    >
                      {showCelebrityName ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showCelebrityName ? 'Hide Name' : 'Reveal to Yourself'}</span>
                    </button>
                  </div>

                  {showCelebrityName ? (
                    <div className="text-center py-2">
                      <h2 className="text-3xl font-extrabold mb-1 tracking-wide">{currentCelebrity.name}</h2>
                      <p className="text-sm text-slate-300">{currentCelebrity.category}</p>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-slate-400 text-sm font-semibold">
                      Click "Reveal to Yourself" to see the celebrity name!
                    </div>
                  )}
                </div>
              )}

              {/* Clue response buttons for Holder */}
              {isMeHolder && (
                (() => {
                  const lastQ = [...chatMessages].reverse().find(m => m.type === 'question' && !m.response);
                  return (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
                      <h4 className="font-bold text-orange-900 text-center mb-3">
                        {lastQ ? `Respond to: "${lastQ.message}"` : 'Waiting for questions from players...'}
                      </h4>
                      {lastQ && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <button
                            onClick={() => respondToQuestion('yes')}
                            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 transition"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Yes</span>
                          </button>
                          <button
                            onClick={() => respondToQuestion('no')}
                            className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 transition"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>No</span>
                          </button>
                          <button
                            onClick={() => respondToQuestion('maybe-yes')}
                            className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 transition"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Maybe Yes</span>
                          </button>
                          <button
                            onClick={() => respondToQuestion('maybe-no')}
                            className="py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span>Maybe No</span>
                          </button>
                          <button
                            onClick={() => respondToQuestion('not-sure')}
                            className="py-2.5 px-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 transition"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Not Sure</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* Question form for other players */}
              {!isMeHolder && questionsAsked < 20 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
                  <h4 className="font-bold text-blue-900 text-sm mb-3">Ask a Yes/No Question</h4>
                  <form onSubmit={sendQuestion} className="flex space-x-2">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      placeholder="e.g. Is this celebrity a cricket player?"
                      className="flex-1 px-4 py-2.5 border border-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newQuestion.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center space-x-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>Ask</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Guess form for other players */}
              {!isMeHolder && myGuessesLeft > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-emerald-900 text-sm">Make a Celebrity Guess</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">
                      {myGuessesLeft} guesses left
                    </span>
                  </div>
                  <form onSubmit={submitGuess} className="flex space-x-2">
                    <input
                      type="text"
                      value={newGuess}
                      onChange={e => setNewGuess(e.target.value)}
                      placeholder="Enter full celebrity name..."
                      className="flex-1 px-4 py-2.5 border border-emerald-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newGuess.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center space-x-1"
                    >
                      <Target className="w-4 h-4" />
                      <span>Guess</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Chat & Question Log */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                <span>Round Chat & Questions Log</span>
              </h3>

              <div className="h-72 overflow-y-auto space-y-3 pr-2">
                {chatMessages.length === 0 ? (
                  <p className="text-slate-400 text-center py-12 text-sm">No questions asked yet.</p>
                ) : (
                  chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl border text-sm ${
                        msg.type === 'system'
                          ? 'bg-purple-50 border-purple-200 text-purple-900 font-semibold text-center'
                          : msg.type === 'guess'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                          : msg.type === 'answer'
                          ? 'bg-amber-50 border-amber-200 text-amber-900 ml-6'
                          : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs opacity-75 mb-1">
                        <span className="font-bold">{msg.player}</span>
                        <span>
                          {typeof msg.timestamp === 'string'
                            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <p>{msg.message}</p>
                    </div>
                  ))
                )}
                <div ref={chatRef} />
              </div>
            </div>
          </div>

          {/* Right Column: Scoreboard */}
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Scoreboard</h3>
              <div className="space-y-3">
                {players
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => {
                    const isHolder = currentHolder && (p.userId === currentHolder.userId || p.name === currentHolder.name);
                    return (
                      <div
                        key={p.userId || p.id}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isHolder ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-xs text-slate-400">#{idx + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{p.name}</p>
                            {isHolder && <span className="text-[10px] text-orange-600 font-semibold">Holder</span>}
                          </div>
                        </div>
                        <span className="font-mono font-black text-lg text-purple-600">{p.score} pts</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhoAmI;
