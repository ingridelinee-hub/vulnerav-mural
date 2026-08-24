const { getClient } = require('./_supabase');

exports.handler = async (event) => {
  const supabase = getClient();

  if (event.httpMethod === 'GET') {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, text, created_at, likes_count, feels_count')
      .order('created_at', { ascending: false });
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };

    const { data: comments } = await supabase.from('comments').select('post_id');
    const counts = {};
    (comments || []).forEach(c => { counts[c.post_id] = (counts[c.post_id] || 0) + 1; });

    const result = posts.map(p => ({ ...p, comments_count: counts[p.id] || 0 }));
    return { statusCode: 200, body: JSON.stringify(result) };
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const text = (body.text || '').trim();
    if (!text) return { statusCode: 400, body: JSON.stringify({ error: 'texto vazio' }) };
    if (text.length > 500) return { statusCode: 400, body: JSON.stringify({ error: 'texto muito longo' }) };

    const { data, error } = await supabase
      .from('posts')
      .insert({ text })
      .select()
      .single();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
