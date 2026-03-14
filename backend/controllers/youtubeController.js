// ============================================================
// controllers/youtubeController.js — YouTube API Proxy
// ============================================================
// WHY a proxy? Because you don't want to expose your YouTube API key
// to the frontend (anyone could steal it). All requests go through
// your backend instead, which adds the key server-side.

const https = require('https');

// Helper to make HTTPS GET requests (no extra package needed)
const fetchJSON = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse response')); }
      });
    }).on('error', reject);
  });

// GET /api/youtube/search?q=query — Search YouTube videos
const searchVideos = async (req, res) => {
  try {
    const { q, maxResults = 20 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'YouTube API not configured.' });
    }

    const searchQuery = encodeURIComponent(q + ' music audio');
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${searchQuery}&maxResults=${maxResults}&key=${apiKey}`;

    const data = await fetchJSON(url);

    if (data.error) {
      console.error('YouTube API error:', data.error);
      return res.status(502).json({ message: 'YouTube API error: ' + data.error.message });
    }

    // Transform YouTube's complex response into a clean format
    const songs = (data.items || []).map((item) => ({
      videoId:     item.id.videoId,
      title:       item.snippet.title,
      channelName: item.snippet.channelTitle,
      thumbnail:   item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json({ songs, total: songs.length });
  } catch (error) {
    console.error('YouTube search error:', error.message);
    res.status(500).json({ message: 'Error searching YouTube.' });
  }
};

// GET /api/youtube/related?title=...&channelName=...&genre=...&videoId=...
const getRelated = async (req, res) => {
  try {
    const {
      title = '',
      channelName = '',
      genre = '',
      videoId = '',
      maxResults = 10,
    } = req.query;

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'YouTube API not configured.' });
    }

    const queryParts = [title, channelName, genre, 'music'].filter(Boolean);
    if (!queryParts.length) {
      return res.status(400).json({ message: 'A song title or artist is required.' });
    }

    const searchQuery = encodeURIComponent(queryParts.join(' '));
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${searchQuery}&maxResults=${Math.min(Number(maxResults) + 4, 20)}&key=${apiKey}`;
    const data = await fetchJSON(url);

    if (data.error) {
      console.error('YouTube related error:', data.error);
      return res.status(502).json({ message: `YouTube API error: ${data.error.message}` });
    }

    const songs = (data.items || [])
      .map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        publishedAt: item.snippet.publishedAt,
      }))
      .filter((song) => song.videoId && song.videoId !== videoId)
      .slice(0, Number(maxResults));

    return res.json({ songs });
  } catch (error) {
    console.error('YouTube related error:', error.message);
    return res.status(500).json({ message: 'Error fetching related songs.' });
  }
};

// GET /api/youtube/trending — Get trending music videos
const getTrending = async (req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key — useful for development
      return res.json({ songs: getMockTrending() });
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${apiKey}`;
    const data = await fetchJSON(url);

    if (data.error) {
      return res.json({ songs: getMockTrending() }); // Fallback to mock
    }

    const songs = (data.items || []).map((item) => ({
      videoId:     item.id,
      title:       item.snippet.title,
      channelName: item.snippet.channelTitle,
      thumbnail:   item.snippet.thumbnails?.medium?.url,
      viewCount:   item.statistics?.viewCount,
    }));

    res.json({ songs });
  } catch (error) {
    res.json({ songs: getMockTrending() }); // Always return something
  }
};

// Mock data for when YouTube API is not configured
// Great for development/testing without burning API quota
const getMockTrending = () => [
  { videoId: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', channelName: 'Rick Astley', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
  { videoId: 'kXYiU_JCYtU', title: 'Linkin Park - Numb', channelName: 'Linkin Park', thumbnail: 'https://img.youtube.com/vi/kXYiU_JCYtU/mqdefault.jpg' },
  { videoId: 'hTWKbfoikeg', title: 'Nirvana - Smells Like Teen Spirit', channelName: 'Nirvana', thumbnail: 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg' },
  { videoId: '09R8_2nJtjg', title: 'Maroon 5 - Sugar', channelName: 'Maroon 5', thumbnail: 'https://img.youtube.com/vi/09R8_2nJtjg/mqdefault.jpg' },
  { videoId: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', channelName: 'Ed Sheeran', thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg' },
  { videoId: 'fRh_vgS2dFE', title: 'Justin Bieber - Sorry', channelName: 'Justin Bieber', thumbnail: 'https://img.youtube.com/vi/fRh_vgS2dFE/mqdefault.jpg' },
];

module.exports = { searchVideos, getTrending, getRelated };
