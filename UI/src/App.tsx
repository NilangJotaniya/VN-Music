import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PlaylistsPage } from './pages/PlaylistsPage';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth animation
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'playlists':
        return <PlaylistsPage />;
      default:
        return <HomePage />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#080810] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl bg-[#7c3aed]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <span className="text-[#8888aa] font-medium">Loading VN Music...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#080810] flex overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7c3aed]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#a855f7]/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a2a3a] scrollbar-track-transparent">
          <div className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>

        {/* Player Bar */}
        <PlayerBar />
      </main>
    </div>
  );
}

export default App;
