import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock3, Globe2, Heart, MoreHorizontal, Play, Radio, Sparkles, Stars,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJamSession } from '../context/JamContext';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { favoritesAPI, userAPI, youtubeAPI } from '../services/api';

const FALLBACK_THUMBNAIL =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 180%22%3E%3Crect width=%22320%22 height=%22180%22 fill=%22%23222%22/%3E%3Cpath d=%22M64 52h192a12 12 0 0112 12v52a12 12 0 01-12 12H64a12 12 0 01-12-12V64a12 12 0 0112-12zm24 14a6 6 0 100 12 6 6 0 000-12zm0 26a6 6 0 100 12 6 6 0 000-12zm0 26a6 6 0 100 12 6 6 0 000-12zm46-43a6 6 0 100 12 6 6 0 000-12zm0 26a6 6 0 100 12 6 6 0 000-12zm0 26a6 6 0 100 12 6 6 0 000-12zm46-43a6 6 0 100 12 6 6 0 000-12zm0 26a6 6 0 100 12 6 6 0 000-12zm0 26a6 6 0 100 12 6 6 0 000-12z%22 fill=%22%23aaa%22/%3E%3C/svg%3E';

const getThumbnailUrl = (song) => {
  if (!song) return FALLBACK_THUMBNAIL;

  const candidate = (song.thumbnail || '').trim();
  if (candidate && (candidate.startsWith('http://') || candidate.startsWith('https://'))) {
    return candidate;
  }

  // If the backend didn't provide a thumbnail URL, build one using the YouTube videoId.
  if (song.videoId) {
    return `https://i.ytimg.com/vi/${song.videoId}/mqdefault.jpg`;
  }

  return FALLBACK_THUMBNAIL;
};

const handleThumbnailError = (event, song) => {
  const el = event.target;
  if (!el) return;

  const fallback = getThumbnailUrl(song);
  if (el.src !== fallback) {
    el.onerror = null;
    el.src = fallback;
    return;
  }

  el.onerror = null;
  el.src = FALLBACK_THUMBNAIL;
};

function formatDuration(value) {
  if (!value) return '--:--';
  return value;
}

function SectionHeader({ title, subtitle, href = '/search' }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[1.45rem] font-bold tracking-[-0.025em] text-vn-text">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-vn-muted">{subtitle}</p> : null}
      </div>
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
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isFav, setIsFav] = useState(false);

  const isActive = currentSong?.videoId === song.videoId;
  const large = size === 'large';

  const toggleFavorite = async (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast('Sign in to save favorites', 'info');
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
    } catch (error) {
      if (error.response?.status === 409) {
        setIsFav(true);
        toast('Already in favorites', 'info');
      } else {
        toast('Failed to update favorites', 'error');
      }
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => canControlPlayback && playSong(song, songList)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (canControlPlayback) playSong(song, songList);
        }
      }}
      className={`group overflow-hidden rounded-[26px] bg-[#181824] text-left shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition ${
        large ? 'min-h-[330px]' : 'min-h-[310px]'
      }`}
    >
      <div className={`relative overflow-hidden ${large ? 'h-[250px]' : 'h-[220px]'}`}>
        <img
          src={getThumbnailUrl(song)}
          alt={song.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          onError={(event) => handleThumbnailError(event, song)}
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
            <button
              type="button"
              onClick={toggleFavorite}
              className={`rounded-lg p-1.5 transition-all ${isFav ? 'text-red-400' : 'text-vn-muted hover:text-red-400'}`}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </div>
    </motion.div>
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
        <img
          src={getThumbnailUrl(song)}
          alt={song.title}
          className="h-full w-full object-cover"
          onError={(event) => handleThumbnailError(event, song)}
        />
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

function DiscoveryStrip({ icon: Icon, title, subtitle, songs, href = '/search' }) {
  if (!songs.length) return null;

  return (
    <section className="mb-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-2xl bg-white/[0.04] p-3 text-vn-muted">
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-[1.45rem] font-bold tracking-[-0.025em] text-vn-text">{title}</h2>
            <p className="mt-1 text-sm text-vn-muted">{subtitle}</p>
          </div>
        </div>
        <Link to={href} className="text-sm text-vn-muted transition hover:text-vn-text">
          See all
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {songs.map((song, index) => (
          <MediaCard key={`${title}-${song.videoId}`} song={song} songList={songs} size={index < 4 ? 'large' : 'small'} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { session, canControlPlayback } = useJamSession();
  const { playSong } = usePlayer();
  const [worldTrending, setWorldTrending] = useState([]);
  const [indiaTrending, setIndiaTrending] = useState([]);
  const [indianPicks, setIndianPicks] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [
          worldResponse,
          indiaResponse,
          indianSearchResponse,
          recentResponse,
        ] = await Promise.all([
          youtubeAPI.trending({ maxResults: 16 }),
          youtubeAPI.trending({ regionCode: 'IN', maxResults: 12 }),
          youtubeAPI.search('latest hindi songs bollywood', { maxResults: 12 }),
          isAuthenticated ? userAPI.getRecentlyPlayed() : Promise.resolve({ data: { recentlyPlayed: [] } }),
        ]);

        const recentSongs = recentResponse.data.recentlyPlayed || [];
        setWorldTrending(worldResponse.data.songs || []);
        setIndiaTrending(indiaResponse.data.songs || []);
        setIndianPicks(indianSearchResponse.data.songs || []);
        setRecentlyPlayed(recentSongs);

        if (recentSongs.length) {
          try {
            const recommendedResponse = await youtubeAPI.related({
              title: recentSongs[0].title,
              channelName: recentSongs[0].channelName,
              videoId: recentSongs[0].videoId,
              maxResults: 12,
            });
            setRecommended(recommendedResponse.data.songs || []);
          } catch {
            setRecommended((worldResponse.data.songs || []).slice(4, 12));
          }
        } else {
          setRecommended((worldResponse.data.songs || []).slice(4, 12));
        }
      } catch {
        setWorldTrending([]);
        setIndiaTrending([]);
        setIndianPicks([]);
        setRecommended([]);
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
  const featured = indiaTrending[0] || worldTrending[0];
  const topWorld = worldTrending.slice(0, 4);
  const topIndia = indiaTrending.slice(0, 4);
  const recentRows = (recentlyPlayed.length ? recentlyPlayed : worldTrending.slice(0, 6)).slice(0, 6);
  const recommendationRows = recommended.slice(0, 8);
  const indianRows = indianPicks.slice(0, 8);

  return (
    <div className="min-h-full pb-28">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-[1.5rem] font-bold tracking-[-0.03em] text-vn-text md:text-[2.3rem]">
          {greeting}, {firstName}
        </h1>
        <p className="mt-2 text-[13px] text-vn-muted">
          A more complete discovery home with world charts, India charts, Indian picks, and recommendations that react to your listening.
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
              <img
                src={getThumbnailUrl(featured)}
                alt={featured.title}
                className="h-full w-full object-cover"
                onError={(event) => handleThumbnailError(event, featured)}
              />
            </div>

            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b95cff]">
                {indiaTrending[0]?.videoId === featured.videoId ? 'Top in India' : 'Top in the world'}
              </p>
              <h2 className="mt-2.5 max-w-[760px] text-[1.18rem] font-semibold leading-[1.08] tracking-[-0.02em] text-vn-text md:text-[1.85rem]">
                {featured.title}
              </h2>
              <p className="mt-2.5 text-sm text-vn-muted">
                {featured.channelName}
                {session ? ' • Jam session live' : ''}
              </p>
              <button
                type="button"
                onClick={() => canControlPlayback && playSong(featured, indiaTrending[0]?.videoId === featured.videoId ? indiaTrending : worldTrending)}
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
        <SectionHeader title="Top Songs Worldwide" subtitle="Current global music discovery lane" />

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
            {topWorld.map((song, index) => (
              <MediaCard key={song.videoId} song={song} songList={worldTrending} size="large" priority={index < 2} />
            ))}
          </div>
        )}
      </section>

      <DiscoveryStrip
        icon={Globe2}
        title="Top Songs in India"
        subtitle="Region-based chart discovery using the live India music feed"
        songs={topIndia}
      />

      <section className="mb-14">
        <SectionHeader title="Recently Played" subtitle="Your actual listening history" href="/recently-played" />

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

      <DiscoveryStrip
        icon={Sparkles}
        title="Recommended For You"
        subtitle="Built from your recent listening, then expanded through related tracks"
        songs={recommendationRows}
      />

      <DiscoveryStrip
        icon={Stars}
        title="Indian Picks"
        subtitle="Hindi and Indian listening lanes to make the home feed feel more local"
        songs={indianRows}
      />

      {!loading && !worldTrending.length ? (
        <div className="mt-10 rounded-[28px] border border-white/8 bg-white/[0.02] px-6 py-10 text-center">
          <Sparkles className="mx-auto mb-3 text-vn-muted" size={28} />
          <p className="text-lg font-semibold text-vn-text">No songs loaded</p>
          <p className="mt-2 text-sm text-vn-muted">
            Your backend did not return discovery songs. Check the YouTube API route and try again.
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
