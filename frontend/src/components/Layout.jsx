import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Clock3, Heart, Home, Music, Radio, Search,
} from 'lucide-react';
import Sidebar from './Sidebar/Sidebar';
import MusicPlayer from './MusicPlayer/MusicPlayer';
import YouTubeHiddenPlayer from './MusicPlayer/YouTubeHiddenPlayer';
import { useAuth } from '../context/AuthContext';

const mobileNavItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/liked-songs', label: 'Likes', icon: Heart, auth: true },
  { to: '/recently-played', label: 'Recent', icon: Clock3, auth: true },
  { to: '/jam', label: 'Jam', icon: Radio },
];

function MobileTopBar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between border-b border-white/8 bg-[#111118]/95 px-4 py-4 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7]">
            <Music className="h-5 w-5 text-white" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-[#7c3aed] opacity-40 blur-lg" />
        </div>
        <div>
          <p className="text-lg font-bold text-vn-text">VN Music</p>
          <p className="text-xs text-vn-muted">Mobile listening</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
        className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-vn-text"
      >
        {isAuthenticated ? 'Profile' : 'Sign in'}
      </button>
    </div>
  );
}

function MobileBottomNav() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/8 bg-[#111118]/98 px-2 py-2 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const locked = item.auth && !isAuthenticated;
          const target = locked ? '/login' : item.to;

          return (
            <NavLink
              key={item.to}
              to={target}
              end={item.to === '/'}
              className={({ isActive }) => [
                'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
                isActive && !locked ? 'bg-[#7c3aed]/18 text-[#a855f7]' : 'text-vn-muted',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default function Layout() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#080810]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[18%] top-[-10%] h-80 w-80 rounded-full bg-[#7c3aed]/10 blur-[120px]" />
        <div className="absolute bottom-[15%] right-[10%] h-72 w-72 rounded-full bg-cyan-400/5 blur-[120px]" />
      </div>
      <YouTubeHiddenPlayer />
      <div className="relative z-10 flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileTopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto min-h-full max-w-7xl px-4 py-4 pb-[calc(11rem+env(safe-area-inset-bottom))] md:px-6 md:py-6 md:pb-32">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <div className="relative z-20">
        <MusicPlayer />
      </div>
      <MobileBottomNav />
    </div>
  );
}
