import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { SongCard } from '../components/SongCard';
import { useMusicStore } from '../store/musicStore';

const genres = [
  { name: 'Pop', color: 'from-pink-500 to-rose-500' },
  { name: 'Hip-Hop', color: 'from-orange-500 to-amber-500' },
  { name: 'Rock', color: 'from-red-500 to-rose-600' },
  { name: 'EDM', color: 'from-cyan-500 to-blue-500' },
  { name: 'R&B', color: 'from-purple-500 to-violet-500' },
  { name: 'Jazz', color: 'from-amber-500 to-yellow-500' },
  { name: 'Classical', color: 'from-emerald-500 to-teal-500' },
  { name: 'Indie', color: 'from-indigo-500 to-purple-500' },
];

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const { songs } = useMusicStore();

  useEffect(() => {
    if (searchQuery || selectedGenre) {
      const query = new URLSearchParams();
      if (searchQuery) query.set('search', searchQuery);
      if (selectedGenre) query.set('genre', selectedGenre);
      
      fetch(`/api/songs?${query.toString()}`)
        .then(res => res.json())
        .then(data => setSearchResults(data));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedGenre]);

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedGenre(null);
    setSearchResults([]);
  };

  return (
    <div className="min-h-full pb-24">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 
          className="text-3xl font-bold text-[#e8e8f0] mb-6"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Search
        </h1>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <motion.div
            className={`absolute -inset-0.5 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-2xl opacity-0 transition-opacity duration-300 ${isFocused ? 'opacity-100' : ''}`}
          />
          <div className="relative flex items-center bg-[#1a1a24] rounded-2xl border border-[#2a2a3a]">
            <Search className="w-5 h-5 text-[#8888aa] ml-5" />
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 bg-transparent px-4 py-4 text-[#e8e8f0] placeholder-[#666688] outline-none"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSearch}
                  className="p-2 mr-3 rounded-full hover:bg-[#2a2a3a] text-[#8888aa] transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Genre Chips */}
      {!searchQuery && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-[#e8e8f0] mb-4">Browse all</h2>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre, index) => (
              <motion.button
                key={genre.name}
                onClick={() => setSelectedGenre(selectedGenre === genre.name ? null : genre.name)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedGenre === genre.name
                    ? 'bg-[#7c3aed] text-white'
                    : `bg-gradient-to-r ${genre.color} text-white hover:opacity-90`
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {genre.name}
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {(searchQuery || selectedGenre) && (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#e8e8f0]">
                {searchQuery ? `Results for "${searchQuery}"` : `${selectedGenre} Songs`}
              </h2>
              <span className="text-sm text-[#8888aa]">{searchResults.length} songs</span>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((song: any, index: number) => (
                  <SongCard key={song.id} song={song} variant="row" index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[#8888aa] text-lg">No results found</p>
                <p className="text-[#666688] text-sm mt-2">Try adjusting your search terms</p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Popular Searches (when no search) */}
      {!searchQuery && !selectedGenre && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-[#e8e8f0] mb-5">Popular Right Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {songs.slice(0, 8).map((song, index) => (
              <SongCard key={song.id} song={song} index={index} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
