// src/pages/Favorites.jsx — Redesigned
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import SongCard from '../components/SongCard/SongCard';
import { useJamSession } from '../context/JamContext';
import { favoritesAPI } from '../services/api';
import { usePlayer } from '../context/PlayerContext';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();
  const { canControlPlayback } = useJamSession();

  const load = useCallback(async () => {
    try { const r = await favoritesAPI.getAll(); setFavorites(r.data.favorites || []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mesh-bg min-h-full p-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(239,68,68,0.1))', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Heart size={18} className="text-red-400" fill="currentColor" />
            </div>
            <h1 className="text-[1.75rem] font-bold tracking-[-0.025em] text-vn-text">Favorites</h1>
          </div>
          <p className="text-vn-muted text-sm pl-1">{favorites.length} saved {favorites.length === 1 ? 'song' : 'songs'}</p>
        </div>
        {favorites.length > 0 && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => canControlPlayback && playSong(favorites[0], favorites)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
            <Play size={14} fill="white" /> Play All
          </motion.button>
        )}
      </motion.div>

      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="skeleton w-11 h-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-2/3" />
                <div className="skeleton h-2.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <Heart size={56} className="text-vn-muted mx-auto mb-4 opacity-20" />
          <p className="text-vn-text font-semibold mb-2">No favorites yet</p>
          <p className="text-vn-muted text-sm">Hit the heart on any song to save it here.</p>
        </motion.div>
      )}

      <AnimatePresence>
        {!loading && favorites.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0.5">
            {favorites.map((s, i) => (
              <SongCard key={s.videoId} song={{ ...s, isFavorite: true }} songList={favorites} showIndex={i+1} onFavoriteChange={load} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
