const https = require('https');

const fetchJSON = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Failed to parse response'));
      }
    });
  }).on('error', reject);
});

const mapSong = (item) => ({
  videoId: item.id?.videoId || item.id,
  title: item.snippet.title,
  channelName: item.snippet.channelTitle,
  thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
  publishedAt: item.snippet.publishedAt,
  viewCount: item.statistics?.viewCount,
});

const getApiKey = () => process.env.YOUTUBE_API_KEY;

const searchVideos = async (req, res) => {
  try {
    const { q, maxResults = 20 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({ message: 'YouTube API not configured.' });
    }

    const safeMax = Math.min(Number(maxResults) || 20, 25);
    const searchQuery = encodeURIComponent(`${q} music audio`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${searchQuery}&maxResults=${safeMax}&key=${apiKey}`;
    const data = await fetchJSON(url);

    if (data.error) {
      return res.status(502).json({ message: `YouTube API error: ${data.error.message}` });
    }

    const songs = (data.items || []).map(mapSong);
    return res.json({ songs, total: songs.length });
  } catch (error) {
    return res.status(500).json({ message: 'Error searching YouTube.' });
  }
};

const getRelated = async (req, res) => {
  try {
    const {
      title = '',
      channelName = '',
      genre = '',
      videoId = '',
      maxResults = 10,
    } = req.query;

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({ message: 'YouTube API not configured.' });
    }

    const queryParts = [title, channelName, genre, 'music'].filter(Boolean);
    if (!queryParts.length) {
      return res.status(400).json({ message: 'A song title or artist is required.' });
    }

    const safeMax = Math.min((Number(maxResults) || 10) + 4, 20);
    const searchQuery = encodeURIComponent(queryParts.join(' '));
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${searchQuery}&maxResults=${safeMax}&key=${apiKey}`;
    const data = await fetchJSON(url);

    if (data.error) {
      return res.status(502).json({ message: `YouTube API error: ${data.error.message}` });
    }

    const songs = (data.items || [])
      .map(mapSong)
      .filter((song) => song.videoId && song.videoId !== videoId)
      .slice(0, Number(maxResults) || 10);

    return res.json({ songs });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching related songs.' });
  }
};

const getTrending = async (req, res) => {
  try {
    const apiKey = getApiKey();
    const { regionCode, maxResults = 20 } = req.query;

    if (!apiKey) {
      return res.json({ songs: getMockTrending() });
    }

    const safeMax = Math.min(Number(maxResults) || 20, 25);
    const regionParam = regionCode ? `&regionCode=${encodeURIComponent(regionCode)}` : '';
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=${safeMax}${regionParam}&key=${apiKey}`;
    const data = await fetchJSON(url);

    if (data.error) {
      return res.json({ songs: getMockTrending() });
    }

    const songs = (data.items || []).map(mapSong);
    return res.json({ songs });
  } catch (error) {
    return res.json({ songs: getMockTrending() });
  }
};

const getMockTrending = () => [
  {
    videoId: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    channelName: 'Rick Astley',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  },
  {
    videoId: 'kXYiU_JCYtU',
    title: 'Linkin Park - Numb',
    channelName: 'Linkin Park',
    thumbnail: 'https://img.youtube.com/vi/kXYiU_JCYtU/mqdefault.jpg',
  },
  {
    videoId: 'hTWKbfoikeg',
    title: 'Nirvana - Smells Like Teen Spirit',
    channelName: 'Nirvana',
    thumbnail: 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg',
  },
  {
    videoId: '09R8_2nJtjg',
    title: 'Maroon 5 - Sugar',
    channelName: 'Maroon 5',
    thumbnail: 'https://img.youtube.com/vi/09R8_2nJtjg/mqdefault.jpg',
  },
  {
    videoId: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You',
    channelName: 'Ed Sheeran',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg',
  },
  {
    videoId: 'fRh_vgS2dFE',
    title: 'Justin Bieber - Sorry',
    channelName: 'Justin Bieber',
    thumbnail: 'https://img.youtube.com/vi/fRh_vgS2dFE/mqdefault.jpg',
  },
];

module.exports = {
  searchVideos,
  getTrending,
  getRelated,
};
