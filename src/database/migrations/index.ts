import { getDB } from '../database';
import { runInitialMigration } from './initial';

interface Migration {
  version: number;
  up: () => Promise<void>;
}

const migrations: Migration[] = [
  { version: 1, up: runInitialMigration },
  // Future migrations go here with higher version numbers
];

export const runMigrations = async (): Promise<void> => {
  const db = getDB();

  // Ensure migrations table exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Get already applied versions
  const appliedRows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM migrations ORDER BY version;'
  );
  const appliedVersions = new Set(appliedRows.map(row => row.version));

  // Run pending migrations
  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      console.log(`[Migration] Running version ${migration.version}...`);
      await migration.up();
      await db.runAsync('INSERT INTO migrations (version) VALUES (?);', [migration.version]);
      console.log(`[Migration] Version ${migration.version} applied.`);
    }
  }
};