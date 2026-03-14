const https = require('https');

const fetchJSON = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (error) {
          reject(new Error('Failed to parse lyrics response'));
        }
      });
    }).on('error', reject);
  });

const uniqueValues = (values) => [...new Set(values.filter(Boolean).map((value) => value.trim()).filter(Boolean))];

const cleanTitleVariants = (title = '') => {
  const decoded = title
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"');

  const withoutBrackets = decoded.replace(/\(.*?\)|\[.*?\]|\{.*?\}/g, ' ').replace(/\s+/g, ' ').trim();
  const withoutDecorators = withoutBrackets
    .replace(/\b(official|video|audio|lyrics|lyrical|visualizer|remix|full song|full video song|slowed|reverb)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return uniqueValues([
    withoutDecorators,
    withoutDecorators.split('|')[0],
    withoutDecorators.split('-')[0],
    withoutDecorators.split(':')[0],
  ]);
};

const cleanArtistVariants = (artist = '', title = '') => {
  const normalizedArtist = artist
    .replace(/VEVO|Topic|Official|Music|Records/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const artistFromTitle = title.includes('-') ? title.split('-')[0] : '';

  return uniqueValues([
    normalizedArtist,
    normalizedArtist.split(',')[0],
    normalizedArtist.split('&')[0],
    artistFromTitle,
  ]);
};

const getLyrics = async (req, res) => {
  try {
    const { title = '', artist = '' } = req.query;

    if (!title.trim() || !artist.trim()) {
      return res.status(400).json({ message: 'Song title and artist are required.' });
    }

    const attempts = [];
    const titleVariants = cleanTitleVariants(title);
    const artistVariants = cleanArtistVariants(artist, title);

    for (const candidateArtist of artistVariants) {
      for (const candidateTitle of titleVariants) {
        attempts.push({ artist: candidateArtist, title: candidateTitle });
      }
    }

    for (const attempt of attempts) {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(attempt.artist)}/${encodeURIComponent(attempt.title)}`;
      const response = await fetchJSON(url);

      if (response.statusCode >= 200 && response.statusCode < 300 && response.data?.lyrics) {
        return res.json({
          lyrics: response.data.lyrics,
          matched: attempt,
          source: 'lyrics.ovh',
        });
      }
    }

    return res.status(404).json({
      message: 'Lyrics not available for this song.',
      attempts,
    });
  } catch (error) {
    console.error('Lyrics lookup error:', error.message);
    return res.status(500).json({ message: 'Error fetching lyrics.' });
  }
};

module.exports = { getLyrics };
