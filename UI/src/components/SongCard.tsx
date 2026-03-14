import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';

interface SongCardSong {
  id: string | number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover_url: string;
  audio_url?: string;
  genre: string;
  play_count: number;
}

interface SongCardProps {
  song: SongCardSong;
  variant?: 'default' | 'compact' | 'row';
  index?: number;
}

export function SongCard({ song, variant = 'default', index = 0 }: SongCardProps) {
  const { 
    currentSong, 
    isPlaying: isGlobalPlaying, 
    setCurrentSong, 
    togglePlay,
    favorites,
    toggleFavorite
  } = useMusicStore();
  
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentSong = currentSong?.id === song.id;
  const isActive = isCurrentSong && isGlobalPlaying;
  const isFavorite = favorites.includes(String(song.id));

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      setCurrentSong(song);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(String(song.id));
  };

  if (variant === 'row') {
    return (
      <motion.div
        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-[#1a1a24] transition-all duration-200 cursor-pointer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setCurrentSong(song)}
      >
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
          <AnimatePresence>
            {(isHovered || isActive) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                {isActive && isGlobalPlaying ? (
                  <div className="flex items-end gap-0.5 h-4">
                    <motion.div 
                      className="w-1 bg-[#a855f7] rounded-full"
                      animate={{ height: [4, 16, 8, 16] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <motion.div 
                      className="w-1 bg-[#a855f7] rounded-full"
                      animate={{ height: [8, 4, 16, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div 
                      className="w-1 bg-[#a855f7] rounded-full"
                      animate={{ height: [16, 8, 4, 16] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                    />
                  </div>
                ) : (
                  <Play className="w-5 h-5 text-white fill-white" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isActive ? 'text-[#a855f7]' : 'text-[#e8e8f0]'}`}>
            {song.title}
          </p>
          <p className="text-sm text-[#8888aa] truncate">{song.artist}</p>
        </div>
        
        <span className="text-sm text-[#8888aa] hidden sm:block">{song.duration}</span>
        
        <motion.button
          onClick={handleFavorite}
          className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500' : 'text-[#8888aa] hover:text-[#e8e8f0]'}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
        </motion.button>
        
        <motion.button
          className="p-2 rounded-full text-[#8888aa] hover:text-[#e8e8f0] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </motion.button>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className="group relative flex-shrink-0 w-36 cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        onClick={() => setCurrentSong(song)}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
          <img 
            src={song.cover_url} 
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <motion.div
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <motion.button
              onClick={handlePlay}
              className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && isGlobalPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </motion.button>
          </motion.div>
        </div>
        <p className="font-medium text-[#e8e8f0] text-sm truncate">{song.title}</p>
        <p className="text-xs text-[#8888aa] truncate">{song.artist}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden bg-[#1a1a24] hover:bg-[#222230] transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => setCurrentSong(song)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={song.cover_url} 
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent opacity-60" />
        
        <motion.div
          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <motion.button
            onClick={handlePlay}
            className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {isActive && isGlobalPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            )}
          </motion.button>
        </motion.div>
        
        {isActive && isGlobalPlaying && (
          <div className="absolute top-3 right-3 flex items-end gap-0.5 h-5 px-2 py-1 bg-[#7c3aed]/80 rounded-lg">
            <motion.div 
              className="w-1 bg-white rounded-full"
              animate={{ height: [4, 16, 8, 16] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <motion.div 
              className="w-1 bg-white rounded-full"
              animate={{ height: [8, 4, 16, 8] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div 
              className="w-1 bg-white rounded-full"
              animate={{ height: [16, 8, 4, 16] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className={`font-semibold truncate ${isActive ? 'text-[#a855f7]' : 'text-[#e8e8f0]'}`}>
          {song.title}
        </h3>
        <p className="text-sm text-[#8888aa] truncate mt-1">{song.artist}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-[#666688]">{song.duration}</span>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleFavorite}
              className={`p-1.5 rounded-full transition-colors ${isFavorite ? 'text-red-500' : 'text-[#8888aa] hover:text-[#e8e8f0]'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
            </motion.button>
            <motion.button
              className="p-1.5 rounded-full text-[#8888aa] hover:text-[#e8e8f0] transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
