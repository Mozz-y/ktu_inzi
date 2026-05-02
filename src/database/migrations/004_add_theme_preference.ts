import { getDB } from '../database';

export const addThemePreference = async (): Promise<void> => {
  const db = getDB();

  await db.execAsync(`
    ALTER TABLE users
    ADD COLUMN theme_preference TEXT NOT NULL DEFAULT 'system'
    CHECK (theme_preference IN ('light', 'dark', 'system'));
  `);
};
