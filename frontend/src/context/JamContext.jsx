import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { jamAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { usePlayer } from './PlayerContext';
import { useToast } from './ToastContext';

const JamContext = createContext(null);
const STORAGE_KEY = 'vn_jam_member';
const SYNC_AHEAD_BUFFER_MS = 650;

const getDisplayName = (user) => user?.name || `Guest ${Math.floor(100 + Math.random() * 900)}`;

export const JamProvider = ({ children }) => {
  const { user } = useAuth();
  const {
    currentSong, queue, isPlaying, currentTime, syncPlaybackState,
  } = usePlayer();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentTimeRef = useRef(currentTime);
  const syncKeyRef = useRef('');
  const socketRef = useRef(null);
  const sessionRef = useRef(null);
  const memberIdRef = useRef(null);
  const isLeavingRef = useRef(false);
  const lastDisconnectToastRef = useRef(0);
  const lastPlaybackSyncRef = useRef('');
  const serverOffsetRef = useRef(0);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    memberIdRef.current = memberId;
  }, [memberId]);

  const persistMember = useCallback((code, nextMemberId) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    stored[code] = nextMemberId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, []);

  const clearMember = useCallback((code) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete stored[code];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, []);

  const normalizeSession = useCallback((nextSession, nextMemberId) => ({
    ...nextSession,
    memberId: nextMemberId,
  }), []);

  const subscribeSocket = useCallback((code, nextMemberId) => {
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit('jam:subscribe', { code, memberId: nextMemberId });
  }, []);

  const unsubscribeSocket = useCallback(() => {
    socketRef.current?.emit('jam:unsubscribe');
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const handleSession = ({ session: nextSession }) => {
      if (Number.isFinite(nextSession?.serverTime)) {
        serverOffsetRef.current = nextSession.serverTime - Date.now();
      }
      const nextMemberId = memberIdRef.current || nextSession.memberId || null;
      setSession(normalizeSession(nextSession, nextMemberId));
    };

    const handleError = ({ message }) => {
      if (isLeavingRef.current) return;
      if (message?.includes('You are no longer part of this jam session')) {
        clearMember(sessionRef.current?.code || '');
        unsubscribeSocket();
        setSession(null);
        setMemberId(null);
      }
      if (message) toast(message, 'error');
    };

    const handleConnect = () => {
      const activeSession = sessionRef.current;
      const activeMemberId = memberIdRef.current;
      if (activeSession?.code && activeMemberId) {
        socket.emit('jam:subscribe', { code: activeSession.code, memberId: activeMemberId });
      }
    };

    const handleDisconnect = () => {
      if (!sessionRef.current?.code || isLeavingRef.current) return;
      const now = Date.now();
      if (now - lastDisconnectToastRef.current > 4000) {
        lastDisconnectToastRef.current = now;
        toast('Jam connection lost. Reconnecting…', 'info', 2200);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('jam:session', handleSession);
    socket.on('jam:error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('jam:session', handleSession);
      socket.off('jam:error', handleError);
    };
  }, [clearMember, normalizeSession, toast, unsubscribeSocket]);

  const createSession = useCallback(async () => {
    setLoading(true);
    isLeavingRef.current = false;
    try {
      const response = await jamAPI.create({
        displayName: getDisplayName(user),
        playback: {
          song: currentSong,
          queue,
          isPlaying,
          currentTime: currentTimeRef.current,
        },
      });

      const nextMemberId = response.data.memberId;
      const nextSession = normalizeSession(response.data.session, nextMemberId);
      persistMember(nextSession.code, nextMemberId);
      setMemberId(nextMemberId);
      setSession(nextSession);
      subscribeSocket(nextSession.code, nextMemberId);
      toast(`Jam session ${nextSession.code} is live`);
      return nextSession;
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to create jam session.', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentSong, isPlaying, normalizeSession, persistMember, queue, subscribeSocket, toast, user]);

  const joinSession = useCallback(async (code) => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return null;

    setLoading(true);
    isLeavingRef.current = false;
    try {
      const response = await jamAPI.join(trimmedCode, { displayName: getDisplayName(user) });
      const nextMemberId = response.data.memberId;
      const nextSession = normalizeSession(response.data.session, nextMemberId);
      persistMember(nextSession.code, nextMemberId);
      setMemberId(nextMemberId);
      setSession(nextSession);
      subscribeSocket(nextSession.code, nextMemberId);
      toast(`Joined jam ${nextSession.code}`);
      return nextSession;
    } catch (error) {
      toast(error.response?.data?.message || 'Unable to join jam session.', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [normalizeSession, persistMember, subscribeSocket, toast, user]);

  const leaveSession = useCallback(async () => {
    if (!session?.code || !memberId) {
      unsubscribeSocket();
      setSession(null);
      setMemberId(null);
      return;
    }

    const code = session.code;
    isLeavingRef.current = true;
    unsubscribeSocket();
    try {
      await jamAPI.leave(code, { memberId });
    } catch {}

    clearMember(code);
    setSession(null);
    setMemberId(null);
    syncKeyRef.current = '';
    lastPlaybackSyncRef.current = '';
  }, [clearMember, memberId, session, unsubscribeSocket]);

  const refreshSession = useCallback(async ({ silent = false } = {}) => {
    if (!session?.code || !memberId) return;

    try {
      const response = await jamAPI.get(session.code, memberId);
      const nextSession = normalizeSession(response.data.session, memberId);
      if (Number.isFinite(response.data.session?.serverTime)) {
        serverOffsetRef.current = response.data.session.serverTime - Date.now();
      }
      setSession(nextSession);
    } catch (error) {
      if (isLeavingRef.current) return;
      if (!silent) {
        toast(error.response?.data?.message || 'Jam session disconnected.', 'error');
      }
      clearMember(session.code);
      unsubscribeSocket();
      setSession(null);
      setMemberId(null);
    }
  }, [clearMember, memberId, normalizeSession, session, toast, unsubscribeSocket]);

  const emitSocket = useCallback((event, payload) => {
    if (!session?.code || !memberId) return;
    socketRef.current?.emit(event, {
      code: session.code,
      memberId,
      ...payload,
    });
  }, [memberId, session?.code]);

  const syncHostPlayback = useCallback((overrideTime) => {
    if (!session?.code || !memberId || !session.isHost) return;

    emitSocket('jam:sync', {
      playback: {
        song: currentSong,
        queue,
        isPlaying,
        currentTime: typeof overrideTime === 'number' ? overrideTime : currentTimeRef.current,
      },
    });
  }, [currentSong, emitSocket, isPlaying, memberId, queue, session?.code, session?.isHost]);

  useEffect(() => {
    if (!session?.code || !session.isHost) return;

    const nextKey = JSON.stringify({
      videoId: currentSong?.videoId || null,
      queue: queue.map((song) => song.videoId),
      isPlaying,
    });

    if (nextKey !== syncKeyRef.current) {
      syncKeyRef.current = nextKey;
      syncHostPlayback();
    }
  }, [currentSong, isPlaying, queue, session?.code, session?.isHost, syncHostPlayback]);

  useEffect(() => {
    if (!session?.code || !session.isHost || !currentSong) return undefined;
    const interval = setInterval(() => {
      syncHostPlayback(currentTimeRef.current);
    }, 500);
    return () => clearInterval(interval);
  }, [currentSong, session?.code, session?.isHost, syncHostPlayback]);

  useEffect(() => {
    if (!session?.code || !memberId) return undefined;
    const interval = setInterval(() => {
      refreshSession({ silent: true });
    }, 1000);
    return () => clearInterval(interval);
  }, [memberId, refreshSession, session?.code]);

  useEffect(() => {
    if (!session?.code || !memberId) return undefined;

    const handleResumeSync = () => {
      if (document.visibilityState === 'visible') {
        refreshSession({ silent: true });
        if (sessionRef.current?.isHost) {
          syncHostPlayback(currentTimeRef.current);
        }
      }
    };

    window.addEventListener('focus', handleResumeSync);
    document.addEventListener('visibilitychange', handleResumeSync);

    return () => {
      window.removeEventListener('focus', handleResumeSync);
      document.removeEventListener('visibilitychange', handleResumeSync);
    };
  }, [memberId, refreshSession, session?.code, syncHostPlayback]);

  useEffect(() => {
    if (!session?.playback || session.isHost) return;

    const estimatedServerNow = Date.now() + serverOffsetRef.current;
    const playbackUpdatedAt = Number.isFinite(session.playback.updatedAt) ? session.playback.updatedAt : null;
    const elapsedSinceUpdateMs = playbackUpdatedAt
      ? Math.max(0, estimatedServerNow - playbackUpdatedAt)
      : 0;
    const adjustedCurrentTime = session.playback.isPlaying
      ? session.playback.currentTime + ((elapsedSinceUpdateMs + SYNC_AHEAD_BUFFER_MS) / 1000)
      : session.playback.currentTime;

    const nextPlaybackKey = JSON.stringify({
      videoId: session.playback.song?.videoId || null,
      queue: (session.playback.queue || []).map((song) => song.videoId),
      isPlaying: session.playback.isPlaying,
      currentTime: Math.round((adjustedCurrentTime || 0) * 10) / 10,
    });

    if (nextPlaybackKey === lastPlaybackSyncRef.current) return;
    lastPlaybackSyncRef.current = nextPlaybackKey;

    syncPlaybackState({
      song: session.playback.song,
      queue: session.playback.queue,
      isPlaying: session.playback.isPlaying,
      currentTime: adjustedCurrentTime,
    });
  }, [session, syncPlaybackState]);

  useEffect(() => () => {
    if (session?.code && memberId) {
      unsubscribeSocket();
      jamAPI.leave(session.code, { memberId }).catch(() => {});
    }
  }, [memberId, session?.code, unsubscribeSocket]);

  const inviteLink = useMemo(
    () => (session?.code ? `${window.location.origin}/jam?code=${session.code}` : ''),
    [session?.code]
  );

  return (
    <JamContext.Provider value={{
      session,
      memberId,
      loading,
      inviteLink,
      createSession,
      joinSession,
      leaveSession,
      refreshSession,
      sendMessage: (message) => emitSocket('jam:chat', { message }),
      sendReaction: (emoji) => emitSocket('jam:reaction', { emoji }),
      toggleVote: (videoId) => emitSocket('jam:vote', { videoId }),
      transferHost: (targetMemberId) => emitSocket('jam:transfer-host', { targetMemberId }),
      toggleModerator: (targetMemberId) => emitSocket('jam:toggle-moderator', { targetMemberId }),
      canControlPlayback: !session || session.isHost,
    }}
    >
      {children}
    </JamContext.Provider>
  );
};

export const useJamSession = () => {
  const context = useContext(JamContext);
  if (!context) throw new Error('useJamSession must be used inside <JamProvider>');
  return context;
};
