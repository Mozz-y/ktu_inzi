import { getDB } from '../database';

export const runInitialMigration = async (): Promise<void> => {
  const db = getDB();

  // Enable foreign key constraints (SQLite default is off)
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create movies table (if not exists)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      overview TEXT,
      poster_path TEXT,
      release_date TEXT,
      vote_average REAL,
      genres TEXT DEFAULT '[]'
    );
  `);

  // Create wishlist table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      user_id TEXT,
      added_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );
  `);

  // Create ratings table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      user_id TEXT,
      rating REAL NOT NULL,
      timestamp INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );
  `);

  // Create history table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      user_id TEXT,
      watched_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );
  `);
};