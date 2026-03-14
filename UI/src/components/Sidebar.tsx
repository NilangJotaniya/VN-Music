import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  Heart, 
  Library, 
  PlusSquare, 
  Music,
  LogOut
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'playlists', label: 'Playlists', icon: Library },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { playlists } = useMusicStore();
  const [user] = useState({ name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' });

  return (
    <aside className="w-60 h-full bg-[#111118] border-r border-[#2a2a3a] flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 w-10 h-10 rounded-xl bg-[#7c3aed] blur-lg opacity-50" />
          </div>
          <span className="text-xl font-bold text-[#e8e8f0]" style={{ fontFamily: 'Syne, sans-serif' }}>
            VN Music
          </span>
        </motion.div>
      </div>

      {/* Main Nav */}
      <nav className="px-3 pb-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#7c3aed]/20 text-[#a855f7]' 
                  : 'text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#1a1a24]'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#a855f7]' : 'group-hover:text-[#e8e8f0]'}`} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-6 bg-gradient-to-b from-[#7c3aed] to-[#a855f7] rounded-r-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[#2a2a3a] to-transparent" />

      {/* Your Library */}
      <div className="flex-1 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider">Your Library</span>
          <motion.button 
            className="p-1.5 rounded-lg hover:bg-[#1a1a24] text-[#8888aa] hover:text-[#e8e8f0] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusSquare className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="px-3 overflow-y-auto h-[calc(100%-60px)] scrollbar-thin scrollbar-thumb-[#2a2a3a] scrollbar-track-transparent">
          {playlists.slice(0, 6).map((playlist, index) => (
            <motion.button
              key={playlist.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1a1a24] transition-all duration-200 group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2a2a3a] to-[#1a1a24] overflow-hidden">
                {playlist.cover_url ? (
                  <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Library className="w-4 h-4 text-[#8888aa]" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[#e8e8f0] truncate">{playlist.name}</p>
                <p className="text-xs text-[#8888aa]">{playlist.song_count || 0} songs</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#2a2a3a]">
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a24] hover:bg-[#222230] transition-colors cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] p-0.5">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#e8e8f0]">{user.name}</p>
            <p className="text-xs text-[#8888aa]">Premium</p>
          </div>
          <LogOut className="w-4 h-4 text-[#8888aa] group-hover:text-[#e8e8f0] transition-colors" />
        </motion.div>
      </div>
    </aside>
  );
}
