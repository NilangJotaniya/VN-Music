import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CircleUserRound, Clock3, Disc3, Heart, Home, Library, LogIn, LogOut, Music, PlusSquare, Radio, Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { playlistsAPI, userAPI } from '../../services/api';
import { getRecentPlaylists } from '../../utils/recentPlaylists';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/liked-songs', label: 'Liked Songs', icon: Heart, auth: true },
  { to: '/recently-played', label: 'Recent', icon: Clock3, auth: true },
  { to: '/playlists', label: 'Playlists', icon: Library, auth: true },
];

export default function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { playSong } = usePlayer();
  const location = useLocation();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [recentPlaylists, setRecentPlaylists] = useState([]);

  const libraryItems = [
    ...recentSongs.map((song) => ({
      key: `song-${song.videoId}`,
      title: song.title,
      subtitle: song.channelName,
      image: song.thumbnail,
      kind: 'Song',
      onClick: () => playSong(song, recentSongs),
    })),
    ...recentPlaylists.map((playlist) => ({
      key: `playlist-${playlist._id}`,
      title: playlist.name,
      subtitle: `${playlist.songsCount} songs`,
      image: playlist.coverImage,
      kind: 'Playlist',
      onClick: () => navigate(`/playlists/${playlist._id}`),
    })),
  ].slice(0, 6);

  useEffect(() => {
    if (!isAuthenticated) {
      setPlaylists([]);
      setRecentSongs([]);
      setRecentPlaylists([]);
      return;
    }

    playlistsAPI.getAll()
      .then((response) => setPlaylists(response.data.playlists || []))
      .catch(() => setPlaylists([]));

    userAPI.getRecentlyPlayed()
      .then((response) => setRecentSongs(response.data.recentlyPlayed?.slice(0, 4) || []))
      .catch(() => setRecentSongs([]));

    setRecentPlaylists(getRecentPlaylists());
  }, [isAuthenticated, location.pathname]);

  return (
    <aside className="hidden h-full w-72 flex-col border-r border-[#2a2a3a] bg-[#111118] lg:flex">
      <div className="p-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7]">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-[#7c3aed] opacity-50 blur-lg" />
          </div>
          <span className="text-xl font-bold text-[#e8e8f0]">VN Music</span>
        </motion.div>
      </div>

      <nav className="px-3 pb-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const locked = item.auth && !isAuthenticated;

          return (
            <motion.div key={item.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <NavLink
                to={locked ? '/login' : item.to}
                end={item.to === '/'}
                className={({ isActive }) => `group relative mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive && !locked
                    ? 'bg-[#7c3aed]/20 text-[#a855f7]'
                    : 'text-[#8888aa] hover:bg-[#1a1a24] hover:text-[#e8e8f0]'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 ${isActive && !locked ? 'text-[#a855f7]' : 'group-hover:text-[#e8e8f0]'}`} />
                    <span>{item.label}</span>
                    {isActive && !locked ? (
                      <motion.div layoutId="activeIndicator" className="absolute left-0 h-6 w-1 rounded-r-full bg-gradient-to-b from-[#7c3aed] to-[#a855f7]" />
                    ) : null}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}

        <NavLink to="/jam" className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#8888aa] transition-all duration-200 hover:bg-[#1a1a24] hover:text-[#e8e8f0]">
          <Radio className="h-5 w-5" />
          <span>Jam Session</span>
        </NavLink>
      </nav>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[#2a2a3a] to-transparent" />

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8888aa]">Your Library</span>
          <button type="button" onClick={() => navigate('/playlists')} className="rounded-lg p-1.5 text-[#8888aa] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8f0]">
            <PlusSquare className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin h-[calc(100%-60px)] overflow-y-auto px-3 pb-4">
          {libraryItems.length ? (
            <div className="space-y-2">
              {libraryItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-left transition-all duration-200 hover:bg-[#1a1a24]"
                >
                  <div className="h-11 w-11 overflow-hidden rounded-xl bg-gradient-to-br from-[#2a2a3a] to-[#1a1a24]">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#8888aa]">
                        {item.kind === 'Playlist' ? <Library className="h-4 w-4" /> : <Disc3 className="h-4 w-4" />}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#e8e8f0]">{item.title}</p>
                    <p className="truncate text-xs text-[#8888aa]">{item.subtitle}</p>
                  </div>
                  <span className="rounded-full border border-white/8 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#8888aa]">
                    {item.kind}
                  </span>
                </button>
              ))}
            </div>
          ) : playlists.length ? (
            <div className="space-y-2">
              {playlists.slice(0, 5).map((playlist) => (
                <button
                  key={playlist._id}
                  type="button"
                  onClick={() => navigate(`/playlists/${playlist._id}`)}
                  className="flex w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-left transition-all duration-200 hover:bg-[#1a1a24]"
                >
                  <div className="h-11 w-11 overflow-hidden rounded-xl bg-gradient-to-br from-[#2a2a3a] to-[#1a1a24]">
                    {playlist.coverImage ? (
                      <img src={playlist.coverImage} alt={playlist.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#8888aa]">
                        <Library className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#e8e8f0]">{playlist.name}</p>
                    <p className="truncate text-xs text-[#8888aa]">{playlist.songs?.length || 0} songs</p>
                  </div>
                  <span className="rounded-full border border-white/8 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#8888aa]">
                    Playlist
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[20px] border border-dashed border-white/8 px-4 py-5 text-xs leading-6 text-[#8888aa]">
              Recently played songs and opened playlists will appear here.
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#2a2a3a] p-4">
        {isAuthenticated ? (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group flex items-center gap-3 rounded-xl bg-[#1a1a24] p-3 transition-colors hover:bg-[#222230]">
            <button type="button" onClick={() => navigate('/profile')} className="flex flex-1 items-center gap-3 text-left">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-white/12 bg-white/[0.03] text-vn-muted">
                  <CircleUserRound className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-[#e8e8f0]">{user?.name}</p>
                <p className="text-xs text-[#8888aa]">{user?.avatarUrl ? 'Profile photo set' : 'No profile photo'}</p>
              </div>
            </button>
            <button type="button" onClick={() => navigate('/profile')} className="text-xs text-[#8888aa] transition-colors hover:text-[#e8e8f0]">
              Edit
            </button>
            <button type="button" onClick={() => { logout(); navigate('/login'); }} className="text-[#8888aa] transition-colors group-hover:text-[#e8e8f0]">
              <LogOut className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <NavLink to="/login" className="flex items-center gap-3 rounded-xl bg-[#1a1a24] px-3 py-3 text-sm text-[#8888aa] transition-colors hover:bg-[#222230] hover:text-[#e8e8f0]">
            <LogIn className="h-4 w-4" />
            <span>Sign in</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
}
