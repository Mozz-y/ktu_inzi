import { getDB } from '../database/database';
import type { SQLiteRunResult } from 'expo-sqlite';

export interface HistoryItem {
  id: number;
  movie_id: number;
  user_id: string;
  watched_at: number;
}

export const HistoryRepository = {
  add: (movieId: number, userId: string): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      'INSERT INTO history (movie_id, user_id) VALUES (?, ?);',
      [movieId, userId]
    );
  },

  addWithTimestamp: (movieId: number, userId: string, watchedAt: number): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      'INSERT OR REPLACE INTO history (movie_id, user_id, watched_at) VALUES (?, ?, ?);',
      [movieId, userId, watchedAt]
    );
  },

  remove: (movieId: number, userId: string): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
        'DELETE FROM history WHERE movie_id = ? AND user_id = ?;',
        [movieId, userId]
    );
  },

  getAll: (userId: string): Promise<HistoryItem[]> => {
    return getDB().getAllAsync(
      'SELECT * FROM history WHERE user_id = ? ORDER BY watched_at DESC;',
      [userId]
    );
  },

  clearAll: (userId: string): Promise<SQLiteRunResult> => {
    return getDB().runAsync('DELETE FROM history WHERE user_id = ?;', [userId]);
  },
};
