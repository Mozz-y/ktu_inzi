import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { runMigrations } from './migrations';

const isDevelopment = __DEV__;
const isWeb = Platform.OS === 'web';

const db = isWeb ? null : SQLite.openDatabaseSync('movies.db');

export const initDatabase = async (): Promise<void> => {
  if (isWeb) {
    if (isDevelopment) {
      console.log('[Database] Web platform detected. SQLite initialization skipped.');
    }
    return;
  }

  try {
    if (!db) {
      throw new Error('Database is not available.');
    }

    await db.execAsync('SELECT 1');

    if (isDevelopment) {
      console.log('[Database] Connected and test query succeeded.');
    }

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

export const getDB = () => {
  if (!db) {
    throw new Error('Database is not available on web platform.');
  }

  return db;
};