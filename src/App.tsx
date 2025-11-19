import React, { useState, useEffect } from 'react';
import { Users, TowerControl as GameController2, Crown, Zap, Heart, Star, Lock, Play, Settings, Trophy, Wifi, Eye, Target, Film } from 'lucide-react';
import { HelpCircle } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import CricketersAtlas from './components/CricketersAtlas';
import RoomSystem from './components/RoomSystem';
import AtlasSection from './components/AtlasSection';
import SpyGame from './components/SpyGame';
import DumbCharades from './components/DumbCharades';
import MrWhite from './components/MrWhite';
import HollywoodBollywoodGame from './components/HollywoodBollywoodGame';
import WhoAmI from './components/WhoAmI';

interface GameSlot {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  comingSoon: boolean;
  component?: string;
}

function App() {
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(true);
  const [savedUsername, setSavedUsername] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'game' | 'rooms' | 'atlas'>('home');
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('addaGamesUsername');
    if (stored) {
      setSavedUsername(stored);
      setShowUsernameInput(false);
    }
  }, []);
  // When coming from external lobby (?room=&game=...), auto-open game
  useEffect(() => {
    // wait until username screen is done
    if (showUsernameInput) return;

    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get("room");
    const gameKey = params.get("game");

    if (!gameKey) return;

    if (roomCode) {
      setCurrentRoomId(roomCode);
    }

    switch (gameKey) {
      case "atlas-games":
        // open Atlas games section
        setCurrentView("atlas");
        break;

      case "mr-white":
        setCurrentGame("MrWhite");
        setCurrentView("game");
        break;

      case "who-am-i":
        setCurrentGame("WhoAmI");
        setCurrentView("game");
        break;

      case "spy-game":
        setCurrentGame("SpyGame");
        setCurrentView("game");
        break;

      case "dumb-charades":
        setCurrentGame("DumbCharades");
        setCurrentView("game");
        break;

      case "hollywood-bollywood":
        setCurrentGame("HollywoodBollywoodGame");
        setCurrentView("game");
        break;

      default:
        // unknown gameKey → just stay on home
        break;
    }
  }, [showUsernameInput]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setSavedUsername(username.trim());
      localStorage.setItem('addaGamesUsername', username.trim());
      setShowUsernameInput(false);
    }
  };

  const handleChangeUsername = () => {
    setShowUsernameInput(true);
    setUsername(savedUsername);
  };

  const handleGameSelect = (gameComponent: string) => {
    if (gameComponent === 'multiplayer') {
      setCurrentView('rooms');
    } else if (gameComponent === 'atlas') {
      setCurrentView('atlas');
    } else {
      setCurrentGame(gameComponent);
      setCurrentView('game');
    }
  };

  const handleJoinGame = (roomId: string, game: string) => {
    setCurrentRoomId(roomId);
    setCurrentGame(game);
    setCurrentView('game');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentGame(null);
    setCurrentRoomId(null);
  };

  const gameSlots: GameSlot[] = [
    {
      id: 1,
      name: "Multiplayer Rooms",
      description: "Create or join rooms with friends",
      icon: <Wifi className="w-8 h-8" />,
      color: "from-blue-400 to-indigo-500",
      comingSoon: false,
      component: 'multiplayer'
    },
    {
      id: 2,
      name: "Atlas Games",
      description: "Alphabetical chain games across categories",
      icon: <Trophy className="w-8 h-8" />,
      color: "from-green-400 to-emerald-500",
      comingSoon: false,
      component: 'atlas'
    },
    {
      id: 3,
      name: "Mr. White",
      description: "Find who has the different word",
      icon: <Target className="w-8 h-8" />,
      color: "from-orange-400 to-red-500",
      comingSoon: false,
      component: 'MrWhite'
    },
    {
      id: 4,
      name: "Hollywood-Bollywood",
      description: "Guess Actor, Actress, Movie & Song from initials",
      icon: <Film className="w-8 h-8" />,
      color: "from-pink-400 to-purple-500",
      comingSoon: false,
      component: 'HollywoodBollywoodGame'
    },
    {
      id: 5,
      name: "Who Am I?",
      description: "Guess the celebrity through Yes/No questions",
      icon: <HelpCircle className="w-8 h-8" />,
      color: "from-indigo-400 to-blue-500",
      comingSoon: false,
      component: 'WhoAmI'
    },
    {
      id: 6,
      name: "Spy Game",
      description: "Find the spy among your friends",
      icon: <Eye className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500",
      comingSoon: false,
      component: 'SpyGame'
    },
    {
      id: 7,
      name: "Bollywood Quiz",
      description: "Test your Bollywood knowledge",
      icon: <Crown className="w-8 h-8" />,
      color: "from-yellow-400 to-orange-500",
      comingSoon: true
    },
    {
      id: 8,
      name: "Dumb Charades",
      description: "Act out movies and more",
      icon: <GameController2 className="w-8 h-8" />,
      color: "from-blue-400 to-cyan-500",
      comingSoon: false,
      component: 'DumbCharades'
    },
    {
      id: 9,
      name: "Rapid Fire",
      description: "Quick questions, quick answers",
      icon: <Zap className="w-8 h-8" />,
      color: "from-red-400 to-pink-500",
      comingSoon: true
    },
    {
      id: 10,
      name: "Name-Place-Animal",
      description: "The classic letter game",
      icon: <Heart className="w-8 h-8" />,
      color: "from-green-400 to-emerald-500",
      comingSoon: true
    },
    {
      id: 11,
      name: "Guess the Song",
      description: "Identify songs from clips",
      icon: <Play className="w-8 h-8" />,
      color: "from-indigo-400 to-purple-500",
      comingSoon: true
    }
  ];

  if (showUsernameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-2">
              ApnaAdda
            </h1>
            <p className="text-slate-600">Welcome to the ultimate Indian party experience!</p>
          </div>
          
          <form onSubmit={handleUsernameSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Enter Your Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80"
                placeholder="Your name..."
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Join the Adda!
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return <AdminPanel onBack={handleBackToHome} />;
  }

  if (currentView === 'rooms') {
    return <RoomSystem onBack={handleBackToHome} username={savedUsername} onJoinGame={handleJoinGame} />;
  }

  if (currentView === 'atlas') {
    return <AtlasSection onBack={handleBackToHome} username={savedUsername} roomId={currentRoomId} />;
  }

  if (currentView === 'game' && currentGame) {
    if (currentGame === 'CricketersAtlas') {
      return <CricketersAtlas onBack={handleBackToHome} username={savedUsername} roomId={currentRoomId} />;
    } else if (currentGame === 'SpyGame') {
      return <SpyGame onBack={handleBackToHome} username={savedUsername} roomId={currentRoomId} />;
    } else if (currentGame === 'DumbCharades') {
      return <DumbCharades onBack={handleBackToHome} username={savedUsername} roomId={currentRoomId} />;
    } else if (currentGame === 'MrWhite') {
      return <MrWhite onBack={handleBackToHome} username={savedUsername} roomId={currentRoomId} />;
    } else if (currentGame === 'HollywoodBollywoodGame') {
      return <HollywoodBollywoodGame onBack={handleBackToHome} username={savedUsername} roomId={currentRoomId} />;
    } else if (currentGame === 'WhoAmI') {
      return <WhoAmI onBack={handleBackToHome} username={savedUsername} roomId={currentRoomId} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                ApnaAdda
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600">Welcome,</span>
                <span className="font-semibold text-purple-600">{savedUsername}</span>
              </div>
              {savedUsername === 'Pratham_is_Admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors duration-200"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Admin</span>
                </button>
              )}
              <button
                onClick={handleChangeUsername}
                className="text-sm text-slate-500 hover:text-purple-600 transition-colors duration-200"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Game
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Get ready for some fun! Select from our collection of classic Indian party games 
            and create unforgettable memories with your friends and family.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameSlots.map((game) => (
            <div
              key={game.id}
              className="group relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-white/20"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${game.color} text-white`}>
                    {game.icon}
                  </div>
                  {game.comingSoon && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-medium">Coming Soon</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{game.name}</h3>
                <p className="text-slate-600 mb-4">{game.description}</p>
                
                <button
                  onClick={() => game.component && handleGameSelect(game.component)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    game.comingSoon
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${game.color} text-white hover:shadow-lg transform hover:scale-105`
                  }`}
                  disabled={game.comingSoon}
                >
                  {game.comingSoon ? 'Coming Soon' : 'Play Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-slate-300">
            <Heart className="w-4 h-4 text-orange-500" />
            <span>More games coming soon to make your adda even more exciting!</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;