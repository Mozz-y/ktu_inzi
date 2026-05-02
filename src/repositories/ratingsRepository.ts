import type { SQLiteRunResult } from 'expo-sqlite';
import { getDB } from '../database/database';

export interface Rating {
  id: number;
  movie_id: number;
  user_id: string;
  rating: number;
  timestamp: number;
}

export const RatingsRepository = {
  setRating: async (movieId: number, rating: number, userId: string): Promise<SQLiteRunResult> => {
    const timestamp = Math.floor(Date.now() / 1000);
    const updateResult = await getDB().runAsync(
      'UPDATE ratings SET rating = ?, timestamp = ? WHERE movie_id = ? AND user_id = ?;',
      [rating, timestamp, movieId, userId]
    );

    if (updateResult.changes === 0) {
      return getDB().runAsync(
        `INSERT INTO ratings (movie_id, user_id, rating, timestamp)
         VALUES (?, ?, ?, ?);`,
        [movieId, userId, rating, timestamp]
      );
    }

    return updateResult;
  },

  getRating: (movieId: number, userId: string): Promise<Rating | null> => {
    return getDB().getFirstAsync<Rating>(
      'SELECT * FROM ratings WHERE movie_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 1;',
      [movieId, userId]
    );
  },

  remove: (movieId: number, userId: string): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      'DELETE FROM ratings WHERE movie_id = ? AND user_id = ?;',
      [movieId, userId]
    );
},

  getAll: (userId: string): Promise<Rating[]> => {
    return getDB().getAllAsync(
      'SELECT * FROM ratings WHERE user_id = ? ORDER BY timestamp DESC;',
      [userId]
    );
  },
};