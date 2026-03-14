import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import MusicPlayer from './MusicPlayer/MusicPlayer';
import YouTubeHiddenPlayer from './MusicPlayer/YouTubeHiddenPlayer';

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
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto min-h-full max-w-7xl px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <div className="relative z-10">
        <MusicPlayer />
      </div>
    </div>
  );
}
