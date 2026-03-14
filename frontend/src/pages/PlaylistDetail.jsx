// ============================================================
// src/pages/PlaylistDetail.jsx — Single Playlist View
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Music, Trash2 } from 'lucide-react';
import { useJamSession } from '../context/JamContext';
import { playlistsAPI } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { saveRecentPlaylist } from '../utils/recentPlaylists';

export default function PlaylistDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { playSong } = usePlayer();
  const { canControlPlayback } = useJamSession();

  const [playlist, setPlaylist] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const loadPlaylist = useCallback(async () => {
    try {
      const res = await playlistsAPI.getOne(id);
      setPlaylist(res.data.playlist);
    } catch (err) {
      setError('Playlist not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadPlaylist(); }, [loadPlaylist]);

  useEffect(() => {
    if (playlist) {
      saveRecentPlaylist(playlist);
    }
  }, [playlist]);

  const handleRemoveSong = async (videoId) => {
    try {
      const res = await playlistsAPI.removeSong(id, videoId);
      setPlaylist(res.data.playlist);
    } catch (err) {
      alert('Failed to remove song.');
    }
  };

  const playAll = () => {
    if (canControlPlayback && playlist?.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 bg-vn-elevated rounded animate-pulse w-1/3" />
      <div className="h-48 bg-vn-elevated rounded-2xl animate-pulse" />
    </div>
  );

  if (error) return (
    <div className="p-6 text-center py-20">
      <p className="text-vn-muted">{error}</p>
      <button onClick={() => navigate('/playlists')} className="text-vn-accent mt-4 text-sm">← Back to Playlists</button>
    </div>
  );

  return (
    <div className="p-6 pb-8">
      {/* Back */}
      <button
        onClick={() => navigate('/playlists')}
        className="flex items-center gap-2 text-vn-muted hover:text-vn-text text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Playlists
      </button>

      {/* Playlist header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end gap-5 mb-8"
      >
        {/* Cover */}
        <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl">
          {playlist.coverImage ? (
            <img src={playlist.coverImage} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-vn-accent/40 to-vn-accent/10">
              <Music size={36} className="text-vn-accent opacity-70" />
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-vn-muted uppercase tracking-widest mb-1">Playlist</p>
          <h1 className="text-[1.75rem] font-bold tracking-[-0.025em] text-vn-text mb-1">{playlist.name}</h1>
          <p className="text-vn-muted text-sm">{playlist.songs?.length || 0} songs</p>

          {playlist.songs?.length > 0 && (
            <button
              onClick={playAll}
              className="mt-3 flex items-center gap-2 bg-vn-accent text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-vn-accent-light transition-colors"
              style={{ boxShadow: '0 4px 15px #7c3aed44' }}
            >
              <Play size={14} fill="white" /> Play All
            </button>
          )}
        </div>
      </motion.div>

      {/* Songs */}
      {playlist.songs?.length === 0 ? (
        <div className="text-center py-16">
          <Music size={48} className="text-vn-muted mx-auto mb-3 opacity-30" />
          <p className="text-vn-muted">No songs yet. Search for music and add them here!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {playlist.songs.map((song, idx) => (
            <motion.div
              key={song.videoId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-vn-elevated transition-all cursor-pointer"
              onClick={() => canControlPlayback && playSong(song, playlist.songs.slice(idx))}
            >
              <span className="text-xs text-vn-muted w-5 text-right flex-shrink-0">{idx + 1}</span>
              <img
                src={song.thumbnail || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
                alt={song.title}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-vn-text truncate">{song.title}</p>
                <p className="text-xs text-vn-muted truncate">{song.channelName}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.videoId); }}
                className="p-1.5 rounded-lg text-vn-muted hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
