// src/context/LyricsContext.jsx — Lyrics via lyrics.ovh (no API key needed)
import React, { createContext, useContext, useState, useCallback } from 'react';
import { lyricsAPI } from '../services/api';

const LyricsContext = createContext(null);

export const LyricsProvider = ({ children }) => {
  const [lyrics,  setLyrics]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [lastSong, setLastSong] = useState(null);

  const fetchLyrics = useCallback(async (title, artist) => {
    if (!title || !artist) return;
    const key = `${title}-${artist}`;
    if (key === lastSong) return; // Don't refetch same song

    setLoading(true);
    setError(null);
    setLyrics(null);
    setLastSong(key);

    try {
      const response = await lyricsAPI.get({ title, artist });
      setLyrics(response.data.lyrics || null);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Lyrics not available for this song.');
    } finally {
      setLoading(false);
    }
  }, [lastSong]);

  const clearLyrics = useCallback(() => {
    setLyrics(null);
    setError(null);
    setLastSong(null);
  }, []);

  return (
    <LyricsContext.Provider value={{ lyrics, loading, error, fetchLyrics, clearLyrics }}>
      {children}
    </LyricsContext.Provider>
  );
};

export const useLyrics = () => {
  const ctx = useContext(LyricsContext);
  if (!ctx) throw new Error('useLyrics must be used inside <LyricsProvider>');
  return ctx;
};
