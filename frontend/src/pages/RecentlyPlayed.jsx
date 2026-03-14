import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Play, Trash2 } from 'lucide-react';
import SongCard from '../components/SongCard/SongCard';
import { useJamSession } from '../context/JamContext';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';

const getBucketLabel = (playedAt) => {
  const playedDate = new Date(playedAt);
  const now = new Date();
  const diffMs = now.getTime() - playedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This Week';
  return 'Earlier';
};

export default function RecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();
  const { canControlPlayback } = useJamSession();
  const { toast } = useToast();

  const loadRecentlyPlayed = useCallback(async () => {
    try {
      const response = await userAPI.getRecentlyPlayed();
      setRecentlyPlayed(response.data.recentlyPlayed || []);
    } catch {
      setRecentlyPlayed([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentlyPlayed();
  }, [loadRecentlyPlayed]);

  const groupedSongs = useMemo(() => recentlyPlayed.reduce((groups, song) => {
    const bucket = getBucketLabel(song.playedAt);
    groups[bucket] = [...(groups[bucket] || []), song];
    return groups;
  }, {}), [recentlyPlayed]);

  const clearHistory = async () => {
    try {
      await userAPI.clearRecentlyPlayed();
      setRecentlyPlayed([]);
      toast('Recently played cleared');
    } catch {
      toast('Failed to clear recently played', 'error');
    }
  };

  return (
    <div className="min-h-full pb-24">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Clock3 size={18} className="text-cyan-300" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-vn-muted">History</p>
          </div>
          <h1 className="text-[1.9rem] font-bold tracking-[-0.04em] text-vn-text md:text-[2.4rem]">Recently played.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-vn-muted">Your listening history, grouped so it feels more like a real music app instead of a raw list.</p>
        </div>
        <div className="flex gap-3">
          {recentlyPlayed.length ? (
            <button
              type="button"
              onClick={() => canControlPlayback && playSong(recentlyPlayed[0], recentlyPlayed)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white"
            >
              <Play size={14} fill="currentColor" />
              Play recent
            </button>
          ) : null}
          {recentlyPlayed.length ? (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-vn-text transition hover:border-red-400/30 hover:text-red-300"
            >
              <Trash2 size={14} />
              Clear history
            </button>
          ) : null}
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {!loading && !recentlyPlayed.length ? (
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] py-16 text-center">
          <Clock3 size={44} className="mx-auto mb-4 text-vn-muted opacity-30" />
          <p className="text-lg font-semibold text-vn-text">Nothing played yet</p>
          <p className="mt-2 text-sm text-vn-muted">Once you start listening, your history will appear here.</p>
        </div>
      ) : null}

      {!loading && recentlyPlayed.length ? (
        <div className="space-y-8">
          {Object.entries(groupedSongs).map(([label, songs]) => (
            <section key={label}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[1.35rem] font-bold tracking-[-0.03em] text-vn-text">{label}</h2>
                <span className="text-sm text-vn-muted">{songs.length} tracks</span>
              </div>
              <div className="rounded-[28px] border border-white/8 bg-white/[0.02] p-2">
                {songs.map((song, index) => (
                  <SongCard key={`${song.videoId}-${song.playedAt || index}`} song={song} songList={songs} showIndex={index + 1} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
