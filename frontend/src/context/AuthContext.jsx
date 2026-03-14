// ============================================================
// src/context/AuthContext.jsx — Global Auth State
// ============================================================
// React Context lets you share state across components without
// passing props through every level (prop drilling).
//
// Provides: user, token, login(), logout(), isAuthenticated

import React, { createContext, useContext, useState, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

// ── Provider Component ────────────────────────────────────────
// Wrap your entire app with this so all children can access auth state
export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so user stays logged in after page refresh
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vn_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(() => localStorage.getItem('vn_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!token && !!user;

  // ── Login ───────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { token: newToken, user: newUser } = res.data;

      // Persist to localStorage so session survives page refresh
      localStorage.setItem('vn_token', newToken);
      localStorage.setItem('vn_user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register ────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register({ name, email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('vn_token', newToken);
      localStorage.setItem('vn_user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('vn_token');
    localStorage.removeItem('vn_user');
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const updateUser = useCallback((nextUser) => {
    localStorage.setItem('vn_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      const nextUser = {
        id: response.data.user._id || response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        avatarUrl: response.data.user.avatarUrl || '',
      };
      updateUser(nextUser);
      return nextUser;
    } catch {
      return null;
    }
  }, [updateUser]);

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, loading, error,
      login, register, logout, clearError, updateUser, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom Hook ───────────────────────────────────────────────
// Usage: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
