import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown, ArrowUp, ExternalLink, FileText, Heart, ListMusic, Music, SkipForward, Trash2, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJamSession } from '../../context/JamContext';
import { useLyrics } from '../../context/LyricsContext';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../context/ToastContext';
import { favoritesAPI } from '../../services/api';

const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export default function NowPlayingModal({ onClose }) {
  const {
    currentSong,
    queue,
    isPlaying,
    currentTime,
    duration,
    seek,
    playSong,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
  } = usePlayer();
  const { lyrics, loading: lyricsLoading, error: lyricsError, fetchLyrics } = useLyrics();
  const { isAuthenticated } = useAuth();
  const { canControlPlayback } = useJamSession();
  const { toast } = useToast();
  const [tab, setTab] = useState('lyrics');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!currentSong) return;
    fetchLyrics(currentSong.title, currentSong.channelName);
  }, [currentSong, fetchLyrics]);

  const handleFavorite = async () => {
    if (!currentSong) return;
    if (!isAuthenticated) {
      toast('Login to save favorites', 'info');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(currentSong.videoId);
        setIsFavorite(false);
        toast('Removed from favorites');
      } else {
        await favoritesAPI.add(currentSong);
        setIsFavorite(true);
        toast('Added to favorites');
      }
    } catch {
      toast('Already in favorites', 'info');
      setIsFavorite(true);
    }
  };

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-2xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-5xl gap-8 overflow-hidden rounded-t-[32px] border border-white/8 bg-[#101018] p-8"
      >
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <img src={currentSong.thumbnail} alt="" className="h-full w-full scale-110 object-cover blur-3xl" />
        </div>

        <div className="relative z-10 flex w-72 flex-shrink-0 flex-col items-center gap-6">
          <button type="button" onClick={onClose} className="self-end rounded-full p-2 text-vn-muted transition hover:bg-white/5 hover:text-vn-text">
            <X size={18} />
          </button>

          <div className={`h-56 w-56 overflow-hidden rounded-[28px] shadow-2xl ${isPlaying ? 'now-playing-glow' : ''}`}>
            <img src={currentSong.thumbnail} alt={currentSong.title} className="h-full w-full object-cover" />
          </div>

          <div className="text-center">
            <h2 className="line-clamp-2 text-xl font-bold text-vn-text">{currentSong.title}</h2>
            <p className="mt-2 text-sm text-vn-muted">{currentSong.channelName}</p>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" onClick={handleFavorite} className={`rounded-full p-2 transition ${isFavorite ? 'text-red-400' : 'text-vn-muted hover:text-red-400'}`}>
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <a href={`https://youtube.com/watch?v=${currentSong.videoId}`} target="_blank" rel="noreferrer" className="rounded-full p-2 text-vn-muted transition hover:text-purple-300">
              <ExternalLink size={18} />
            </a>
          </div>

          <div className="w-full">
            <input
              type="range"
              min={0}
              max={duration || 1}
              value={currentTime}
              onChange={(event) => seek(Number(event.target.value))}
              disabled={!canControlPlayback}
              className="w-full"
              style={{ background: `linear-gradient(to right,#7c3aed ${progress}%,#2a2a3a ${progress}%)` }}
            />
            <div className="mt-2 flex justify-between font-mono text-xs text-vn-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="mb-5 flex gap-1 rounded-2xl bg-white/[0.04] p-1">
            {[
              { id: 'lyrics', label: 'Lyrics', icon: FileText },
              { id: 'queue', label: 'Queue', icon: ListMusic },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={[
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                  tab === item.id ? 'bg-[#7c3aed] text-white' : 'text-vn-muted hover:text-vn-text',
                ].join(' ')}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'lyrics' ? (
            <div className="flex-1 overflow-y-auto pr-2">
              {lyricsLoading ? (
                <div className="space-y-3">
                  {[...Array(7)].map((_, index) => (
                    <div key={index} className="skeleton h-4" style={{ width: `${58 + Math.random() * 24}%` }} />
                  ))}
                </div>
              ) : lyricsError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Music size={42} className="mb-3 text-vn-muted opacity-30" />
                  <p className="text-sm text-vn-muted">{lyricsError}</p>
                </div>
              ) : (
                <div className="whitespace-pre-line text-sm leading-relaxed text-vn-text/90">{lyrics}</div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2">
              {queue.length ? (
                <div className="space-y-2">
                  <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-vn-text">Up next</p>
                      <p className="text-xs text-vn-muted">{queue.length} songs queued</p>
                    </div>
                    {canControlPlayback ? (
                      <button
                        type="button"
                        onClick={clearQueue}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs text-vn-muted transition hover:border-red-400/30 hover:text-red-300"
                      >
                        Clear queue
                      </button>
                    ) : null}
                  </div>
                  {queue.map((song, index) => (
                    <div
                      key={`${song.videoId}-${index}`}
                      className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.04]"
                    >
                      <span className="w-4 text-xs text-vn-muted">{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => canControlPlayback && playSong(song, queue.slice(index), { queueOverride: queue.slice(index + 1) })}
                        disabled={!canControlPlayback}
                        className="contents disabled:opacity-60"
                      >
                        <img src={song.thumbnail} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-vn-text">{song.title}</p>
                        <p className="truncate text-xs text-vn-muted">{song.channelName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => canControlPlayback && playSong(song, queue.slice(index), { queueOverride: queue.slice(index + 1) })}
                        disabled={!canControlPlayback}
                        className="rounded-lg p-2 text-vn-muted transition hover:text-vn-text disabled:opacity-50"
                      >
                        <SkipForward size={14} />
                      </button>
                      {canControlPlayback ? (
                        <button
                          type="button"
                          onClick={() => moveQueueItem(index, index - 1)}
                          disabled={index === 0}
                          className="rounded-lg p-2 text-vn-muted transition hover:text-vn-text disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                      ) : null}
                      {canControlPlayback ? (
                        <button
                          type="button"
                          onClick={() => moveQueueItem(index, index + 1)}
                          disabled={index === queue.length - 1}
                          className="rounded-lg p-2 text-vn-muted transition hover:text-vn-text disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                      ) : null}
                      {canControlPlayback ? (
                        <button
                          type="button"
                          onClick={() => removeFromQueue(song.videoId, index)}
                          className="rounded-lg p-2 text-vn-muted transition hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ListMusic size={42} className="mb-3 text-vn-muted opacity-30" />
                  <p className="text-sm text-vn-muted">Queue is empty</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
