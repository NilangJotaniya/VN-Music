import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, ListPlus, Link as LinkIcon, MoreVertical, Pause, Play, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJamSession } from '../../context/JamContext';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../context/ToastContext';
import { favoritesAPI, playlistsAPI } from '../../services/api';

export default function SongCard({ song, songList = [], onFavoriteChange, onPlaySong, showIndex }) {
  const {
    currentSong, isPlaying, playSong, togglePlay, addToQueue, playNextInQueue,
  } = usePlayer();
  const { isAuthenticated } = useAuth();
  const { canControlPlayback } = useJamSession();
  const { toast } = useToast();

  const [isFav, setIsFav] = useState(song.isFavorite || false);
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [menuLoad, setMenuLoad] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const isCurrent = currentSong?.videoId === song.videoId;

  const handlePlay = (event) => {
    event.stopPropagation();
    if (!canControlPlayback) {
      return;
    }
    if (isCurrent) togglePlay();
    else if (onPlaySong) onPlaySong(song, songList);
    else playSong(song, songList);
  };

  const handleFavorite = async (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast('Please sign in to save favorites', 'info');
      return;
    }

    try {
      if (isFav) {
        await favoritesAPI.remove(song.videoId);
        setIsFav(false);
        toast('Removed from favorites');
      } else {
        await favoritesAPI.add(song);
        setIsFav(true);
        toast('Added to favorites');
      }
      onFavoriteChange?.();
    } catch (error) {
      if (error.response?.status === 409) {
        setIsFav(true);
        toast('Already in favorites', 'info');
      }
    }
  };

  const openMenu = async (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast('Please sign in first', 'info');
      return;
    }

    setShowMenu((prev) => !prev);
    if (!showMenu) {
      setMenuLoad(true);
      try {
        const response = await playlistsAPI.getAll();
        setPlaylists(response.data.playlists || []);
      } catch {
        setPlaylists([]);
      } finally {
        setMenuLoad(false);
      }
    }
  };

  const addToPlaylist = async (playlistId, playlistName) => {
    try {
      await playlistsAPI.addSong(playlistId, song);
      toast(`Added to ${playlistName}`);
      setShowMenu(false);
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to add to playlist', 'error');
    }
  };

  const getYouTubeUrl = () => (song.videoId ? `https://youtu.be/${song.videoId}` : '');

  const handleShare = async (event) => {
    event.stopPropagation();
    const url = getYouTubeUrl();
    if (!url) {
      toast('Unable to share this song', 'error');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: song.title, text: song.channelName, url });
        toast('Shared via system share sheet');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard');
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (error) {
      toast('Could not share song', 'error');
    } finally {
      setShowMenu(false);
    }
  };

  const handleAddToQueue = (event, mode = 'queue') => {
    event.stopPropagation();
    if (!canControlPlayback) return;

    if (mode === 'next') {
      playNextInQueue(song);
      toast('Will play next');
    } else {
      addToQueue(song);
      toast('Added to queue');
    }
    setShowMenu(false);
  };

  const createPlaylistAndAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!newPlaylistName.trim()) return;

    setCreatingPlaylist(true);
    try {
      const response = await playlistsAPI.create({ name: newPlaylistName.trim() });
      const playlist = response.data.playlist;
      setPlaylists((prev) => [playlist, ...prev]);
      await playlistsAPI.addSong(playlist._id, song);
      toast(`Created ${playlist.name} and added song`);
      setNewPlaylistName('');
      setShowMenu(false);
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to create playlist', 'error');
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-white/[0.04]"
      onClick={handlePlay}
    >
      {showIndex ? (
        <span className="w-5 flex-shrink-0 text-right text-xs text-vn-muted group-hover:hidden">{showIndex}</span>
      ) : null}

      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl">
        <img src={song.thumbnail || `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`} alt={song.title} className="h-full w-full object-cover" />
        <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {isCurrent && isPlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="ml-0.5 text-white" />}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium transition-colors ${isCurrent ? 'text-purple-400' : 'text-vn-text'}`}>{song.title}</p>
        <p className="truncate text-xs text-vn-muted">{song.channelName}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {isAuthenticated ? (
          <button type="button" onClick={handleFavorite} className={`rounded-lg p-1.5 transition-all ${isFav ? 'text-red-400' : 'text-vn-muted hover:text-red-400'}`}>
            <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        ) : null}

        {isAuthenticated ? (
          <div className="relative">
            <button type="button" onClick={openMenu} className="rounded-lg p-1.5 text-vn-muted transition-colors hover:text-vn-text">
              <MoreVertical size={14} />
            </button>
            <AnimatePresence>
              {showMenu ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 z-50 min-w-[240px] overflow-hidden rounded-xl py-2 shadow-2xl"
                  style={{ background: 'rgba(20,20,32,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-vn-muted">Queue actions</p>

                  <div className="px-2 pb-2 pt-1">
                    <button
                      type="button"
                      onClick={(event) => handleAddToQueue(event, 'next')}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-vn-text transition-colors hover:bg-white/5"
                    >
                      <Play size={12} />
                      Play next
                    </button>
                    <button
                      type="button"
                      onClick={(event) => handleAddToQueue(event, 'queue')}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-vn-text transition-colors hover:bg-white/5"
                    >
                      <ListPlus size={12} />
                      Add to queue
                    </button>
                  </div>

                  <p className="border-t border-white/8 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-vn-muted">Add to playlist</p>

                  <form onSubmit={createPlaylistAndAdd} className="px-3 pb-2 pt-1">
                    <div className="flex gap-2">
                      <input
                        value={newPlaylistName}
                        onChange={(event) => setNewPlaylistName(event.target.value)}
                        placeholder="Create new playlist"
                        className="w-full rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2 text-xs text-vn-text outline-none focus:border-[#7c3aed]"
                      />
                      <button
                        type="submit"
                        disabled={creatingPlaylist || !newPlaylistName.trim()}
                        className="rounded-lg border border-[#7c3aed]/30 px-2.5 text-purple-300 disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </form>

                  {menuLoad ? (
                    <p className="px-3 py-2 text-xs text-vn-muted">Loading...</p>
                  ) : playlists.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-vn-muted">No playlists yet. Create one above.</p>
                  ) : (
                    playlists.map((playlist) => (
                      <button
                        key={playlist._id}
                        type="button"
                        onClick={() => addToPlaylist(playlist._id, playlist.name)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-vn-text transition-colors hover:bg-white/5"
                      >
                        {playlist.coverImage ? (
                          <img src={playlist.coverImage} alt="" className="h-5 w-5 rounded object-cover" />
                        ) : (
                          <div className="h-5 w-5 flex-shrink-0 rounded bg-[rgba(124,58,237,0.3)]" />
                        )}
                        <span className="truncate">{playlist.name}</span>
                      </button>
                    ))
                  )}

                  <div className="border-t border-white/8 px-3 py-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-vn-text transition-colors hover:bg-white/5"
                    >
                      <LinkIcon size={12} />
                      <span>Share song</span>
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      {showMenu ? <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} /> : null}
    </motion.div>
  );
}
