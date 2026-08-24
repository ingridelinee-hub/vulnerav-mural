const { getClient } = require('./_supabase');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const postId = event.queryStringParameters.postId;
  const supabase = getClient();

  const { data: post, error: fetchErr } = await supabase.from('posts').select('feels_count').eq('id', postId).single();
  if (fetchErr) return { statusCode: 404, body: JSON.stringify({ error: 'post não encontrado' }) };

  const { data, error } = await supabase
    .from('posts')
    .update({ feels_count: (post.feels_count || 0) + 1 })
    .eq('id', postId)
    .select()
    .single();
  if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, body: JSON.stringify(data) };
};
