-- Questions library
create table questions (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null check (category in ('flix','engineering','personal','fun','custom')),
  created_at timestamptz default now()
);

-- Games
create table games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  played_at timestamptz,
  status text not null default 'draft' check (status in ('draft','lobby','live','ended')),
  created_at timestamptz default now()
);

-- Questions selected for a game (20 per game)
create table game_questions (
  game_id uuid references games(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  position int not null,
  primary key (game_id, question_id)
);

-- Player groups
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('event','team','custom')),
  description text,
  created_at timestamptz default now()
);

-- Players (one row per person)
create table players (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  group_id uuid references groups(id),
  created_at timestamptz default now()
);

-- Truth profile: which questions are true for each player per game
create table player_truths (
  player_id uuid references players(id) on delete cascade,
  game_id uuid references games(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  primary key (player_id, game_id, question_id)
);

-- Each player's bingo card for a game (16 of the 20 questions, randomly assigned)
create table player_cards (
  player_id uuid references players(id) on delete cascade,
  game_id uuid references games(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  position int not null check (position between 1 and 16),
  claimed_at timestamptz,
  claimed_by_player_id uuid references players(id),
  primary key (player_id, game_id, question_id)
);

-- Aggregated stats (kept permanently, no PII)
create table game_analytics (
  game_id uuid primary key references games(id),
  played_at timestamptz,
  player_count int,
  bingo_count int,
  avg_completion_seconds int,
  participation_rate numeric(5,2),
  squares_heatmap jsonb
);

-- Per-player hashed stats (kept permanently, no PII)
create table player_game_stats (
  game_id uuid references games(id) on delete cascade,
  player_hash text not null,
  squares_claimed int default 0,
  completion_seconds int,
  got_bingo boolean default false,
  primary key (game_id, player_hash)
);
