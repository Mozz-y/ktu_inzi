import { getDB } from '../database/database';
import type { SQLiteRunResult } from 'expo-sqlite';

export interface Rating {
  id: number;
  movie_id: number;
  rating: number;
  timestamp: number;
}

export const RatingsRepository = {
  setRating: (movieId: number, rating: number): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      `INSERT OR REPLACE INTO ratings (movie_id, rating, timestamp)
       VALUES (?, ?, strftime('%s', 'now'));`,
      [movieId, rating]
    );
  },

  getRating: (movieId: number): Promise<Rating | null> => {
    return getDB().getFirstAsync<Rating>(
      'SELECT * FROM ratings WHERE movie_id = ?;',
      [movieId]
    );
  },

  getAll: (): Promise<Rating[]> => {
    return getDB().getAllAsync('SELECT * FROM ratings ORDER BY timestamp DESC;');
  },
};