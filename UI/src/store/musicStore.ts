import { create } from 'zustand';

interface Song {
  id: string | number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover_url: string;
  audio_url?: string;
  genre: string;
  play_count: number;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  song_count: number;
}

interface MusicStore {
  // Player state
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'none' | 'all' | 'one';
  queue: Song[];
  queueIndex: number;
  isExpanded: boolean;
  
  // Data
  songs: Song[];
  playlists: Playlist[];
  favorites: string[];
  recentlyPlayed: Song[];
  
  // Actions
  setCurrentSong: (song: Song) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  nextSong: () => void;
  prevSong: () => void;
  toggleExpanded: () => void;
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
  
  setSongs: (songs: Song[]) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setFavorites: (favorites: string[]) => void;
  setRecentlyPlayed: (songs: Song[]) => void;
  toggleFavorite: (songId: string) => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  progress: 0,
  volume: 70,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'none',
  queue: [],
  queueIndex: 0,
  isExpanded: false,
  
  songs: [],
  playlists: [],
  favorites: [],
  recentlyPlayed: [],
  
  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true, progress: 0 }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
  cycleRepeatMode: () => set((state) => ({
    repeatMode: state.repeatMode === 'none' ? 'all' : state.repeatMode === 'all' ? 'one' : 'none'
  })),
  nextSong: () => {
    const { queue, queueIndex, repeatMode } = get();
    if (queue.length === 0) return;
    
    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    set({ queueIndex: nextIndex, currentSong: queue[nextIndex], progress: 0 });
  },
  prevSong: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;
    set({ queueIndex: prevIndex, currentSong: queue[prevIndex], progress: 0 });
  },
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  clearQueue: () => set({ queue: [], queueIndex: 0 }),
  
  setSongs: (songs) => set({ songs }),
  setPlaylists: (playlists) => set({ playlists }),
  setFavorites: (favorites) => set({ favorites }),
  setRecentlyPlayed: (songs) => set({ recentlyPlayed: songs }),
  toggleFavorite: (songId) => set((state) => ({
    favorites: state.favorites.includes(songId)
      ? state.favorites.filter(id => id !== songId)
      : [...state.favorites, songId]
  })),
}));
