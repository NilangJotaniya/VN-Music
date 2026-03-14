// ============================================================
// src/services/api.js — Centralized API Client
// ============================================================
// Axios instance with base URL + auto JWT token injection.
// Import this everywhere instead of raw axios — keeps auth
// headers consistent across all API calls.

import axios from 'axios';
import { getApiBaseUrl } from './config';

// The base URL points to your Express backend
// In development: http://localhost:5000 (proxied via package.json "proxy")
// In production: set REACT_APP_API_URL env var
const BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────────────────
// Automatically adds JWT token to every request if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────
// Handle 401 (unauthorized) globally — auto-logout if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local storage and redirect
      localStorage.removeItem('vn_token');
      localStorage.removeItem('vn_user');
      // Only redirect if we're not already on login/register page
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── API Methods ───────────────────────────────────────────────
// Auth
export const authAPI = {
  register: (data)  => api.post('/api/auth/register', data),
  login:    (data)  => api.post('/api/auth/login', data),
};

// User
export const userAPI = {
  getProfile:         ()     => api.get('/api/user/profile'),
  updateProfile:      (data) => api.put('/api/user/profile', data),
  getRecentlyPlayed:  ()     => api.get('/api/user/recently-played'),
  addRecentlyPlayed:  (song) => api.post('/api/user/recently-played', song),
};

// Favorites
export const favoritesAPI = {
  getAll:  ()       => api.get('/api/favorites'),
  add:     (song)   => api.post('/api/favorites/add', song),
  remove:  (videoId) => api.delete(`/api/favorites/remove/${videoId}`),
};

// Playlists
export const playlistsAPI = {
  getAll:     ()           => api.get('/api/playlists'),
  getOne:     (id)         => api.get(`/api/playlists/${id}`),
  create:     (data)       => api.post('/api/playlists', data),
  update:     (id, data)   => api.put(`/api/playlists/${id}`, data),
  delete:     (id)         => api.delete(`/api/playlists/${id}`),
  addSong:    (id, song)   => api.post(`/api/playlists/${id}/songs`, song),
  removeSong: (id, videoId) => api.delete(`/api/playlists/${id}/songs/${videoId}`),
};

// YouTube
export const youtubeAPI = {
  search:   (q)   => api.get('/api/youtube/search', { params: { q } }),
  trending: ()    => api.get('/api/youtube/trending'),
  related:  (params) => api.get('/api/youtube/related', { params }),
};

export const lyricsAPI = {
  get: (params) => api.get('/api/lyrics', { params }),
};

export const jamAPI = {
  create: (data) => api.post('/api/jam-sessions', data),
  join: (code, data) => api.post(`/api/jam-sessions/${code}/join`, data),
  get: (code, memberId) => api.get(`/api/jam-sessions/${code}`, { params: { memberId } }),
  sync: (code, data) => api.post(`/api/jam-sessions/${code}/sync`, data),
  leave: (code, data) => api.post(`/api/jam-sessions/${code}/leave`, data),
};

export default api;
