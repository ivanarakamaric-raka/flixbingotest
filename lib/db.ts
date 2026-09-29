import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'flixbingo.db')

let _db: Database.Database | null = null

export function db(): Database.Database {
  if (_db) return _db

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  migrate(_db)
  return _db
}

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      text TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('flix','engineering','personal','fun','custom')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      played_at TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','lobby','live','ended')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_questions (
      game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
      question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      PRIMARY KEY (game_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS player_truths (
      player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
      game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
      question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
      PRIMARY KEY (player_id, game_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS player_cards (
      player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
      game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
      question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
      position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 16),
      claimed_at TEXT,
      claimed_by_player_id TEXT REFERENCES players(id),
      PRIMARY KEY (player_id, game_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS game_analytics (
      game_id TEXT PRIMARY KEY REFERENCES games(id),
      played_at TEXT,
      player_count INTEGER,
      bingo_count INTEGER,
      avg_completion_seconds INTEGER,
      participation_rate REAL,
      squares_heatmap TEXT
    );

    CREATE TABLE IF NOT EXISTS player_game_stats (
      game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
      player_hash TEXT NOT NULL,
      squares_claimed INTEGER DEFAULT 0,
      completion_seconds INTEGER,
      got_bingo INTEGER DEFAULT 0,
      PRIMARY KEY (game_id, player_hash)
    );
  `)

  // Seed questions if empty
  const count = (d.prepare('SELECT COUNT(*) as n FROM questions').get() as { n: number }).n
  if (count === 0) {
    const insert = d.prepare(
      `INSERT INTO questions (id, text, category) VALUES (lower(hex(randomblob(16))), ?, ?)`
    )
    const seedMany = d.transaction((rows: [string, string][]) => {
      for (const [text, category] of rows) insert.run(text, category)
    })
    seedMany([
      ['Joined Flix before 2020', 'flix'],
      ['First-ever FlixTech Summit', 'flix'],
      ['Has worked in more than one Flix stream', 'flix'],
      ['Took a Flix bus as a customer in the last year', 'flix'],
      ['At Flix for less than 6 months', 'flix'],
      ["Knows what FPL stands for — without Googling", 'flix'],
      ['Has collaborated with someone from all 3 divisions', 'flix'],
      ['Works in a different division than you', 'flix'],
      ['Deployed on a Friday and survived', 'engineering'],
      ['Has code from 3+ years ago still running in production', 'engineering'],
      ['Has filed or been on-call for a P0 incident', 'engineering'],
      ['Uses AI tools for coding every single day', 'engineering'],
      ['Has a side project running in production right now', 'engineering'],
      ['Submitted a PR this week that was 1–5 lines', 'engineering'],
      ['Has a strong opinion about a tech choice most people don\'t think about', 'engineering'],
      ['Has written documentation that someone else actually read and used', 'engineering'],
      ['Currently has more than 10 browser tabs open about work', 'engineering'],
      ['Has given a talk at an internal or external tech event in the last 12 months', 'engineering'],
      ['Speaks 3 or more languages', 'personal'],
      ['Has lived in more than 2 countries', 'personal'],
      ['Traveled more than 5 hours to get here today', 'personal'],
      ['Meeting a teammate in person for the very first time today', 'personal'],
      ['Has been to more than 5 countries in the last 2 years', 'fun'],
      ['Has cooked a meal for more than 10 people', 'fun'],
      ['Owns a pet', 'fun'],
      ['Has run a half marathon or longer', 'fun'],
      ['Can play a musical instrument', 'fun'],
      ['Has watched a sunrise this year (intentionally)', 'fun'],
      ['Prefers dark mode on everything', 'fun'],
      ['Has a morning routine that starts before 6am', 'fun'],
      ['Has read a non-fiction book in the last month', 'fun'],
      ['Has fixed something at home with duct tape or improvised tools', 'fun'],
      ["Can solve a Rubik's cube", 'fun'],
      ["Works in a city you've never visited", 'custom'],
    ])
  }
}
