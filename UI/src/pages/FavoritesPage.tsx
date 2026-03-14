import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import { SongCard } from '../components/SongCard';
import { useMusicStore } from '../store/musicStore';

export function FavoritesPage() {
  const [favoritesData, setFavoritesData] = useState([]);
  const { setFavorites } = useMusicStore();

  useEffect(() => {
    fetch('/api/favorites')
      .then(res => res.json())
      .then(data => {
        setFavoritesData(data);
        setFavorites(data.map((f: any) => String(f.songs?.id || f.song_id)));
      });
  }, [setFavorites]);

  const favoriteSongs = favoritesData.map((f: any) => f.songs).filter(Boolean);

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <h1 
              className="text-4xl font-bold text-[#e8e8f0]"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Liked Songs
            </h1>
            <p className="text-[#8888aa] mt-1">{favoriteSongs.length} songs</p>
          </div>
        </div>
      </motion.div>

      {/* Play Button */}
      {favoriteSongs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <motion.button
            className="w-14 h-14 rounded-full bg-[#7c3aed] hover:bg-[#a855f7] flex items-center justify-center shadow-lg shadow-[#7c3aed]/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </motion.button>
        </motion.div>
      )}

      {/* Songs List */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {favoriteSongs.length > 0 ? (
          <div className="space-y-1">
            {favoriteSongs.map((song: any, index: number) => (
              <SongCard key={song.id} song={song} variant="row" index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-[#2a2a3a] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#e8e8f0] mb-2">Songs you like will appear here</h3>
            <p className="text-[#8888aa]">Save songs by tapping the heart icon</p>
          </div>
        )}
      </motion.section>
    </div>
  );
}
