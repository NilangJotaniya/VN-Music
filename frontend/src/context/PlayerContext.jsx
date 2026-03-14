import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');

  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const pendingSyncRef = useRef(null);

  const applyPlaybackState = useCallback((state) => {
    if (!playerRef.current) {
      pendingSyncRef.current = state;
      return;
    }

    const nextTime = Number.isFinite(state.currentTime) ? state.currentTime : 0;
    const liveTime = playerRef.current.getCurrentTime?.() || 0;
    const driftLimit = state.isPlaying ? 0.2 : 0.08;

    if (Math.abs(liveTime - nextTime) > driftLimit) {
      playerRef.current.seekTo?.(nextTime, true);
      setCurrentTime(nextTime);
    }

    if (state.isPlaying) {
      playerRef.current.playVideo?.();
      setIsPlaying(true);
    } else {
      playerRef.current.pauseVideo?.();
      setIsPlaying(false);
    }
  }, []);

  const playSong = useCallback(async (song, songList = [], options = {}) => {
    setCurrentSong(song);
    setIsPlaying(options.autoPlay !== false);
    setCurrentTime(options.startTime || 0);
    setDuration(0);
    pendingSyncRef.current = null;

    if (Array.isArray(options.queueOverride)) {
      setQueue(options.queueOverride);
    } else if (songList.length > 0) {
      const index = songList.findIndex((entry) => entry.videoId === song.videoId);
      setQueue(index >= 0 ? songList.slice(index + 1) : songList);
    } else {
      setQueue([]);
    }

    if (options.trackRecentlyPlayed !== false && isAuthenticated) {
      userAPI.addRecentlyPlayed({
        videoId: song.videoId,
        title: song.title,
        thumbnail: song.thumbnail,
        channelName: song.channelName,
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const syncPlaybackState = useCallback((state) => {
    if (!state?.song) return;

    if (currentSong?.videoId !== state.song.videoId) {
      pendingSyncRef.current = state;
      playerRef.current = null;
      setCurrentSong(state.song);
      setQueue(Array.isArray(state.queue) ? state.queue : []);
      setCurrentTime(Number.isFinite(state.currentTime) ? state.currentTime : 0);
      setDuration(0);
      setIsPlaying(Boolean(state.isPlaying));
      return;
    }

    if (Array.isArray(state.queue)) {
      setQueue(state.queue);
    }

    applyPlaybackState(state);
  }, [applyPlaybackState, currentSong?.videoId]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;

    if (isPlaying) {
      playerRef.current?.pauseVideo?.();
    } else {
      playerRef.current?.playVideo?.();
    }

    setIsPlaying((prev) => !prev);
  }, [currentSong, isPlaying]);

  const playNext = useCallback(() => {
    if (!queue.length) return;
    const [next, ...remaining] = queue;
    setQueue(remaining);
    playSong(next, remaining, { queueOverride: remaining });
  }, [playSong, queue]);

  const addToQueue = useCallback((song) => {
    if (!song?.videoId) return;
    setQueue((prev) => [...prev, song]);
  }, []);

  const playNextInQueue = useCallback((song) => {
    if (!song?.videoId) return;
    setQueue((prev) => [song, ...prev]);
  }, []);

  const removeFromQueue = useCallback((videoId, index = null) => {
    setQueue((prev) => prev.filter((song, songIndex) => {
      if (index !== null) return songIndex !== index;
      return song.videoId !== videoId;
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playPrev = useCallback(() => {
    if (currentTime > 3 && playerRef.current) {
      playerRef.current.seekTo(0);
      setCurrentTime(0);
    }
  }, [currentTime]);

  const seek = useCallback((seconds) => {
    playerRef.current?.seekTo?.(seconds, true);
    setCurrentTime(seconds);
  }, []);

  const changeVolume = useCallback((value) => {
    setVolume(value);
    setIsMuted(value === 0);
    if (playerRef.current) {
      playerRef.current.setVolume(value * 100);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (playerRef.current) {
        if (next) playerRef.current.mute();
        else playerRef.current.unMute();
      }
      return next;
    });
  }, []);

  const startProgressTracking = useCallback(() => {
    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime() || 0);
        setDuration(playerRef.current.getDuration() || 0);
      }
    }, 250);
  }, []);

  const stopProgressTracking = useCallback(() => {
    clearInterval(progressIntervalRef.current);
  }, []);

  const onPlayerReady = useCallback((event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume * 100);

    if (pendingSyncRef.current) {
      applyPlaybackState(pendingSyncRef.current);
      pendingSyncRef.current = null;
    }
  }, [applyPlaybackState, volume]);

  const onPlayerStateChange = useCallback((event) => {
    const playerState = window.YT?.PlayerState;
    if (!playerState) return;

    switch (event.data) {
      case playerState.PLAYING:
        setIsPlaying(true);
        startProgressTracking();
        break;
      case playerState.PAUSED:
        setIsPlaying(false);
        stopProgressTracking();
        break;
      case playerState.ENDED:
        stopProgressTracking();
        if (repeatMode === 'one') {
          playerRef.current?.playVideo?.();
        } else {
          playNext();
        }
        break;
      default:
        break;
    }
  }, [playNext, repeatMode, startProgressTracking, stopProgressTracking]);

  useEffect(() => () => clearInterval(progressIntervalRef.current), []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong,
      queue,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffled,
      repeatMode,
      playSong,
      togglePlay,
      playNext,
      playPrev,
      addToQueue,
      playNextInQueue,
      removeFromQueue,
      clearQueue,
      seek,
      changeVolume,
      toggleMute,
      cycleRepeat,
      syncPlaybackState,
      setIsShuffled,
      onPlayerReady,
      onPlayerStateChange,
      playerRef,
    }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return context;
};
