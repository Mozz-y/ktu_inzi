import { getDB } from '../database/database';
import type { SQLiteRunResult } from 'expo-sqlite';

export interface HistoryItem {
  id: number;
  movie_id: number;
  watched_at: number;
}

export const HistoryRepository = {
  add: (movieId: number): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      'INSERT INTO history (movie_id) VALUES (?);',
      [movieId]
    );
  },

  getAll: (): Promise<HistoryItem[]> => {
    return getDB().getAllAsync('SELECT * FROM history ORDER BY watched_at DESC;');
  },
};