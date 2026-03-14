// ============================================================
// src/pages/Register.jsx
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Music2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (!name.trim() || !email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const result = await register(name.trim(), email, password);
    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.message);
    }
  };

  const displayError = formError || error;

  // Password strength indicator
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen bg-vn-bg flex items-center justify-center p-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full"
             style={{ background: 'radial-gradient(circle, #7c3aed22 0%, transparent 70%)', filter: 'blur(60px)' }} />
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
          <h1 className="text-2xl font-bold text-vn-text mb-1">Create account</h1>
          <p className="text-vn-muted text-sm mb-6">Start streaming music for free</p>

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
            {/* Name */}
            <div>
              <label className="text-xs text-vn-muted font-semibold uppercase tracking-wide mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-vn-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full bg-vn-elevated border border-vn-border rounded-xl py-2.5 pl-9 pr-3 text-vn-text placeholder-vn-muted text-sm focus:outline-none focus:border-vn-accent transition-colors"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
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

              {/* Strength bar */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColors[strength] : 'bg-vn-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    strength === 1 ? 'text-red-400' : strength === 2 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {strengthLabels[strength]}
                  </p>
                </motion.div>
              )}
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
                  Creating account...
                </span>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-vn-muted text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-vn-accent hover:text-vn-accent-light font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
