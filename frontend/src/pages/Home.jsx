import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock3, Heart, MoreHorizontal, Play, Radio, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJamSession } from '../context/JamContext';
import { usePlayer } from '../context/PlayerContext';
import { userAPI, youtubeAPI } from '../services/api';

function formatDuration(value) {
  if (!value) return '--:--';
  return value;
}

function SectionHeader({ title, href = '/search' }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-[1.45rem] font-bold tracking-[-0.025em] text-vn-text">{title}</h2>
      <Link to={href} className="text-sm text-vn-muted transition hover:text-vn-text">
        See all
      </Link>
    </div>
  );
}

function MediaCard({
  song, songList, size = 'large', priority = false,
}) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const { canControlPlayback } = useJamSession();
  const isActive = currentSong?.videoId === song.videoId;
  const large = size === 'large';

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => canControlPlayback && playSong(song, songList)}
      className={`group overflow-hidden rounded-[26px] bg-[#181824] text-left shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition ${
        large ? 'min-h-[330px]' : 'min-h-[310px]'
      }`}
    >
      <div className={`relative overflow-hidden ${large ? 'h-[250px]' : 'h-[220px]'}`}>
        <img
          src={song.thumbnail}
          alt={song.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181824] via-transparent to-transparent" />
        <div className={`absolute inset-0 flex items-center justify-center transition ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7c3aed]/95 shadow-[0_16px_40px_rgba(124,58,237,0.35)]">
            {isActive && isPlaying ? (
              <div className="flex h-6 items-end gap-1">
                <span className="eq-bar" style={{ height: '8px' }} />
                <span className="eq-bar" style={{ height: '16px' }} />
                <span className="eq-bar" style={{ height: '10px' }} />
              </div>
            ) : (
              <Play size={22} fill="currentColor" className="ml-1 text-white" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <p className="line-clamp-1 text-[1.05rem] font-bold tracking-[-0.03em] text-vn-text">{song.title}</p>
          <p className="mt-1 line-clamp-1 text-sm text-vn-muted">{song.channelName}</p>
        </div>

        <div className="flex items-center justify-between text-vn-muted">
          <span className="text-sm">{formatDuration(song.duration)}</span>
          <div className="flex items-center gap-3">
            <Heart size={18} />
            <MoreHorizontal size={18} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function RecentRow({ song, songList }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const { canControlPlayback } = useJamSession();
  const isActive = currentSong?.videoId === song.videoId;

  return (
    <motion.button
      type="button"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.992 }}
      onClick={() => canControlPlayback && playSong(song, songList)}
      className={`grid w-full grid-cols-[64px,minmax(0,1fr),72px,32px,32px] items-center gap-5 rounded-[22px] px-4 py-3 text-left transition ${
        isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
      }`}
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
        <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" />
        {isActive ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            {isPlaying ? (
              <div className="flex h-5 items-end gap-0.5">
                <span className="eq-bar" style={{ height: '7px' }} />
                <span className="eq-bar" style={{ height: '13px' }} />
                <span className="eq-bar" style={{ height: '8px' }} />
              </div>
            ) : (
              <Play size={16} fill="currentColor" className="ml-0.5 text-white" />
            )}
          </div>
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[1rem] font-semibold tracking-[-0.02em] text-vn-text">{song.title}</p>
        <p className="truncate text-sm text-vn-muted">{song.channelName}</p>
      </div>

      <span className="justify-self-end text-sm text-vn-muted">{formatDuration(song.duration)}</span>
      <Heart size={18} className="justify-self-end text-vn-muted" />
      <MoreHorizontal size={18} className="justify-self-end text-vn-muted" />
    </motion.button>
  );
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { session, canControlPlayback } = useJamSession();
  const { playSong } = usePlayer();
  const [trending, setTrending] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [trendingResponse, recentResponse] = await Promise.all([
          youtubeAPI.trending(),
          isAuthenticated ? userAPI.getRecentlyPlayed() : Promise.resolve({ data: { recentlyPlayed: [] } }),
        ]);

        setTrending(trendingResponse.data.songs || []);
        setRecentlyPlayed(recentResponse.data.recentlyPlayed || []);
      } catch {
        setTrending([]);
        setRecentlyPlayed([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.name?.trim()?.split(' ')[0] || 'there';
  const featured = trending[0];
  const trendingNow = trending.slice(0, 4);
  const recentRows = (recentlyPlayed.length ? recentlyPlayed : trending.slice(0, 6)).slice(0, 6);
  const newReleases = trending.slice(4, 12);

  return (
    <div className="min-h-full pb-28">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-[1.5rem] font-bold tracking-[-0.03em] text-vn-text md:text-[2.3rem]">
          {greeting}
          , {firstName}
        </h1>
        <p className="mt-2 text-[13px] text-vn-muted">
          Ready to discover your next favorite track?
        </p>
      </motion.section>

      {featured ? (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="relative mb-12 overflow-hidden rounded-[32px] bg-[linear-gradient(90deg,#0f0a24_0%,#1d1033_58%,#2c1550_100%)] p-5 md:p-6"
        >
          <div className="pointer-events-none absolute inset-y-0 left-1/3 w-64 bg-[#7c3aed]/20 blur-[120px]" />
          <div className="grid gap-5 lg:grid-cols-[180px,minmax(0,1fr)] lg:items-center">
            <div className="relative h-[180px] w-[180px] overflow-hidden rounded-[22px] bg-white/5 shadow-[0_22px_55px_rgba(0,0,0,0.28)]">
              <img src={featured.thumbnail} alt={featured.title} className="h-full w-full object-cover" />
            </div>

            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b95cff]">Trending now</p>
              <h2 className="mt-2.5 max-w-[760px] text-[1.18rem] font-semibold leading-[1.08] tracking-[-0.02em] text-vn-text md:text-[1.85rem]">
                {featured.title}
              </h2>
              <p className="mt-2.5 text-sm text-vn-muted">
                {featured.channelName}
                {session ? ' • Jam session live' : ''}
              </p>
              <button
                type="button"
                onClick={() => canControlPlayback && playSong(featured, trending)}
                className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(124,58,237,0.36)] transition hover:bg-[#8b46ff]"
              >
                <Play size={16} fill="currentColor" />
                Play Now
              </button>
            </div>
          </div>
        </motion.section>
      ) : null}

      <section className="mb-14">
        <SectionHeader title="Trending Now" />

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[26px] bg-[#181824] p-4">
                <div className="skeleton h-[220px] rounded-[22px]" />
                <div className="mt-4 space-y-3">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {trendingNow.map((song, index) => (
              <MediaCard
                key={song.videoId}
                song={song}
                songList={trending}
                size="large"
                priority={index < 2}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-14">
        <SectionHeader title="Recently Played" />

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 rounded-[22px] px-4 py-3">
                <div className="skeleton h-14 w-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
                <div className="skeleton h-4 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {recentRows.map((song) => (
              <RecentRow key={`recent-${song.videoId}`} song={song} songList={recentRows} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="New Releases" />

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[26px] bg-[#181824] p-4">
                <div className="skeleton h-[220px] rounded-[22px]" />
                <div className="mt-4 space-y-3">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : newReleases.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {newReleases.map((song, index) => (
              <MediaCard
                key={`new-${song.videoId}`}
                song={song}
                songList={trending}
                size={index < 4 ? 'large' : 'small'}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/8 bg-white/[0.02] px-6 py-10 text-vn-muted">
            No new releases are available right now. Search for a genre to keep listening.
          </div>
        )}
      </section>

      {!loading && !trending.length ? (
        <div className="mt-10 rounded-[28px] border border-white/8 bg-white/[0.02] px-6 py-10 text-center">
          <Sparkles className="mx-auto mb-3 text-vn-muted" size={28} />
          <p className="text-lg font-semibold text-vn-text">No songs loaded</p>
          <p className="mt-2 text-sm text-vn-muted">
            Your backend did not return trending songs. Check the YouTube API route and try again.
          </p>
        </div>
      ) : null}

      {!loading && session ? (
        <div className="mt-10 flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4 text-sm text-vn-muted">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7c3aed]/15 text-[#c084fc]">
            <Radio size={18} />
          </div>
          <div>
            <p className="font-semibold text-vn-text">Jam room {session.code} is active</p>
            <p>Friends can join now and stay synced with your playback.</p>
          </div>
          <div className="ml-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <Clock3 size={18} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
