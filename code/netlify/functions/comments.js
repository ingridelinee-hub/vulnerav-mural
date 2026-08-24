const { getClient } = require('./_supabase');

exports.handler = async (event) => {
  const supabase = getClient();

  if (event.httpMethod === 'GET') {
    const postId = (event.queryStringParameters || {}).postId;
    const { data, error } = await supabase
      .from('comments')
      .select('id, text, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const postId = body.postId;
    const text = (body.text || '').trim();
    if (!text) return { statusCode: 400, body: JSON.stringify({ error: 'texto vazio' }) };
    if (text.length > 500) return { statusCode: 400, body: JSON.stringify({ error: 'texto muito longo' }) };

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, text })
      .select()
      .single();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
