import { getDB } from '../database';
import { runInitialMigration } from './initial';
import { addUserSupport } from './002_add_user_support';

interface Migration {
  version: number;
  up: () => Promise<void>;
}

const migrations: Migration[] = [
  { version: 1, up: runInitialMigration },
  { version: 2, up: addUserSupport },
];

export const runMigrations = async (): Promise<void> => {
  const db = getDB();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  const appliedRows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM migrations ORDER BY version;'
  );
  const appliedVersions = new Set(appliedRows.map(row => row.version));

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      console.log(`[Migration] Running version ${migration.version}...`);
      await migration.up();
      await db.runAsync('INSERT INTO migrations (version) VALUES (?);', [migration.version]);
      console.log(`[Migration] Version ${migration.version} applied.`);
    }
  }
};