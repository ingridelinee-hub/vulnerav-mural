# Handoff: Mural de Vulnerabilidades (vulnerav.eu)

## Overview
Site para o Instagram @vulnerav.eu: um mural anônimo onde qualquer pessoa escreve algo que "não tem coragem de dizer" e o texto fica público no mural, sem identificação do autor. Outras pessoas podem curtir, comentar (também anonimamente) e marcar "eu também sinto isso".

## About the Design Files
O arquivo `Vulnera.dc.html` incluído aqui é uma **referência de design em HTML** — mostra o visual e o comportamento pretendido, não é código de produção para copiar direto. A tarefa é recriar este design em React (ou framework equivalente) com um backend real, usando os padrões descritos abaixo. Hoje o protótipo só guarda estado no navegador (não persiste, não é compartilhado entre visitantes) — é isso que o backend precisa resolver.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamento e microinterações do protótipo devem ser recriados com precisão.

## Arquitetura recomendada
- **Frontend**: qualquer framework (React/Next.js recomendado para deploy simples na Netlify).
- **Hospedagem**: Netlify.
- **Backend**: Netlify Functions (serverless) — endpoints simples, sem autenticação de usuário (não há login).
- **Banco de dados**: Supabase (Postgres gerenciado, tem free tier, fácil de integrar com Netlify Functions via REST/SDK).
- **Sem moderação automática nesta versão** — publicação é instantânea (decisão confirmada com o cliente).

## Modelo de dados (Supabase / Postgres)

**Tabela `posts`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid, PK | gerado no insert |
| text | text | conteúdo do post, obrigatório |
| created_at | timestamptz | default now() |
| likes_count | int | default 0 |
| feels_count | int | contador de "eu também sinto isso", default 0 |

**Tabela `comments`**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid, PK | |
| post_id | uuid, FK -> posts.id | |
| text | text | obrigatório |
| created_at | timestamptz | default now() |

Não há tabela de usuários — não existe login. Likes e "feels" não têm dedupe por usuário nesta versão (qualquer clique soma 1); se quiser evitar múltiplos cliques da mesma pessoa, usar um id anônimo gerado e salvo em localStorage do navegador (não pede login, só evita spam de clique).

## Endpoints (Netlify Functions)
- `GET /api/posts` — lista posts, mais recentes primeiro, com contagem de comentários.
- `POST /api/posts` — cria post. Body: `{ text: string }`. Validar texto não vazio, limitar tamanho (ex: 500 caracteres). Retorna o post criado.
- `POST /api/posts/:id/like` — incrementa likes_count.
- `POST /api/posts/:id/feel` — incrementa feels_count.
- `GET /api/posts/:id/comments` — lista comentários do post.
- `POST /api/posts/:id/comments` — cria comentário. Body: `{ text: string }`.

Nenhum endpoint expõe IP, user-agent ou qualquer identificador do autor no payload de resposta — isso é o requisito central do produto (anonimato).

## Screens / Views

### 1. Início (Home)
- **Propósito**: apresentar o projeto e levar ao mural.
- **Layout**: seção única, full height, fundo escuro (`var(--color-neutral-900)` do design system Classical) com um glow radial quente no topo (cor de acento, ~35% de mistura, transparente nas bordas) e ~8 retângulos "papel" espalhados ao fundo, rotacionados aleatoriamente (entre -20° e 20°), opacidade baixa (0.07–0.1), com linhas horizontais repetidas simulando texto borrado.
- **Conteúdo (texto exato)**:
  - Kicker: "um projeto de @vulnerav.eu"
  - H1: "Um mural para o que você não tem coragem de dizer"
  - Parágrafo: "Escreva o que pesa. Ninguém saberá quem é você, nem nós. Sua confissão fica no mural para que outras pessoas possam ler, e talvez se reconhecer nela."
  - Botão primário: "Entrar no mural" → navega para /mural
  - Nota de rodapé: "Nenhum post é assinado. Nenhum post é revisado antes de aparecer. O que você escrever aqui é só seu, até o momento em que se torna de todos."
- **Tipografia**: H1 em Cormorant Garamond (font-heading), 56px, peso normal (display size usa o corte normal, não semibold). Corpo em Lora (font-body), 19px.

### 2. Mural
- **Propósito**: compor um post e ler o feed.
- **Layout**: mesmo fundo escuro com glow, um "varal" decorativo no topo (linha horizontal fina, 3 pregadores de roupa em CSS — ver `Vulnera.dc.html` para a forma exata: retângulo com gradiente + linha da mola + fenda central), depois um container centralizado max-width 680px com:
  1. Card de composição (fundo claro `var(--color-bg)`, borda 1px), textarea + botão "Publicar anonimamente" (desabilitado se vazio).
  2. Feed de posts, mais recente primeiro, cada post é um card (mesmo fundo claro) "pendurado" por um pregador no topo central, com leve rotação individual (entre -1.2° e 1.2°, variando por post).
- **Cada card de post contém**:
  - Timestamp relativo (ex: "há 2 horas")
  - Texto do post
  - Barra de ações: curtir (ícone coração + contador), comentar (ícone balão + contador, abre/fecha lista de comentários), "eu também sinto isso" (ícone + contador)
  - Ao abrir comentários: lista de comentários (anônimos) + campo de texto + botão "Enviar"

## Interactions & Behavior
- Publicar post: limpa o textarea, insere no topo do feed, timestamp "agora mesmo".
- Curtir / "eu também sinto isso": toggle visual no protótipo; no backend real deve ser um incremento (ver nota sobre dedupe acima).
- Comentar: expande uma seção inline abaixo do post; envio limpa o campo e adiciona à lista.
- Sem loading states desenhados — adicionar spinners/estados de carregamento ao integrar com API real (lista de posts, envio de post/comentário).
- Sem estado de erro desenhado — adicionar mensagem de erro amigável se a API falhar (ex: "não foi possível publicar, tente novamente").

## Design Tokens
Vêm do design system **Classical**, já linkado no protótipo (`_ds/classical-.../styles.css`):
- Fundo claro: `--color-bg` (#f3f2f2), texto `--color-text` (#201f1d)
- Acento: `--color-accent` (#b68235), com ramp 100–900
- Fundo escuro (mural/home): `--color-neutral-900`
- Fonte de título: Cormorant Garamond (`--font-heading`), corpo: Lora (`--font-body`)
- Espaçamento: `--space-1` a `--space-8`
- Ícones: Lucide (heart, message-circle, hand-heart)

## Assets
Nenhuma imagem real — os "papéis" e "pregadores" são formas CSS simples (retângulos, gradientes, linhas), sem SVGs externos.

## Files
- `Vulnera.dc.html` — protótipo completo (HTML), referência de layout, estilos inline e comportamento. Abrir em qualquer navegador.
