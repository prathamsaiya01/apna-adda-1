import { ArrowLeft, Trophy, Film, MapPin, Music, Book, Gamepad2, Star, Crown, Globe, Mic, Camera, Lock } from 'lucide-react';
import CricketersAtlas from './CricketersAtlas';

interface AtlasCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  comingSoon: boolean;
  component?: string;
}

interface AtlasSectionProps {
  onBack: () => void;
  username: string;
  roomId?: string | null;
}

const AtlasSection: React.FC<AtlasSectionProps> = ({ onBack, username, roomId }) => {
  const [currentView, setCurrentView] = useState<'categories' | 'game'>('categories');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const atlasCategories: AtlasCategory[] = [
    {
      id: 'cricketers',
      name: "Cricketers Atlas",
      description: "Name cricketers in alphabetical chain",
      icon: <Trophy className="w-8 h-8" />,
      color: "from-green-400 to-emerald-500",
      comingSoon: false,
      component: 'CricketersAtlas'
    },
    {
      id: 'movies',
      name: "Movie Atlas",
      description: "Chain movie names alphabetically",
      icon: <Film className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500",
      comingSoon: true
    },
    {
      id: 'places',
      name: "Places Atlas",
      description: "Name places around the world",
      icon: <MapPin className="w-8 h-8" />,
      color: "from-blue-400 to-cyan-500",
      comingSoon: true
    },
    {
      id: 'songs',
      name: "Songs Atlas",
      description: "Chain song titles alphabetically",
      icon: <Music className="w-8 h-8" />,
      color: "from-red-400 to-orange-500",
      comingSoon: true
    },
    {
      id: 'books',
      name: "Books Atlas",
      description: "Name books and novels in chain",
      icon: <Book className="w-8 h-8" />,
      color: "from-indigo-400 to-purple-500",
      comingSoon: true
    },
    {
      id: 'actors',
      name: "Actors Atlas",
      description: "Chain actor and actress names",
      icon: <Star className="w-8 h-8" />,
      color: "from-yellow-400 to-orange-500",
      comingSoon: true
    },
    {
      id: 'countries',
      name: "Countries Atlas",
      description: "Name countries alphabetically",
      icon: <Globe className="w-8 h-8" />,
      color: "from-teal-400 to-green-500",
      comingSoon: true
    },
    {
      id: 'brands',
      name: "Brands Atlas",
      description: "Chain brand names alphabetically",
      icon: <Crown className="w-8 h-8" />,
      color: "from-pink-400 to-red-500",
      comingSoon: true
    }
  ];

  const handleCategorySelect = (category: AtlasCategory) => {
    if (category.comingSoon) return;
    
    setSelectedGame(category.component || null);
    setCurrentView('game');
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedGame(null);
  };

  if (currentView === 'game' && selectedGame) {
    if (selectedGame === 'CricketersAtlas') {
      return <CricketersAtlas onBack={handleBackToCategories} username={username} roomId={roomId} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-600 hover:text-purple-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Games</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Atlas Games
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Atlas Category
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Test your knowledge across different categories! Each Atlas game challenges you to name items 
            in alphabetical chains. Pick your favorite category and start the mental marathon.
          </p>
        </div>

        {/* Atlas Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {atlasCategories.map((category) => (
            <div
              key={category.id}
              className="group relative bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-white/20"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  {category.comingSoon && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-medium">Coming Soon</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>
                <p className="text-slate-600 mb-4">{category.description}</p>
                
                <button
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    category.comingSoon
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${category.color} text-white hover:shadow-lg transform hover:scale-105`
                  }`}
                  disabled={category.comingSoon}
                >
                  {category.comingSoon ? 'Coming Soon' : 'Play Now'}
                </button>
              </div>

              {/* Special indicator for active games */}
              {!category.comingSoon && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">How Atlas Games Work</h3>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3 font-bold">1</div>
                  <h4 className="font-semibold text-slate-900 mb-2">Chain Rule</h4>
                  <p className="text-sm text-slate-600">Each player must name an item starting with the last letter of the previous item.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mb-3 font-bold">2</div>
                  <h4 className="font-semibold text-slate-900 mb-2">Time Pressure</h4>
                  <p className="text-sm text-slate-600">You have 30 seconds per turn. Two timeouts and you're eliminated!</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mb-3 font-bold">3</div>
                  <h4 className="font-semibold text-slate-900 mb-2">Last Player Wins</h4>
                  <p className="text-sm text-slate-600">Keep playing until only one player remains. No repeats allowed!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-slate-300">
            <Star className="w-4 h-4 text-purple-500" />
            <span>More Atlas categories will be added based on your preferences!</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AtlasSection;
