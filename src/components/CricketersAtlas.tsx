import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trophy, Clock, Users, CheckCircle, XCircle, Loader, Wifi } from 'lucide-react';
import { socket, getUserId } from '../socket';

interface Player {
  id: string;
  userId?: string;
  name: string;
  score: number;
  isActive: boolean;
  timeoutCount: number;
  isEliminated: boolean;
}

interface GameMove {
  player: string;
  cricketer: string;
  letter: string;
  timestamp: string | Date;
  isValid: boolean;
}

interface CricketersAtlasProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const CricketersAtlas: React.FC<CricketersAtlasProps> = ({ onBack, username, roomId }) => {
  const userId = getUserId();
  const isMultiplayer = !!roomId;

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', userId, name: username, score: 0, isActive: true, timeoutCount: 0, isEliminated: false }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameMove[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [requiredLetter, setRequiredLetter] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [gameTimer, setGameTimer] = useState(0);
  const [turnTimer, setTurnTimer] = useState(30);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [eliminatedMessage, setEliminatedMessage] = useState<string>('');
  const [gameWinner, setGameWinner] = useState<string>('');
  const [showConsiderDialog, setShowConsiderDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    cricketer: string;
    firstLetter: string;
    lastLetter: string;
    proposedBy?: string;
  } | null>(null);

  // ---------------- MULTIPLAYER SYNC ----------------
  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    // Join game channel
    socket.emit('joinGame', { roomId, userId }, (res: any) => {
      if (res?.error) console.warn('joinGame error:', res.error);
    });

    const handleGameState = (payload: any) => {
      if (payload.gameKey !== 'CricketersAtlas') return;
      const s = payload.state;
      if (!s) return;

      setPlayers(s.players || []);
      setCurrentPlayerIndex(s.currentPlayerIndex ?? 0);
      setRequiredLetter(s.requiredLetter || '');
      setGameHistory(s.gameHistory || []);
      if (typeof s.turnTimer === 'number') setTurnTimer(s.turnTimer);
      setGameStarted(true);
      setGameWinner(s.gameWinner || '');
      setEliminatedMessage(s.eliminatedMessage || '');

      if (s.pendingConsideration) {
        setPendingMove(s.pendingConsideration);
        setShowConsiderDialog(true);
      } else {
        setShowConsiderDialog(false);
        setPendingMove(null);
      }
    };

    const handleTimerTick = (data: { turnTimer?: number }) => {
      if (typeof data.turnTimer === 'number') {
        setTurnTimer(data.turnTimer);
      }
    };

    socket.on('gameStateUpdate', handleGameState);
    socket.on('timerTick', handleTimerTick);

    return () => {
      socket.off('gameStateUpdate', handleGameState);
      socket.off('timerTick', handleTimerTick);
    };
  }, [isMultiplayer, roomId, userId]);

  // Game timer (local clock display)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameWinner) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWinner]);

  // Turn timer for single player mode only
  useEffect(() => {
    if (isMultiplayer) return; // Server handles multiplayer timer authoritatively!
    let interval: NodeJS.Timeout;
    if (gameStarted && turnTimer > 0 && !gameWinner) {
      interval = setInterval(() => {
        setTurnTimer(prev => {
          if (prev <= 1) {
            handleLocalTimeUp();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMultiplayer, gameStarted, turnTimer, currentPlayerIndex, gameWinner]);

  // Single player local time up
  const handleLocalTimeUp = () => {
    const currentPlayer = players[currentPlayerIndex];
    const newTimeoutCount = currentPlayer.timeoutCount + 1;

    setPlayers(prev => prev.map((player, index) =>
      index === currentPlayerIndex
        ? {
            ...player,
            timeoutCount: newTimeoutCount,
            isEliminated: newTimeoutCount >= 2
          }
        : player
    ));

    if (newTimeoutCount >= 2) {
      setEliminatedMessage(`${currentPlayer.name} has been eliminated for timing out twice!`);
      setTimeout(() => setEliminatedMessage(''), 3000);

      const eliminationMove: GameMove = {
        player: currentPlayer.name,
        cricketer: '[ELIMINATED - Timed out twice]',
        letter: '',
        timestamp: new Date().toISOString(),
        isValid: false
      };
      setGameHistory(prev => [...prev, eliminationMove]);
    } else {
      setEliminatedMessage(`${currentPlayer.name} timed out! (${newTimeoutCount}/2 timeouts)`);
      setTimeout(() => setEliminatedMessage(''), 2000);
    }

    setTurnTimer(30);
    nextLocalActivePlayer();
  };

  const nextLocalActivePlayer = () => {
    const activePlayers = players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
      if (activePlayers.length === 1) {
        const winner = activePlayers[0].name;
        setGameWinner(winner);
        setEliminatedMessage(`🎉 ${winner} wins the game!`);
      } else {
        setGameWinner('No Winner');
        setEliminatedMessage('Game over - no players remaining!');
      }
      return;
    }

    let nextIndex = (currentPlayerIndex + 1) % players.length;
    while (players[nextIndex].isEliminated) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    setCurrentPlayerIndex(nextIndex);
    setTurnTimer(30);
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 6) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        score: 0,
        isActive: true,
        timeoutCount: 0,
        isEliminated: false
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const startGame = () => {
    if (players.filter(p => !p.isEliminated).length >= 1) {
      setGameStarted(true);
      setRequiredLetter('');
      setTurnTimer(30);
    }
  };

  const handleConsiderMove = (accept: boolean) => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', {
        roomId,
        action: 'voteConsideration',
        payload: { accept }
      }, (res: any) => {
        if (res?.error) alert(res.error);
      });
      setShowConsiderDialog(false);
      setPendingMove(null);
      setCurrentInput('');
      return;
    }

    // Local single player fallback
    if (!pendingMove) return;
    const move: GameMove = {
      player: players[currentPlayerIndex].name,
      cricketer: accept ? pendingMove.cricketer : `${pendingMove.cricketer} [REJECTED]`,
      letter: pendingMove.firstLetter,
      timestamp: new Date().toISOString(),
      isValid: accept
    };

    setGameHistory(prev => [...prev, move]);
    if (accept) {
      setPlayers(prev => prev.map((player, index) =>
        index === currentPlayerIndex ? { ...player, score: player.score + 1 } : player
      ));
      setRequiredLetter(pendingMove.lastLetter.toUpperCase());
    }
    nextLocalActivePlayer();
    setShowConsiderDialog(false);
    setPendingMove(null);
    setCurrentInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isValidating) return;

    if (isMultiplayer && roomId) {
      const activePlayer = players[currentPlayerIndex];
      const isMyTurn = activePlayer && (activePlayer.userId === userId || activePlayer.name === username);
      if (!isMyTurn) {
        alert("Please wait for your turn!");
        return;
      }

      setIsValidating(true);
      socket.emit(
        'gameAction',
        {
          roomId,
          action: 'submitCricketer',
          payload: { name: currentInput.trim(), userId }
        },
        (res: any) => {
          setIsValidating(false);
          if (res?.error) {
            alert(res.error);
          } else {
            setCurrentInput('');
          }
        }
      );
      return;
    }

    // Local single player logic
    const cricketerName = currentInput.trim();
    const firstLetter = cricketerName.charAt(0).toLowerCase();
    const lastLetter = cricketerName.charAt(cricketerName.length - 1).toLowerCase();

    if (requiredLetter && firstLetter !== requiredLetter.toLowerCase()) {
      alert(`The cricketer's name must start with "${requiredLetter.toUpperCase()}"`);
      return;
    }

    const alreadyUsed = gameHistory.some(
      move => move.cricketer.toLowerCase() === cricketerName.toLowerCase()
    );
    if (alreadyUsed) {
      alert('This cricketer has already been named!');
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      const move: GameMove = {
        player: players[currentPlayerIndex].name,
        cricketer: cricketerName,
        letter: firstLetter.toUpperCase(),
        timestamp: new Date().toISOString(),
        isValid: true
      };
      setGameHistory(prev => [...prev, move]);
      setPlayers(prev => prev.map((player, index) =>
        index === currentPlayerIndex ? { ...player, score: player.score + 1 } : player
      ));
      setRequiredLetter(lastLetter.toUpperCase());
      nextLocalActivePlayer();
      setCurrentInput('');
    }, 600);
  };

  const handleRestart = () => {
    if (isMultiplayer && roomId) {
      socket.emit('gameAction', { roomId, action: 'restartGame', payload: { userId } }, (res: any) => {
        if (res?.error) alert(res.error);
      });
    } else {
      setGameStarted(false);
      setGameWinner('');
      setGameHistory([]);
      setRequiredLetter('');
      setPlayers(prev => prev.map(p => ({ ...p, score: 0, timeoutCount: 0, isEliminated: false })));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activePlayer = players[currentPlayerIndex];
  const isMyTurn = isMultiplayer
    ? activePlayer && (activePlayer.userId === userId || activePlayer.name === username)
    : true;

  if (!gameStarted && !isMultiplayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Games</span>
              </button>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Cricketers Atlas
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Cricketers Atlas</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Name cricketers in an alphabetical chain! Each player must name a cricketer starting
                with the last letter of the previous cricketer's name.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Players ({players.length}/6)</h3>
                {players.length < 6 && (
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors duration-200"
                  >
                    Add Player
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {players.map(player => (
                  <div key={player.id} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold">{player.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{player.name}</p>
                      <p className="text-sm text-slate-600">Ready to play</p>
                    </div>
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
                      onKeyDown={e => e.key === 'Enter' && addPlayer()}
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

            <div className="text-center">
              <button
                onClick={startGame}
                disabled={players.length < 1}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Game
              </button>
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
                <span className="font-mono text-lg text-white">{formatTime(gameTimer)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-300" />
                <span className="text-white">{players.length} players</span>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Turn */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                      gameWinner
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-orange-500 to-purple-600'
                    }`}
                  >
                    <span className="text-white font-bold">
                      {activePlayer ? activePlayer.name.charAt(0) : '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {gameWinner
                        ? `Game Over - ${gameWinner} Wins!`
                        : isMyTurn
                        ? `Your Turn, ${username}!`
                        : `${activePlayer?.name}'s Turn`}
                    </h3>
                    {requiredLetter && !gameWinner && (
                      <p className="text-sm text-slate-600">
                        Name a cricketer starting with{' '}
                        <span className="font-black text-xl text-orange-600">"{requiredLetter}"</span>
                      </p>
                    )}
                    {activePlayer && activePlayer.timeoutCount > 0 && !gameWinner && (
                      <p className="text-xs text-orange-600 font-medium">
                        ⚠️ Timeouts: {activePlayer.timeoutCount}/2
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-2xl font-black ${
                      gameWinner ? 'text-yellow-600' : turnTimer <= 10 ? 'text-red-600 animate-pulse' : 'text-orange-600'
                    }`}
                  >
                    {gameWinner ? '🏆' : `${turnTimer}s`}
                  </div>
                  <div className="text-xs text-slate-500">{gameWinner ? 'Winner!' : 'Time left'}</div>
                </div>
              </div>

              {!gameWinner && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={e => setCurrentInput(e.target.value)}
                      placeholder={
                        isMyTurn
                          ? requiredLetter
                            ? `Cricketer starting with "${requiredLetter}"...`
                            : 'Enter cricketer name...'
                          : `Waiting for ${activePlayer?.name} to answer...`
                      }
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg disabled:bg-slate-100"
                      disabled={isValidating || !isMyTurn}
                    />
                    <button
                      type="submit"
                      disabled={!currentInput.trim() || isValidating || !isMyTurn}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                    >
                      {isValidating ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  </div>
                  {!isMyTurn && (
                    <p className="text-xs text-slate-500 italic">
                      It is {activePlayer?.name}'s turn to submit a cricketer.
                    </p>
                  )}
                </form>
              )}

              {gameWinner && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-yellow-600 mb-2">Congratulations!</h2>
                  <p className="text-gray-600 mb-4">{gameWinner} has won the Cricketers Atlas!</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={onBack}
                      className="px-6 py-2 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-lg hover:from-orange-700 hover:to-purple-700 transition-colors duration-200"
                    >
                      Back to Games
                    </button>
                    <button
                      onClick={handleRestart}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Consider Dialog */}
            {showConsiderDialog && pendingMove && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                      <span className="text-2xl">🤔</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Consider This Name?</h3>
                    <p className="text-gray-600 mb-4">
                      "<span className="font-semibold text-orange-600">{pendingMove.cricketer}</span>" is not in our
                      verified list.
                    </p>
                    <p className="text-sm text-gray-500">
                      Should this cricketer be accepted to continue the game?
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleConsiderMove(true)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors duration-200"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleConsiderMove(false)}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors duration-200"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Elimination Message */}
            {eliminatedMessage && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-red-800 font-medium">{eliminatedMessage}</p>
                </div>
              </div>
            )}

            {/* Game History */}
            <div className="bg-white/95 rounded-xl shadow-lg border border-white/20">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Game History</h3>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {gameHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No moves yet. Start the chain!</p>
                ) : (
                  <div className="space-y-3">
                    {gameHistory
                      .slice()
                      .reverse()
                      .map((move, index) => {
                        const isElim = move.cricketer.includes('[ELIMINATED');
                        const isRej = move.cricketer.includes('[REJECTED');
                        const timeStr = typeof move.timestamp === 'string'
                          ? new Date(move.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date().toLocaleTimeString();

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isElim
                                ? 'bg-red-50 border border-red-200'
                                : isRej
                                ? 'bg-orange-50 border border-orange-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isElim
                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                    : isRej
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                                }`}
                              >
                                <span className="text-white text-sm font-semibold">{move.player.charAt(0)}</span>
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${
                                    isElim ? 'text-red-800' : isRej ? 'text-orange-800' : 'text-gray-900'
                                  }`}
                                >
                                  {move.cricketer}
                                </p>
                                <p className="text-sm text-gray-600">by {move.player}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isElim || isRej ? (
                                <XCircle className="w-5 h-5 text-red-600" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              <span className="text-xs text-gray-500">{timeStr}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="bg-white/95 rounded-xl shadow-lg border border-white/20">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Scoreboard</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {players
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => {
                    const isCurr = activePlayer && player.name === activePlayer.name;
                    return (
                      <div
                        key={player.userId || player.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          player.isEliminated
                            ? 'bg-red-100 border-2 border-red-300 opacity-60'
                            : gameWinner && player.name === gameWinner
                            ? 'bg-yellow-100 border-2 border-yellow-400'
                            : isCurr
                            ? 'bg-green-100 border-2 border-green-300'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              player.isEliminated
                                ? 'bg-red-300 text-red-800'
                                : gameWinner && player.name === gameWinner
                                ? 'bg-yellow-400 text-yellow-800'
                                : 'bg-gray-300'
                            }`}
                          >
                            {gameWinner && player.name === gameWinner ? '👑' : index + 1}
                          </div>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              player.isEliminated
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : gameWinner && player.name === gameWinner
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}
                          >
                            <span className="text-white text-sm font-semibold">{player.name.charAt(0)}</span>
                          </div>
                          <div>
                            <span className={`font-medium ${player.isEliminated ? 'text-red-800' : 'text-gray-900'}`}>
                              {player.name}
                              {player.isEliminated && <span className="text-xs ml-1">(Eliminated)</span>}
                              {gameWinner && player.name === gameWinner && (
                                <span className="text-xs ml-1 text-yellow-600 font-bold">(Winner!)</span>
                              )}
                            </span>
                            {player.timeoutCount > 0 && !player.isEliminated && (
                              <p className="text-xs text-orange-600">Timeouts: {player.timeoutCount}/2</p>
                            )}
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            player.isEliminated
                              ? 'text-red-600'
                              : gameWinner && player.name === gameWinner
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {player.score}
                        </div>
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

export default CricketersAtlas;
