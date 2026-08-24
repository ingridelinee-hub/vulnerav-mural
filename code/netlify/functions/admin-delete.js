const { getClient } = require('./_supabase');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const body = JSON.parse(event.body || '{}');
  if (body.password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'senha incorreta' }) };
  }
  const postId = body.postId;
  if (!postId) return { statusCode: 400, body: JSON.stringify({ error: 'postId faltando' }) };

  const supabase = getClient();
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
