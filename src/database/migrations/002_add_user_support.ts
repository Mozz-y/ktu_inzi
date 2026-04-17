import { getDB } from '../database';

export const addUserSupport = async (): Promise<void> => {
  const db = getDB();

  // Enable foreign keys (already enabled in previous migration, but safe)
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create users table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Add user_id column to existing tables (if they don't already have it)
  // We wrap in a try-catch because the column might already exist from the initial migration
  try {
    await db.execAsync(`
      ALTER TABLE wishlist ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    `);
  } catch (err) {
    // Column already exists, ignore error
  }

  try {
    await db.execAsync(`
      ALTER TABLE ratings ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    `);
  } catch (err) {
    // Column already exists, ignore error
  }

  try {
    await db.execAsync(`
      ALTER TABLE history ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    `);
  } catch (err) {
    // Column already exists, ignore error
  }
};