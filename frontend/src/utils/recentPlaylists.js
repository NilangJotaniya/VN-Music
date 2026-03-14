const STORAGE_KEY = 'vn_recent_playlists';
const MAX_RECENT_PLAYLISTS = 6;

export function getRecentPlaylists() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function saveRecentPlaylist(playlist) {
  if (!playlist?._id) return;

  const next = [
    {
      _id: playlist._id,
      name: playlist.name,
      coverImage: playlist.coverImage || '',
      songsCount: playlist.songs?.length || 0,
    },
    ...getRecentPlaylists().filter((entry) => entry._id !== playlist._id),
  ].slice(0, MAX_RECENT_PLAYLISTS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
