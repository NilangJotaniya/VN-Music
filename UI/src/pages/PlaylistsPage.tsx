import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PlaylistCard } from '../components/PlaylistCard';
import { useMusicStore } from '../store/musicStore';

export function PlaylistsPage() {
  const { playlists, setPlaylists } = useMusicStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => setPlaylists(data));
  }, [setPlaylists]);

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlaylistName, description: '' })
    });

    if (res.ok) {
      const data = await res.json();
      setPlaylists([data, ...playlists]);
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 
          className="text-3xl font-bold text-[#e8e8f0]"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Your Playlists
        </h1>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] hover:bg-[#a855f7] text-white font-medium rounded-full transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </motion.button>
      </motion.div>

      {/* Create Playlist Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
      >
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="group aspect-square rounded-2xl bg-gradient-to-br from-[#2a2a3a] to-[#1a1a24] flex flex-col items-center justify-center gap-4 hover:from-[#3a3a4a] hover:to-[#2a2a34] transition-all duration-300 border border-dashed border-[#3a3a4a] hover:border-[#7c3aed]/50"
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 rounded-full bg-[#7c3aed]/20 flex items-center justify-center group-hover:bg-[#7c3aed]/30 transition-colors">
            <Plus className="w-8 h-8 text-[#a855f7]" />
          </div>
          <span className="font-medium text-[#e8e8f0]">Create Playlist</span>
        </motion.button>

        {playlists.map((playlist, index) => (
          <PlaylistCard key={playlist.id} playlist={playlist} index={index} />
        ))}
      </motion.div>

      {/* Create Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a24] rounded-2xl p-6 w-full max-w-md border border-[#2a2a3a]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#e8e8f0] mb-4">Create Playlist</h2>
            <form onSubmit={createPlaylist}>
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full px-4 py-3 bg-[#111118] border border-[#2a2a3a] rounded-xl text-[#e8e8f0] placeholder-[#666688] outline-none focus:border-[#7c3aed] transition-colors mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#2a2a3a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#7c3aed] hover:bg-[#a855f7] text-white font-medium rounded-xl transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
