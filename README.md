# FlixBingo

Mobile web human bingo for FlixTech Summit 2026 (Nov 18, Smart Village Berlin). Players join by entering their name, tag each other by scanning QR codes, and fill their bingo card.

## Stack

- Next.js 16 · TypeScript · Tailwind CSS
- Supabase (PostgreSQL + Realtime) — Frankfurt region
- Cookie-based session (no SSO required)
- Hosted on Railway

## Local development

```bash
cp .env.local.example .env.local   # fill in credentials
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run migrations once against your Supabase project — paste `supabase/migrations/001_schema.sql`, `002_rls.sql`, `003_seed_questions.sql` into the Supabase SQL editor in order.

## Required env vars

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `SESSION_SECRET` | Random secret — `openssl rand -hex 32` |
| `ADMIN_PLAYER_IDS` | Comma-separated player UUIDs with admin access |

## Deployment (Railway)

1. Push this repo to GitHub
2. New Railway project → Deploy from GitHub repo
3. Add env vars above in Railway → Variables
4. Railway auto-detects Next.js — no config needed
5. After first deploy: join the app, find your UUID in Supabase `players` table, set `ADMIN_PLAYER_IDS`

## Admin access

Admin panel at `/admin`. Access controlled by `ADMIN_PLAYER_IDS` — set after joining the game for the first time.
