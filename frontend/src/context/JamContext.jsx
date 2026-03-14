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

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

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

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const handleSession = ({ session: nextSession }) => {
      setSession((prev) => normalizeSession(nextSession, prev?.memberId || memberId || nextSession.memberId || null));
    };

    const handleError = ({ message }) => {
      if (message) toast(message, 'error');
    };

    socket.on('jam:session', handleSession);
    socket.on('jam:error', handleError);

    return () => {
      socket.off('jam:session', handleSession);
      socket.off('jam:error', handleError);
    };
  }, [memberId, normalizeSession, toast]);

  const createSession = useCallback(async () => {
    setLoading(true);
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
      setSession(null);
      setMemberId(null);
      return;
    }

    const code = session.code;
    try {
      await jamAPI.leave(code, { memberId });
    } catch {}

    clearMember(code);
    setSession(null);
    setMemberId(null);
    syncKeyRef.current = '';
  }, [clearMember, memberId, session]);

  const refreshSession = useCallback(async () => {
    if (!session?.code || !memberId) return;

    try {
      const response = await jamAPI.get(session.code, memberId);
      const nextSession = normalizeSession(response.data.session, memberId);
      setSession(nextSession);
      subscribeSocket(nextSession.code, memberId);
    } catch (error) {
      toast(error.response?.data?.message || 'Jam session disconnected.', 'error');
      clearMember(session.code);
      setSession(null);
      setMemberId(null);
    }
  }, [clearMember, memberId, normalizeSession, session, subscribeSocket, toast]);

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
    if (!session?.code) return;
    refreshSession();
  }, [refreshSession, session?.code]);

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
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSong, session?.code, session?.isHost, syncHostPlayback]);

  useEffect(() => {
    if (!session?.playback || session.isHost) return;

    syncPlaybackState({
      song: session.playback.song,
      queue: session.playback.queue,
      isPlaying: session.playback.isPlaying,
      currentTime: session.playback.currentTime,
    });
  }, [session, syncPlaybackState]);

  useEffect(() => () => {
    if (session?.code && memberId) {
      jamAPI.leave(session.code, { memberId }).catch(() => {});
    }
  }, [memberId, session?.code]);

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
