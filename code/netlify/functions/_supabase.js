const { createClient } = require('@supabase/supabase-js');

function getClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

module.exports = { getClient };
