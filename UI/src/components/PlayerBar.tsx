import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1,
  Heart, 
  Volume2, 
  VolumeX,
  ListMusic,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    progress,
    setProgress,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    nextSong,
    prevSong,
    isExpanded,
    toggleExpanded,
    favorites,
    toggleFavorite
  } = useMusicStore();

  const progressRef = useRef<HTMLDivElement>(null);
  const isFavorite = currentSong ? favorites.includes(String(currentSong.id)) : false;

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse duration string to seconds
  const parseDuration = (duration: string) => {
    const [mins, secs] = duration.split(':').map(Number);
    return mins * 60 + secs;
  };

  const totalSeconds = currentSong ? parseDuration(currentSong.duration) : 0;
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);

  // Handle progress bar click/drag
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentSong) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setProgress(percentage);
  };

  // Simulate progress when playing
  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    
    const interval = setInterval(() => {
      const newProgress = progress + (100 / totalSeconds) * 0.1;
      if (newProgress >= 100) {
        nextSong();
        setProgress(0);
      } else {
        setProgress(newProgress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentSong, totalSeconds, nextSong, setProgress, progress]);

  if (!currentSong) {
    return (
      <div className="h-[72px] bg-[#0d0d15] border-t border-[#2a2a3a] flex items-center justify-center px-6">
        <p className="text-[#666688] text-sm">Select a song to start listening</p>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="h-[72px] bg-[#0d0d15]/95 backdrop-blur-xl border-t border-[#2a2a3a] flex items-center px-6 relative"
        initial={{ y: 72 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Ambient glow when playing */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#7c3aed]/10 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Left: Song Info */}
        <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
          <motion.div 
            className="relative w-14 h-14 rounded-lg overflow-hidden"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <img 
              src={currentSong.cover_url} 
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="flex-1 min-w-0">
            <motion.p 
              className="font-medium text-[#e8e8f0] truncate"
              key={currentSong.title}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {currentSong.title}
            </motion.p>
            <motion.p 
              className="text-sm text-[#8888aa] truncate"
              key={currentSong.artist}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              {currentSong.artist}
            </motion.p>
          </div>
          <motion.button
            onClick={() => toggleFavorite(String(currentSong.id))}
            className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500' : 'text-[#8888aa] hover:text-[#e8e8f0]'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
          </motion.button>
        </div>

        {/* Center: Controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${isShuffled ? 'text-[#a855f7]' : 'text-[#8888aa] hover:text-[#e8e8f0]'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Shuffle className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={prevSong}
              className="p-2 rounded-full text-[#e8e8f0] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </motion.button>
            
            <motion.button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-[#e8e8f0] flex items-center justify-center hover:scale-105 transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-[#080810] fill-[#080810]" />
              ) : (
                <Play className="w-5 h-5 text-[#080810] fill-[#080810] ml-0.5" />
              )}
            </motion.button>
            
            <motion.button
              onClick={nextSong}
              className="p-2 rounded-full text-[#e8e8f0] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </motion.button>
            
            <motion.button
              onClick={cycleRepeatMode}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'none' ? 'text-[#a855f7]' : 'text-[#8888aa] hover:text-[#e8e8f0]'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-xs text-[#8888aa] w-10 text-right">{formatTime(currentSeconds)}</span>
            <div 
              ref={progressRef}
              className="flex-1 h-1 bg-[#2a2a3a] rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </motion.div>
            </div>
            <span className="text-xs text-[#8888aa] w-10">{currentSong.duration}</span>
          </div>
        </div>

        {/* Right: Volume & Extra */}
        <div className="flex items-center gap-3 w-[30%] min-w-[200px] justify-end">
          <motion.button
            onClick={toggleMute}
            className="p-2 rounded-full text-[#8888aa] hover:text-[#e8e8f0] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </motion.button>
          
          <div 
            className="w-24 h-1 bg-[#2a2a3a] rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setVolume(Math.max(0, Math.min(100, (x / rect.width) * 100)));
            }}
          >
            <motion.div 
              className="h-full bg-[#8888aa] group-hover:bg-[#a855f7] rounded-full transition-colors"
              style={{ width: `${isMuted ? 0 : volume}%` }}
            />
          </div>

          <motion.button
            className="p-2 rounded-full text-[#8888aa] hover:text-[#e8e8f0] transition-colors ml-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ListMusic className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={toggleExpanded}
            className="p-2 rounded-full text-[#8888aa] hover:text-[#e8e8f0] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Expanded Now Playing View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-[#080810]"
          >
            {/* Background */}
            <div className="absolute inset-0">
              <img 
                src={currentSong.cover_url} 
                alt=""
                className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#080810]/50 via-[#080810]/80 to-[#080810]" />
            </div>

            {/* Content */}
            <div className="relative h-full flex">
              {/* Close button */}
              <motion.button
                onClick={toggleExpanded}
                className="absolute top-6 right-6 p-3 rounded-full bg-[#1a1a24]/80 backdrop-blur text-[#8888aa] hover:text-[#e8e8f0] transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Minimize2 className="w-5 h-5" />
              </motion.button>

              {/* Center Content */}
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <motion.div
                    className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl"
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  >
                    <img 
                      src={currentSong.cover_url} 
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-[#7c3aed] blur-3xl opacity-20 -z-10 scale-110" />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-10 text-center"
                >
                  <h2 className="text-4xl font-bold text-[#e8e8f0] mb-2">{currentSong.title}</h2>
                  <p className="text-xl text-[#8888aa]">{currentSong.artist}</p>
                </motion.div>

                {/* Controls */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-10 flex items-center gap-6"
                >
                  <motion.button
                    onClick={toggleShuffle}
                    className={`p-3 rounded-full transition-colors ${isShuffled ? 'text-[#a855f7]' : 'text-[#8888aa]'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Shuffle className="w-6 h-6" />
                  </motion.button>
                  
                  <motion.button
                    onClick={prevSong}
                    className="p-3 rounded-full text-[#e8e8f0]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SkipBack className="w-8 h-8 fill-current" />
                  </motion.button>
                  
                  <motion.button
                    onClick={togglePlay}
                    className="w-20 h-20 rounded-full bg-[#e8e8f0] flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-[#080810] fill-[#080810]" />
                    ) : (
                      <Play className="w-8 h-8 text-[#080810] fill-[#080810] ml-1" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={nextSong}
                    className="p-3 rounded-full text-[#e8e8f0]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SkipForward className="w-8 h-8 fill-current" />
                  </motion.button>
                  
                  <motion.button
                    onClick={cycleRepeatMode}
                    className={`p-3 rounded-full transition-colors ${repeatMode !== 'none' ? 'text-[#a855f7]' : 'text-[#8888aa]'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
                  </motion.button>
                </motion.div>
              </div>

              {/* Queue Panel */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-96 bg-[#111118]/80 backdrop-blur-xl border-l border-[#2a2a3a] p-6 overflow-y-auto"
              >
                <h3 className="text-lg font-semibold text-[#e8e8f0] mb-6">Queue</h3>
                <div className="space-y-3">
                  {/* Queue items would go here */}
                  <p className="text-[#8888aa] text-sm">Queue is empty</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
