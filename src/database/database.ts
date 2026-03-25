import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

const db = SQLite.openDatabaseSync('movies.db');
const isDevelopment = __DEV__;

export const initDatabase = async (): Promise<void> => {
  try {
    // Test query to verify connection
    await db.execAsync('SELECT 1');
    if (isDevelopment) {
      console.log('[Database] Connected and test query succeeded.');
    }

    // Run migrations
    await runMigrations();
    if (isDevelopment) {
      console.log('[Database] Migrations completed.');
    }
  } catch (error) {
    if (isDevelopment) {
      console.error('[Database] Initialization failed:', error);
    }
    throw error;
  }
};

export const getDB = () => db;