import { getDB } from '../database';

export const addGenres = async (): Promise<void> => {
  const db = getDB();

  // Add genre column to movies table (will store as JSON array string)
  try {
    await db.execAsync(`
      ALTER TABLE movies ADD COLUMN genres TEXT DEFAULT '[]';
    `);
  } catch (err) {
    // Column might already exist, ignore error
  }
};
