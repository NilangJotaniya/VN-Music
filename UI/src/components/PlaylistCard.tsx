import { motion } from 'framer-motion';
import { Play, Music } from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  song_count: number;
}

interface PlaylistCardProps {
  playlist: Playlist;
  index?: number;
  onClick?: () => void;
}

export function PlaylistCard({ playlist, index = 0, onClick }: PlaylistCardProps) {
  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden">
        {playlist.cover_url ? (
          <img 
            src={playlist.cover_url} 
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2a2a3a] to-[#1a1a24] flex items-center justify-center">
            <Music className="w-16 h-16 text-[#8888aa]" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-[#111118]/50 to-transparent" />
        
        {/* Play Button */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.button
            className="w-16 h-16 rounded-full bg-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#7c3aed]/40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </motion.button>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-semibold text-[#e8e8f0] truncate text-lg">{playlist.name}</h3>
        <p className="text-sm text-[#8888aa] mt-1">{playlist.song_count || 0} songs</p>
      </div>
    </motion.div>
  );
}
