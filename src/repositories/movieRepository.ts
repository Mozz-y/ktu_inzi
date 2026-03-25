import { getDB } from '../database/database';
import type { SQLiteRunResult } from 'expo-sqlite';

export interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
}

export const MovieRepository = {
  createTable: (): Promise<void> => {
    // This is already handled by migration, but kept for completeness
    return getDB().execAsync(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        overview TEXT,
        poster_path TEXT,
        release_date TEXT,
        vote_average REAL
      );
    `);
  },

  insert: (movie: Movie): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      `INSERT OR REPLACE INTO movies (id, title, overview, poster_path, release_date, vote_average)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        movie.id,
        movie.title,
        movie.overview ?? null,
        movie.poster_path ?? null,
        movie.release_date ?? null,
        movie.vote_average ?? null,
      ]
    );
  },

  getAll: (): Promise<Movie[]> => {
    return getDB().getAllAsync('SELECT * FROM movies;');
  },

  getById: (id: number): Promise<Movie | null> => {
    return getDB().getFirstAsync<Movie>('SELECT * FROM movies WHERE id = ?;', [id]);
  },
};