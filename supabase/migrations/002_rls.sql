alter table questions enable row level security;
alter table games enable row level security;
alter table game_questions enable row level security;
alter table groups enable row level security;
alter table players enable row level security;
alter table player_truths enable row level security;
alter table player_cards enable row level security;
alter table game_analytics enable row level security;
alter table player_game_stats enable row level security;

-- Players can read questions
create policy "questions_read" on questions for select using (true);

-- Players can read live games
create policy "games_read" on games for select using (status in ('lobby','live'));

-- Players can read game questions for live games
create policy "game_questions_read" on game_questions for select using (
  exists (select 1 from games where id = game_id and status in ('lobby','live'))
);

-- Players can read and write their own truths
create policy "player_truths_own" on player_truths
  using (player_id = (select id from players where email = auth.jwt()->>'email'))
  with check (player_id = (select id from players where email = auth.jwt()->>'email'));

-- Players can read their own card
create policy "player_cards_read_own" on player_cards for select
  using (player_id = (select id from players where email = auth.jwt()->>'email'));

-- Groups + players readable by authenticated users
create policy "groups_read" on groups for select using (auth.role() = 'authenticated');
create policy "players_read" on players for select using (auth.role() = 'authenticated');

-- Analytics readable by all (no PII)
create policy "analytics_read" on game_analytics for select using (true);
create policy "stats_read" on player_game_stats for select using (true);
