alter table questions enable row level security;
alter table games enable row level security;
alter table game_questions enable row level security;
alter table groups enable row level security;
alter table players enable row level security;
alter table player_truths enable row level security;
alter table player_cards enable row level security;
alter table game_analytics enable row level security;
alter table player_game_stats enable row level security;

-- All reads are open (no PII beyond display name)
create policy "questions_read" on questions for select using (true);
create policy "games_read" on games for select using (status in ('lobby','live'));
create policy "game_questions_read" on game_questions for select using (
  exists (select 1 from games where id = game_id and status in ('lobby','live'))
);
create policy "players_read" on players for select using (true);
create policy "groups_read" on groups for select using (true);
create policy "player_truths_read" on player_truths for select using (true);
create policy "player_cards_read" on player_cards for select using (true);
create policy "analytics_read" on game_analytics for select using (true);
create policy "stats_read" on player_game_stats for select using (true);

-- All writes go through the admin client (service role key) which bypasses RLS
