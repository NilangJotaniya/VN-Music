// ============================================================
// src/pages/Login.jsx
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Music2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.message);
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen bg-vn-bg flex items-center justify-center p-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
             style={{ background: 'radial-gradient(circle, #7c3aed22 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
             style={{ background: 'radial-gradient(circle, #7c3aed11 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-vn-accent flex items-center justify-center shadow-lg"
               style={{ boxShadow: '0 0 20px #7c3aed66' }}>
            <Music2 size={20} className="text-white" />
          </div>
          <span className="text-3xl font-black gradient-text">VN</span>
        </div>

        <div className="glass rounded-2xl p-7 shadow-2xl">
          <h1 className="text-2xl font-bold text-vn-text mb-1">Welcome back</h1>
          <p className="text-vn-muted text-sm mb-6">Sign in to your VN account</p>

          {/* Error */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-4"
            >
              {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-vn-muted font-semibold uppercase tracking-wide mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-vn-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-vn-elevated border border-vn-border rounded-xl py-2.5 pl-9 pr-3 text-vn-text placeholder-vn-muted text-sm focus:outline-none focus:border-vn-accent transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-vn-muted font-semibold uppercase tracking-wide mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-vn-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-vn-elevated border border-vn-border rounded-xl py-2.5 pl-9 pr-9 text-vn-text placeholder-vn-muted text-sm focus:outline-none focus:border-vn-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vn-muted hover:text-vn-text"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-vn-accent text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-vn-accent-light transition-colors disabled:opacity-60 shadow-lg mt-2"
              style={{ boxShadow: '0 4px 15px #7c3aed44' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-vn-muted text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-vn-accent hover:text-vn-accent-light font-semibold transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
