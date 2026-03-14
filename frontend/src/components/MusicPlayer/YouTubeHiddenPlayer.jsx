// ============================================================
// src/components/MusicPlayer/YouTubeHiddenPlayer.jsx
// ============================================================
// The actual audio playback is done by a hidden YouTube iframe.
// This component renders offscreen and connects to PlayerContext.

import React from 'react';
import YouTube from 'react-youtube';
import { usePlayer } from '../../context/PlayerContext';

export default function YouTubeHiddenPlayer() {
  const { currentSong, onPlayerReady, onPlayerStateChange } = usePlayer();

  if (!currentSong) return null;

  const opts = {
    height: '1',
    width:  '1',
    playerVars: {
      autoplay:       1,  // Start playing immediately
      controls:       0,  // Hide YouTube controls
      disablekb:      1,  // Disable keyboard controls in iframe
      fs:             0,  // Disable fullscreen
      iv_load_policy: 3,  // Hide annotations
      modestbranding: 1,  // Minimal YouTube branding
      rel:            0,  // Don't show related videos
      showinfo:       0,
    },
  };

  return (
    <div id="youtube-player-container">
      <YouTube
        key={currentSong.videoId}  // Re-mount when song changes
        videoId={currentSong.videoId}
        opts={opts}
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
      />
    </div>
  );
}
