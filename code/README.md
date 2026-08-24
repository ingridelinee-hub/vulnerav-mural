# vulnerav-mural — código

Site estático (index.html) + Netlify Functions + Supabase.

## Configurar

1. No Netlify: Site settings → Environment variables → adicionar `SUPABASE_URL` e `SUPABASE_ANON_KEY` (do painel do Supabase, em Project Settings → API).
2. No Supabase: garantir que as tabelas `posts` e `comments` existem (ver design_handoff/README.md) e que RLS permite insert/select públicos.
3. Deploy: conectar este repositório no Netlify — ele lê o `netlify.toml` e sobe tudo automaticamente.

## Estrutura
- `index.html` — frontend (mural + página inicial)
- `netlify/functions/` — endpoints serverless (posts, like, feel, comments)
- `netlify.toml` — mapeia /api/* para as functions
