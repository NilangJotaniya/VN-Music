import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Music, Play, Search as SearchIcon, Sparkles, Wand2, X,
} from 'lucide-react';
import SongCard from '../components/SongCard/SongCard';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { userAPI, youtubeAPI } from '../services/api';

const genres = [
  { label: 'Pop', query: 'popular pop songs 2025', color: 'from-pink-500 to-rose-500', keywords: ['pop', 'dance pop', 'chart'] },
  { label: 'Hip-Hop', query: 'hip hop rap hits 2025', color: 'from-orange-500 to-amber-500', keywords: ['hip hop', 'rap', 'drill', 'trap'] },
  { label: 'Rock', query: 'rock anthems', color: 'from-red-500 to-rose-600', keywords: ['rock', 'metal', 'band', 'anthem'] },
  { label: 'EDM', query: 'edm festival hits', color: 'from-cyan-500 to-blue-500', keywords: ['edm', 'electronic', 'remix', 'festival', 'dj'] },
  { label: 'R&B', query: 'rnb soul tracks', color: 'from-purple-500 to-violet-500', keywords: ['rnb', 'r&b', 'soul', 'neo soul'] },
  { label: 'Jazz', query: 'smooth jazz essentials', color: 'from-amber-500 to-yellow-500', keywords: ['jazz', 'blues', 'sax'] },
  { label: 'Classical', query: 'classical piano collection', color: 'from-emerald-500 to-teal-500', keywords: ['classical', 'piano', 'orchestra', 'violin'] },
  { label: 'Lo-fi', query: 'lofi chill beats', color: 'from-indigo-500 to-purple-500', keywords: ['lofi', 'lo-fi', 'chill', 'study beats'] },
];

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

function normalizeText(value) {
  return (value || '').toLowerCase().replace(/[^a-z0-9\s&-]/g, ' ');
}

function inferGenre(song, query) {
  const haystack = normalizeText(`${song.title} ${song.channelName} ${query}`);
  const matched = genres.find((genre) => genre.keywords.some((keyword) => haystack.includes(keyword)));
  return matched?.label || 'Mixed';
}

function buildRelatedQueue(selectedSong, songs, query) {
  const selectedGenre = inferGenre(selectedSong, query);
  const selectedChannel = normalizeText(selectedSong.channelName);
  const selectedWords = new Set(
    normalizeText(`${selectedSong.title} ${query}`)
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );

  const ranked = songs
    .filter((song) => song.videoId !== selectedSong.videoId)
    .map((song) => {
      const text = normalizeText(`${song.title} ${song.channelName}`);
      const genre = inferGenre(song, query);
      let score = 0;

      if (genre === selectedGenre) score += 12;
      if (normalizeText(song.channelName) === selectedChannel) score += 8;
      if (text.includes(normalizeText(selectedSong.title).slice(0, 18))) score += 3;

      for (const word of selectedWords) {
        if (text.includes(word)) score += 1;
      }

      return { song: { ...song, genre }, score };
    })
    .sort((a, b) => b.score - a.score);

  return [{ ...selectedSong, genre: selectedGenre }, ...ranked.map((entry) => entry.song)];
}

function DiscoveryCard({ song, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-[28px] bg-[#171723] text-left transition hover:-translate-y-1"
    >
      <div className="relative aspect-[1/1] overflow-hidden">
        <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171723] via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-[0_12px_35px_rgba(124,58,237,0.45)]">
            <Play size={24} fill="currentColor" className="ml-1" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="truncate text-lg font-bold tracking-[-0.02em] text-vn-text">{song.title}</p>
        <p className="mt-1.5 truncate text-sm text-vn-muted">{song.channelName}</p>
      </div>
    </button>
  );
}

function RecentRow({ song, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[22px] px-3 py-3 text-left transition hover:bg-white/[0.04]"
    >
      <img src={song.thumbnail} alt={song.title} className="h-14 w-14 rounded-2xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold tracking-[-0.02em] text-vn-text">{song.title}</p>
        <p className="truncate text-sm text-vn-muted">{song.channelName}</p>
      </div>
      <ArrowRight size={16} className="text-vn-muted" />
    </button>
  );
}

function QuickSearchCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 text-left transition hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.04]"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-vn-muted">{item.label}</p>
      <p className="mt-3 text-xl font-bold tracking-[-0.03em] text-vn-text">{item.title}</p>
      <p className="mt-2 text-sm leading-6 text-vn-muted">{item.description}</p>
    </button>
  );
}

export default function Search() {
  const { isAuthenticated } = useAuth();
  const { playSong } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trending, setTrending] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const inputRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 450);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    youtubeAPI.trending()
      .then((response) => setTrending(response.data.songs || []))
      .catch(() => setTrending([]));

    if (isAuthenticated) {
      userAPI.getRecentlyPlayed()
        .then((response) => setRecentlyPlayed(response.data.recentlyPlayed || []))
        .catch(() => setRecentlyPlayed([]));
    }
  }, [isAuthenticated]);

  const doSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await youtubeAPI.search(term);
      setResults(response.data.songs || []);
    } catch (searchError) {
      setResults([]);
      setError(searchError.response?.data?.message || 'Search failed. Check the backend and YouTube API key.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  const handleSearchPlay = useCallback(async (selectedSong, fallbackList) => {
    try {
      const response = await youtubeAPI.related({
        title: selectedSong.title,
        channelName: selectedSong.channelName,
        genre: selectedSong.genre,
        videoId: selectedSong.videoId,
      });

      const relatedSongs = response.data.songs || [];
      playSong(selectedSong, [selectedSong, ...relatedSongs]);
    } catch {
      playSong(selectedSong, fallbackList);
    }
  }, [playSong]);

  const playFromCollection = useCallback((song, collection) => {
    playSong(song, collection);
  }, [playSong]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  const showEmptySearch = !query.trim() && !loading;
  const enrichedResults = useMemo(
    () => results.map((song) => ({ ...song, genre: inferGenre(song, query) })),
    [query, results]
  );
  const topResult = enrichedResults[0] || null;
  const discoveryGrid = trending.slice(0, 8);
  const recentGrid = recentlyPlayed.slice(0, 5);
  const quickSearches = [
    {
      label: 'Pop',
      title: 'Chart Pop',
      description: 'Current pop songs, melodic hooks, and radio-ready picks.',
      query: genres[0].query,
    },
    {
      label: 'Hip-Hop',
      title: 'Rap Rotation',
      description: 'Sharp flows, high-energy beats, and current hip-hop staples.',
      query: genres[1].query,
    },
    {
      label: 'Rock',
      title: 'Guitar Anthems',
      description: 'Big choruses, live-band energy, and modern rock favorites.',
      query: genres[2].query,
    },
    {
      label: 'Focus',
      title: 'Lo-fi and Calm',
      description: 'Softer instrumental lanes for relaxed and background listening.',
      query: genres[7].query,
    },
  ];

  return (
    <div className="min-h-full pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-vn-muted">Discovery</p>
        <h1 className="max-w-4xl text-[1.9rem] font-bold leading-[1] tracking-[-0.04em] text-vn-text md:text-[2.8rem]">Search your next track.</h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-vn-muted">
          Search is structured around real listening behavior: cleaner discovery, stronger hierarchy, and playback queues that stay closer to the same genre and artist lane.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-10">
        <div className="relative max-w-5xl">
          <div className="absolute -inset-0.5 rounded-[30px] bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-cyan-400 opacity-35 blur-md" />
          <div className="relative flex items-center rounded-[30px] border border-white/10 bg-[#1a1a24]/95 px-6 shadow-[0_16px_50px_rgba(10,10,24,0.45)]">
            <SearchIcon size={20} className="text-vn-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search artists, songs, moods, or genres"
              className="flex-1 bg-transparent px-4 py-4 text-[15px] text-vn-text outline-none placeholder:text-[#666688]"
            />
            <AnimatePresence>
              {query ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={clearSearch}
                  className="rounded-full p-2 text-vn-muted transition hover:bg-white/5 hover:text-vn-text"
                >
                  <X size={16} />
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {showEmptySearch ? (
        <div className="space-y-12">
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-300" />
                <h2 className="text-[1.55rem] font-bold tracking-[-0.025em] text-vn-text">Quick searches</h2>
              </div>
              <span className="text-sm text-vn-muted">Real search starting points</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {quickSearches.map((item) => (
                <QuickSearchCard key={item.title} item={item} onClick={() => setQuery(item.query)} />
              ))}
            </div>
          </section>

          {recentGrid.length ? (
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[1.55rem] font-bold tracking-[-0.025em] text-vn-text">Recently Played</h2>
                <span className="text-sm text-vn-muted">Picked from your listening history</span>
              </div>
              <div className="rounded-[30px] border border-white/8 bg-white/[0.02] p-3">
                {recentGrid.map((song) => (
                  <RecentRow key={song.videoId} song={song} onClick={() => playFromCollection(song, recentGrid)} />
                ))}
              </div>
            </section>
          ) : null}

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 size={16} className="text-cyan-300" />
                  <h2 className="text-[1.55rem] font-bold tracking-[-0.025em] text-vn-text">Browse by mood</h2>
                </div>
                <span className="text-sm text-vn-muted">Editorial discovery lanes</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {genres.slice(0, 4).map((genre) => (
                  <button
                    key={genre.label}
                    type="button"
                    onClick={() => setQuery(genre.query)}
                    className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 text-left transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <p className="text-xl font-bold tracking-[-0.03em] text-vn-text">{genre.label}</p>
                    <p className="mt-3 text-sm leading-6 text-vn-muted">{genre.query}</p>
                  </button>
                ))}
              </div>
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[1.55rem] font-bold tracking-[-0.025em] text-vn-text">For You</h2>
              <span className="text-sm text-vn-muted">Live picks from your current catalog</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {discoveryGrid.map((song) => (
                <DiscoveryCard key={song.videoId} song={song} onClick={() => playFromCollection(song, discoveryGrid)} />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-2">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-2xl px-3 py-3">
              <div className="skeleton h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-2/3" />
                <div className="skeleton h-2.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </motion.div>
      ) : null}

      {!loading && query.trim() ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[1.55rem] font-bold tracking-[-0.025em] text-vn-text">Results for "{query}"</h2>
              <p className="mt-2 text-sm text-vn-muted">Top result gets a related queue from the backend. The rest fall back to genre-first ranking.</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-vn-muted">{enrichedResults.length} songs</span>
          </div>

          {topResult ? (
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                <div className="overflow-hidden rounded-[26px]">
                  <img src={topResult.thumbnail} alt={topResult.title} className="aspect-square w-full object-cover" />
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-300">Top Result</p>
                  <h3 className="line-clamp-2 text-[1.55rem] font-bold tracking-[-0.025em] text-vn-text">{topResult.title}</h3>
                  <p className="mt-2 text-sm text-vn-muted">{topResult.channelName}</p>
                  <div className="mt-4 inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs text-vn-muted">
                    {topResult.genre}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchPlay(topResult, buildRelatedQueue(topResult, enrichedResults, query))}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8b5cf6]"
                  >
                    <Play size={15} fill="currentColor" />
                    Play With Similar Queue
                  </button>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/8 bg-white/[0.02] p-2">
                {enrichedResults.map((song, index) => (
                  <SongCard
                    key={song.videoId}
                    song={song}
                    songList={buildRelatedQueue(song, enrichedResults, query)}
                    onPlaySong={handleSearchPlay}
                    showIndex={index + 1}
                  />
                ))}
              </div>
            </div>
          ) : !error ? (
            <div className="rounded-[28px] border border-white/8 bg-white/[0.03] py-16 text-center">
              <Music size={44} className="mx-auto mb-4 text-vn-muted opacity-30" />
              <p className="text-lg font-semibold text-vn-text">No results found</p>
              <p className="mt-2 text-sm text-vn-muted">Try another artist, song title, or genre.</p>
            </div>
          ) : null}
        </motion.section>
      ) : null}
    </div>
  );
}
