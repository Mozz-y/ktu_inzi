import { getDB } from '../database';

export const addSupabaseSyncSupport = async (): Promise<void> => {
  const db = getDB();

  try {
    await db.execAsync(`
      ALTER TABLE users ADD COLUMN supabase_user_id TEXT;
    `);
  } catch {
    // Column already exists.
  }

  try {
    await db.execAsync(`
      ALTER TABLE users ADD COLUMN email TEXT;
    `);
  } catch {
    // Column already exists.
  }

  try {
    await db.execAsync(`
      ALTER TABLE users ADD COLUMN last_sync_at INTEGER;
    `);
  } catch {
    // Column already exists.
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      attempt_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT
    );
  `);
};
