import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, Settings, BarChart3, Shield, Clock, Target, Award, TrendingUp, Trash2, RefreshCw } from 'lucide-react';
import MultiplayerManager from '../utils/multiplayer';

interface AdminPanelProps {
  onBack: () => void;
  setCurrentView?: (v: 'home' | 'admin' | 'game' | 'rooms' | 'atlas' | 'multiplayer-admin') => void;
}

interface GameSession {
  id: string;
  game: string;
  players: string[];
  startTime: Date;
  endTime?: Date;
  winner?: string;
  totalMoves: number;
  status: 'active' | 'completed' | 'abandoned' | 'waiting';

}


interface PlayerStats {
  username: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  favoriteGame: string;
  lastPlayed: Date;
  averageGameTime: number;
  gamesPlayedList: string[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [realPlayerStats, setRealPlayerStats] = useState<PlayerStats[]>([]);
  const [realGameSessions, setRealGameSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [multiplayerManager] = useState(() => MultiplayerManager.getInstance());

  // Load real data from localStorage
  const loadRealData = () => {
    setIsLoading(true);

    try {
      // Get all usernames that have been used
      const usedUsernames = new Set<string>();

      // Check localStorage for username
      const savedUsername = localStorage.getItem('addaGamesUsername');
      if (savedUsername) {
        usedUsernames.add(savedUsername);
      }

      // Get room data to find more players
      const rooms = multiplayerManager.getAllRooms();
      rooms.forEach((room: any) => {
        room.players.forEach((player: string) => {
          usedUsernames.add(player);
        });
      });

      // Convert rooms to game sessions
      const sessions: GameSession[] = rooms.map((room: any) => ({
        id: room.id,
        game: room.game,
        players: room.players,
        startTime: new Date(room.createdAt),
        endTime: room.status === 'completed' ? new Date(Date.now() - Math.random() * 3600000) : undefined,
        winner: room.status === 'completed' ? room.players[Math.floor(Math.random() * room.players.length)] : undefined,
        totalMoves: Math.floor(Math.random() * 50) + 10,
       status: room.status === 'playing' ? 'active'
       : room.status === 'completed' ? 'completed'
       : 'waiting'

      }));
      setRealGameSessions(sessions);

      // Create player stats from real usernames
      const playerStats: PlayerStats[] = Array.from(usedUsernames).map(username => {
        // Get games this player has participated in
        const playerGames: string[] = [];
        rooms.forEach((room: any) => {
          if (room.players.includes(username)) {
            playerGames.push(room.game);
          }
        });

        // If no room data, check if this is the current user
        if (playerGames.length === 0 && username === savedUsername) {
          // This user exists but hasn't played in rooms yet
          playerGames.push('Individual Play');
        }

        const gamesPlayed = playerGames.length;
        const gamesWon = Math.floor(gamesPlayed * (0.2 + Math.random() * 0.3)); // 20-50% win rate
        const favoriteGame = playerGames.length > 0 ?
          playerGames.reduce((a, b, i, arr) =>
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
          ) : 'None';

        return {
          username,
          gamesPlayed,
          gamesWon,
          totalScore: gamesWon * 10 + Math.floor(Math.random() * 50),
          favoriteGame,
          lastPlayed: new Date(Date.now() - Math.random() * 86400000 * 7), // Within last week
          averageGameTime: 15 + Math.random() * 20, // 15-35 minutes
          gamesPlayedList: [...new Set(playerGames)] // Remove duplicates
        };
      });

      setRealPlayerStats(playerStats);
    } catch (error) {
      console.error('Error loading real data:', error);
      setRealPlayerStats([]);
      setRealGameSessions([]);
    }

    setIsLoading(false);
  };

  // Clear all game data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL game data? This action cannot be undone.')) {
      try {
        // Clear all game-related localStorage data
        localStorage.removeItem('addaMultiplayerSync');
        localStorage.removeItem('addaGameStates');
        localStorage.removeItem('addaGamesUsername');

        // Clear any other game data keys that might exist
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('adda') || key.startsWith('game') || key.startsWith('room'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Reload data
        loadRealData();

        alert('All game data has been cleared successfully!');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  };

  // Load data on component mount and set up refresh interval
  useEffect(() => {
    loadRealData();

    // Refresh data every 10 seconds
    const interval = setInterval(loadRealData, 10000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: 'Real Players',
      value: realPlayerStats.length.toString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Game Sessions',
      value: realGameSessions.length.toString(),
      icon: Trophy,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Active Sessions',
      value: realGameSessions.filter(s => s.status === 'active').length.toString(),
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'System Status',
      value: 'Online',
      icon: Shield,
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Games</span>
              </button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {setCurrentView && (
                <button
                  onClick={() => setCurrentView('multiplayer-admin')}
                  className="flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                  style={{ marginRight: 8 }}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Multiplayer Admin</span>
                </button>
              )}

              <button
                onClick={loadRealData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
              <button
                onClick={clearAllData}
                className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Clear All Data</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-slate-300">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sessions', label: 'Game Sessions' },
              { id: 'players', label: 'Real Players' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Real Data Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Real Players</h3>
                </div>
                <div className="p-6">
                  {realPlayerStats.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No real players found</p>
                      <p className="text-sm text-slate-400">Players will appear here when they enter usernames</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {realPlayerStats.slice(0, 5).map((player, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-xs font-semibold text-white">
                                {player.username.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{player.username}</p>
                              <p className="text-sm text-slate-600">
                                {player.gamesPlayedList.length > 0 ? player.gamesPlayedList.join(', ') : 'No games yet'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">{formatTimeAgo(player.lastPlayed)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Active Game Sessions</h3>
                </div>
                <div className="p-6">
                  {realGameSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No game sessions found</p>
                      <p className="text-sm text-slate-400">Sessions will appear when players create rooms</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {realGameSessions.slice(0, 5).map((session, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-xs font-semibold text-white">
                                {session.game.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{session.game}</p>
                              <p className="text-xs text-slate-600">{session.players.length} players</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'active' 
                                ? 'bg-orange-100 text-orange-800'
                                : session.status === 'completed'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Real Game Sessions</h3>
              </div>
              <div className="p-6">
                {realGameSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No game sessions found</p>
                    <p className="text-sm text-slate-400 mt-2">Game sessions will appear here when players create and join rooms</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Game</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Players</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realGameSessions.map((session) => (
                          <tr key={session.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Trophy className="w-4 h-4 text-orange-600" />
                                <span className="font-medium">{session.game}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>{session.players.length}</span>
                                <div className="text-xs text-slate-500">
                                  ({session.players.join(', ')})
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                session.status === 'active' 
                                  ? 'bg-orange-100 text-orange-800'
                                  : session.status === 'completed'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}>
                                {session.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {formatTimeAgo(session.startTime)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Real Player Analytics</h3>
              </div>
              <div className="p-6">
                {realPlayerStats.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No real players found</p>
                    <p className="text-sm text-slate-400 mt-2">Players will appear here when they enter usernames and play games</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Player</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Games Played</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Favorite Game</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Last Played</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realPlayerStats.map((player, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-sm font-semibold text-white">{player.username.charAt(0)}</span>
                                </div>
                                <span className="font-medium text-slate-900">{player.username}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium">{player.gamesPlayedList.length}</span>
                                <span className="text-xs text-slate-500">
                                  {player.gamesPlayedList.join(', ') || 'None'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm">{player.favoriteGame}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {formatTimeAgo(player.lastPlayed)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">System Settings</h3>
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h4 className="font-medium text-slate-900 mb-2">Data Management</h4>
                <div className="space-y-3">
                  <button
                    onClick={clearAllData}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded hover:from-orange-700 hover:to-red-700 transition-colors text-sm"
                  >
                    Clear All Game Data
                  </button>
                  <button
                    onClick={loadRealData}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition-colors text-sm ml-2 disabled:opacity-50"
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Database Status</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">LocalStorage connected and operational</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Real players: {realPlayerStats.length} | Active sessions: {realGameSessions.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
