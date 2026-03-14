import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { trending, search, genre, limit = 50 } = req.query;
      
      let query = supabase.from('songs').select('*');
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`);
      }
      
      if (genre && genre !== 'all') {
        query = query.eq('genre', genre);
      }
      
      if (trending === 'true') {
        query = query.order('play_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      query = query.limit(parseInt(limit));
      
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const song = req.body;
      const { data, error } = await supabase.from('songs').insert(song).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
