import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, CircleUserRound, Copy, LogOut, Music2, ShieldCheck, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const MAX_FILE_SIZE = 75 * 1024;

const formatJoinDate = (value) => {
  if (!value) return 'Recently joined';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
};

export default function Profile() {
  const {
    user, updateUser, refreshProfile, logout,
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    setName(user?.name || '');
    setAvatarUrl(user?.avatarUrl || '');
    setBio(user?.bio || '');
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('Profile photo must be smaller than 75 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(String(reader.result || ''));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await userAPI.updateProfile({
        name,
        avatarUrl,
        bio,
      });

      updateUser(response.data.user);
      setMessage('Profile updated.');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => [
    { label: 'Favorites', value: user?.favoritesCount || 0 },
    { label: 'Recently Played', value: user?.recentlyPlayedCount || 0 },
    { label: 'Member Since', value: formatJoinDate(user?.createdAt) },
  ], [user?.createdAt, user?.favoritesCount, user?.recentlyPlayedCount]);

  return (
    <div className="min-h-full pb-24">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-vn-muted">Account</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[1.9rem] font-bold tracking-[-0.03em] text-vn-text">Profile settings</h1>
            <p className="mt-3 max-w-2xl text-sm text-vn-muted">Manage your profile, account identity, and listening presence across the app.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="space-y-6">
          <section className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-vn-muted">Preview</p>
            <div className="flex flex-col items-center rounded-[24px] border border-white/8 bg-white/[0.03] px-6 py-8 text-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name || 'Profile'} className="h-28 w-28 rounded-full object-cover ring-4 ring-white/5" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-white/12 bg-white/[0.02]">
                  <CircleUserRound className="h-14 w-14 text-vn-muted" />
                </div>
              )}
              <p className="mt-5 text-lg font-semibold text-vn-text">{name || 'No display name'}</p>
              <p className="mt-1 text-sm text-vn-muted">{user?.email}</p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-vn-muted">{bio || 'Add a short bio so your profile feels more complete and personal.'}</p>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-vn-muted">Account Overview</p>
            <div className="grid gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-vn-muted">{stat.label}</p>
                  <p className="mt-2 text-base font-semibold text-vn-text">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(user?.email || '')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-vn-text transition hover:border-[#7c3aed]/40 hover:text-purple-300"
              >
                <Copy className="h-4 w-4" />
                Copy email
              </button>
              <button
                type="button"
                onClick={() => navigate('/favorites')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-vn-text transition hover:border-[#7c3aed]/40 hover:text-purple-300"
              >
                <Music2 className="h-4 w-4" />
                View favorites
              </button>
            </div>
          </section>
        </section>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-vn-muted">Display name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-vn-text outline-none transition focus:border-[#7c3aed]"
              placeholder="Your name"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-vn-muted">Email</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-transparent text-sm text-vn-muted outline-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-vn-muted">Short bio</label>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 160))}
              rows={4}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-vn-text outline-none transition focus:border-[#7c3aed]"
              placeholder="Tell listeners a little about your taste, moods, or favorite artists."
            />
            <p className="mt-2 text-xs text-vn-muted">{bio.length}/160</p>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-vn-muted">Photo URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-vn-text outline-none transition focus:border-[#7c3aed]"
              placeholder="Paste an image URL or upload a small file below"
            />
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-vn-text transition hover:border-[#7c3aed]/40 hover:text-purple-300"
            >
              <Camera className="h-4 w-4" />
              Upload photo
            </button>
            <button
              type="button"
              onClick={() => setAvatarUrl('')}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-400/10"
            >
              <Trash2 className="h-4 w-4" />
              Remove photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
          </div>

          {message ? <p className="mb-4 text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-vn-text transition hover:border-red-400/20 hover:text-red-300"
            >
              Log out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
