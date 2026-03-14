import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Heart, ListMusic, Maximize2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJamSession } from '../../context/JamContext';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../context/ToastContext';
import { favoritesAPI } from '../../services/api';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import NowPlayingModal from './NowPlayingModal';

const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    volume,
    changeVolume,
    isMuted,
    toggleMute,
    isShuffled,
    setIsShuffled,
    repeatMode,
    cycleRepeat,
    playNext,
    playPrev,
  } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { session, canControlPlayback } = useJamSession();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useKeyboardShortcuts();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const controlsDisabled = !currentSong || !canControlPlayback;

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
      } else {
        await favoritesAPI.add(currentSong);
        setIsFavorite(true);
      }
    } catch {
      setIsFavorite(true);
    }
  };

  if (!currentSong) {
    return (
      <>
        <div className="hidden h-[72px] border-t border-[#2a2a3a] bg-[#0d0d15] px-6 md:block">
          <div className="flex h-full items-center justify-center text-sm text-[#666688]">Select a song to start listening</div>
        </div>
        <div className="fixed bottom-[72px] left-0 right-0 z-20 border-t border-white/8 bg-[#0d0d15]/96 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-center text-xs text-[#666688]">Select a song to start listening</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showModal ? <NowPlayingModal onClose={() => setShowModal(false)} /> : null}
      </AnimatePresence>

      <motion.div
        className="relative hidden border-t border-[#2a2a3a] bg-[#0d0d15]/95 px-6 backdrop-blur-xl md:block"
        initial={{ y: 72 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {isPlaying ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#7c3aed]/10 to-transparent" />
        ) : null}

        <div className="flex h-[72px] items-center">
          <div className="flex min-w-[220px] w-[30%] items-center gap-4">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="relative h-14 w-14 overflow-hidden rounded-lg"
            >
              <img src={currentSong.thumbnail} alt={currentSong.title} className="h-full w-full object-cover" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[#e8e8f0]">{currentSong.title}</p>
              <p className="truncate text-sm text-[#8888aa]">{currentSong.channelName}</p>
            </div>
            <button type="button" onClick={handleFavorite} className={`rounded-full p-2 transition-colors ${isFavorite ? 'text-red-500' : 'text-[#8888aa] hover:text-[#e8e8f0]'}`}>
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setIsShuffled((prev) => !prev)} disabled={controlsDisabled} className={`rounded-full p-2 transition-colors ${isShuffled ? 'text-[#a855f7]' : 'text-[#8888aa] hover:text-[#e8e8f0]'} disabled:opacity-40`}>
                <Shuffle className="h-4 w-4" />
              </button>
              <button type="button" onClick={playPrev} disabled={controlsDisabled} className="rounded-full p-2 text-[#e8e8f0] disabled:opacity-40">
                <SkipBack className="h-5 w-5 fill-current" />
              </button>
              <button type="button" onClick={togglePlay} disabled={controlsDisabled} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8e8f0] transition-transform hover:scale-105 disabled:opacity-40">
                {isPlaying ? <Pause className="h-5 w-5 fill-[#080810] text-[#080810]" /> : <Play className="ml-0.5 h-5 w-5 fill-[#080810] text-[#080810]" />}
              </button>
              <button type="button" onClick={playNext} disabled={controlsDisabled} className="rounded-full p-2 text-[#e8e8f0] disabled:opacity-40">
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
              <button type="button" onClick={cycleRepeat} disabled={controlsDisabled} className={`rounded-full p-2 transition-colors ${repeatMode !== 'none' ? 'text-[#a855f7]' : 'text-[#8888aa] hover:text-[#e8e8f0]'} disabled:opacity-40`}>
                {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex w-full max-w-md items-center gap-3">
              <span className="w-10 text-right text-xs text-[#8888aa]">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                value={currentTime}
                onChange={(event) => seek(Number(event.target.value))}
                disabled={controlsDisabled}
                className="w-full"
                style={{ background: `linear-gradient(to right,#7c3aed ${progress}%,#2a2a3a ${progress}%)` }}
              />
              <span className="w-10 text-xs text-[#8888aa]">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex min-w-[220px] w-[30%] items-center justify-end gap-3">
            {session ? (
              <div className="rounded-full border border-[#7c3aed]/20 bg-[#7c3aed]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-purple-200">
                {session.isHost ? `Host ${session.code}` : `Jam ${session.code}`}
              </div>
            ) : null}
            <button type="button" onClick={toggleMute} className="rounded-full p-2 text-[#8888aa] transition-colors hover:text-[#e8e8f0]">
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(event) => changeVolume(Number(event.target.value))}
              className="w-24"
              style={{ background: `linear-gradient(to right,#8888aa ${(isMuted ? 0 : volume) * 100}%,#2a2a3a ${(isMuted ? 0 : volume) * 100}%)` }}
            />
            <button type="button" onClick={() => setShowModal(true)} className="rounded-full p-2 text-[#8888aa] transition-colors hover:text-[#e8e8f0]">
              <ListMusic className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setShowModal(true)} className="rounded-full p-2 text-[#8888aa] transition-colors hover:text-[#e8e8f0]">
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="fixed bottom-[72px] left-0 right-0 z-20 border-t border-white/8 bg-[#0d0d15]/96 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
        initial={{ y: 72 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl"
          >
            <img src={currentSong.thumbnail} alt={currentSong.title} className="h-full w-full object-cover" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#e8e8f0]">{currentSong.title}</p>
            <p className="truncate text-xs text-[#8888aa]">{currentSong.channelName}</p>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            disabled={controlsDisabled}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e8f0] disabled:opacity-40"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-[#080810] text-[#080810]" /> : <Play className="ml-0.5 h-4 w-4 fill-[#080810] text-[#080810]" />}
          </button>

          <button type="button" onClick={() => setShowModal(true)} className="rounded-full p-2 text-[#8888aa]">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </>
  );
}
