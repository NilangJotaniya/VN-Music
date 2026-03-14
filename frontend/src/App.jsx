import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { ToastProvider } from './context/ToastContext';
import { LyricsProvider } from './context/LyricsContext';
import { JamProvider } from './context/JamContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import RecentlyPlayed from './pages/RecentlyPlayed';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import JamSession from './pages/JamSession';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};
const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="search" element={<Search />} />
      <Route path="jam" element={<JamSession />} />
      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="favorites" element={<ProtectedRoute><Navigate to="/liked-songs" replace /></ProtectedRoute>} />
      <Route path="liked-songs" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      <Route path="recently-played" element={<ProtectedRoute><RecentlyPlayed /></ProtectedRoute>} />
      <Route path="playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
      <Route path="playlists/:id" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <ToastProvider>
            <JamProvider>
              <LyricsProvider>
                <AppRoutes />
              </LyricsProvider>
            </JamProvider>
          </ToastProvider>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
