import { useEffect } from 'react';
import { useJamSession } from '../context/JamContext';
import { usePlayer } from '../context/PlayerContext';

export const useKeyboardShortcuts = () => {
  const {
    togglePlay, playNext, playPrev, seek,
    currentTime, duration, changeVolume, volume,
    toggleMute, currentSong,
  } = usePlayer();
  const { canControlPlayback } = useJamSession();

  useEffect(() => {
    const handleKey = (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
      if (!canControlPlayback && ['Space', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (currentSong) togglePlay();
          break;
        case 'ArrowRight':
          if (event.shiftKey) {
            playNext();
          } else {
            event.preventDefault();
            seek(Math.min(duration, currentTime + 10));
          }
          break;
        case 'ArrowLeft':
          if (event.shiftKey) {
            playPrev();
          } else {
            event.preventDefault();
            seek(Math.max(0, currentTime - 10));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canControlPlayback, changeVolume, currentSong, currentTime, duration, playNext, playPrev, seek, toggleMute, togglePlay, volume]);
};
