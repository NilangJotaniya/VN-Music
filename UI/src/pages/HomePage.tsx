import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SongCard } from '../components/SongCard';
import { useMusicStore } from '../store/musicStore';

export function HomePage() {
  const { songs, setSongs, recentlyPlayed, setRecentlyPlayed } = useMusicStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    fetch('/api/songs?limit=50')
      .then(res => res.json())
      .then(data => setSongs(data));
    
    fetch('/api/recently-played')
      .then(res => res.json())
      .then(data => setRecentlyPlayed(data.map((item: any) => item.songs)));
  }, [setSongs, setRecentlyPlayed]);

  const trendingSongs = songs.slice().sort((a, b) => b.play_count - a.play_count).slice(0, 8);
  const newReleases = songs.slice(0, 8);
  const continueListening = recentlyPlayed.slice(0, 6);

  return (
    <div className="min-h-full pb-24">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 
          className="text-4xl md:text-5xl font-bold text-[#e8e8f0] mb-2"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {greeting}, Alex
        </h1>
        <p className="text-[#8888aa]">Ready to discover your next favorite track?</p>
      </motion.div>

      {/* Featured Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden mb-10 group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#7c3aed] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080810]/80 to-transparent" />
        
        <div className="relative p-8 md:p-12 flex items-center gap-8">
          <motion.div 
            className="w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
            whileHover={{ scale: 1.02 }}
          >
            <img 
              src={trendingSongs[0]?.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400'} 
              alt="Featured"
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="flex-1">
            <span className="text-sm font-semibold text-[#a855f7] uppercase tracking-wider">Trending Now</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#e8e8f0] mt-2 mb-3">
              {trendingSongs[0]?.title || 'Midnight Dreams'}
            </h2>
            <p className="text-[#8888aa] text-lg mb-6">
              {trendingSongs[0]?.artist || 'Luna Eclipse'} • The album that defined a generation
            </p>
            <motion.button
              className="px-8 py-3 bg-[#7c3aed] hover:bg-[#a855f7] text-white font-semibold rounded-full transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Now
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Continue Listening */}
      {continueListening.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#e8e8f0]">Continue Listening</h2>
            <button className="text-sm text-[#8888aa] hover:text-[#a855f7] transition-colors">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {continueListening.map((song, index) => (
              <SongCard key={song.id} song={song} variant="compact" index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#e8e8f0]">Trending Now</h2>
          <button className="text-sm text-[#8888aa] hover:text-[#a855f7] transition-colors">See all</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {trendingSongs.slice(0, 8).map((song, index) => (
            <SongCard key={song.id} song={song} index={index} />
          ))}
        </div>
      </section>

      {/* Recently Played */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#e8e8f0]">Recently Played</h2>
          <button className="text-sm text-[#8888aa] hover:text-[#a855f7] transition-colors">See all</button>
        </div>
        <div className="space-y-1">
          {newReleases.slice(0, 6).map((song, index) => (
            <SongCard key={song.id} song={song} variant="row" index={index} />
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#e8e8f0]">New Releases</h2>
          <button className="text-sm text-[#8888aa] hover:text-[#a855f7] transition-colors">See all</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {newReleases.slice(0, 8).map((song, index) => (
            <SongCard key={song.id} song={song} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
