import * as SQLite from 'expo-sqlite';

// Open the database synchronously; it creates the file if it doesn't exist.
const db = SQLite.openDatabaseSync('movies.db');

const isDevelopment = __DEV__;

/**
 * Initialize the database: run a test query to verify connection.
 */
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Use execAsync for statements that don't return data
    db.execAsync('SELECT 1')
      .then(() => {
        if (isDevelopment) {
          console.log('[Database] Connected and test query succeeded.');
        }
        resolve();
      })
      .catch((error) => {
        if (isDevelopment) {
          console.error('[Database] Test query failed:', error);
        }
        reject(error);
      });
  });
};

/**
 * Export the database instance for use in repositories.
 */
export const getDB = () => db;