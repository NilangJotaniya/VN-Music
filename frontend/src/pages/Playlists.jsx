// ============================================================
// src/pages/Playlists.jsx — Playlist Management
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListMusic, Plus, Trash2, Edit2, ChevronRight, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playlistsAPI } from '../services/api';

export default function Playlists() {
  const [playlists,   setPlaylists]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [newName,     setNewName]     = useState('');
  const [creating,    setCreating]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [editName,    setEditName]    = useState('');

  const loadPlaylists = useCallback(async () => {
    try {
      const res = await playlistsAPI.getAll();
      setPlaylists(res.data.playlists || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlaylists(); }, [loadPlaylists]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await playlistsAPI.create({ name: newName.trim() });
      setPlaylists((p) => [res.data.playlist, ...p]);
      setNewName('');
      setShowCreate(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create playlist.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await playlistsAPI.delete(id);
      setPlaylists((p) => p.filter((pl) => pl._id !== id));
    } catch (err) {
      alert('Failed to delete playlist.');
    }
  };

  const handleRename = async (id) => {
    if (!editName.trim()) return;
    try {
      const res = await playlistsAPI.update(id, { name: editName.trim() });
      setPlaylists((p) =>
        p.map((pl) => (pl._id === id ? res.data.playlist : pl))
      );
      setEditingId(null);
    } catch (err) {
      alert('Failed to rename playlist.');
    }
  };

  return (
    <div className="p-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListMusic size={22} className="text-vn-accent" />
            <h1 className="text-[1.75rem] font-bold tracking-[-0.025em] text-vn-text">Playlists</h1>
          </div>
          <p className="text-vn-muted text-sm">{playlists.length} playlists</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate((p) => !p)}
          className="flex items-center gap-2 bg-vn-accent text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-vn-accent-light transition-colors"
          style={{ boxShadow: '0 4px 15px #7c3aed44' }}
        >
          <Plus size={16} />
          New Playlist
        </motion.button>
      </motion.div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="mb-6 overflow-hidden"
          >
            <div className="flex gap-3 bg-vn-elevated border border-vn-border rounded-2xl p-4">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name..."
                maxLength={100}
                className="flex-1 bg-transparent text-vn-text placeholder-vn-muted outline-none text-sm"
              />
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="bg-vn-accent text-white px-4 py-1.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {creating ? '...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 rounded-xl text-vn-muted hover:text-vn-text text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-vn-elevated animate-pulse">
              <div className="w-14 h-14 bg-vn-border rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-vn-border rounded w-1/3" />
                <div className="h-2 bg-vn-border rounded w-1/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && playlists.length === 0 && !showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <ListMusic size={56} className="text-vn-muted mx-auto mb-4 opacity-30" />
          <h2 className="text-vn-text font-semibold mb-2">No playlists yet</h2>
          <p className="text-vn-muted text-sm">Create your first playlist to organize your music.</p>
        </motion.div>
      )}

      {/* Playlist Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-3"
      >
        {playlists.map((pl) => (
          <motion.div
            key={pl._id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-vn-elevated border border-vn-border hover:border-vn-accent/40 transition-all"
          >
            {/* Cover */}
            <div className="w-14 h-14 rounded-xl bg-vn-surface flex-shrink-0 overflow-hidden">
              {pl.coverImage ? (
                <img src={pl.coverImage} alt={pl.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-vn-accent/30 to-vn-accent/10">
                  <Music size={22} className="text-vn-accent opacity-60" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editingId === pl._id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(pl._id); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 bg-vn-bg border border-vn-accent rounded-lg px-2 py-1 text-sm text-vn-text outline-none"
                  />
                  <button onClick={() => handleRename(pl._id)} className="text-xs text-vn-accent font-semibold">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-vn-muted">Cancel</button>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-vn-text truncate">{pl.name}</p>
                  <p className="text-xs text-vn-muted mt-0.5">
                    {pl.songs?.length || 0} {(pl.songs?.length || 0) === 1 ? 'song' : 'songs'}
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setEditingId(pl._id); setEditName(pl.name); }}
                className="p-2 rounded-lg text-vn-muted hover:text-vn-text hover:bg-vn-border transition-all"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDelete(pl._id)}
                className="p-2 rounded-lg text-vn-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Link to detail */}
            <Link
              to={`/playlists/${pl._id}`}
              className="p-2 rounded-lg text-vn-muted hover:text-vn-accent transition-colors"
            >
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
