import { getDB } from '../database/database';
import type { SQLiteRunResult } from 'expo-sqlite';

export interface WishlistItem {
  id: number;
  movie_id: number;
  added_at: number;
}

export const WishlistRepository = {
  add: (movieId: number): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      'INSERT INTO wishlist (movie_id) VALUES (?);',
      [movieId]
    );
  },

  remove: (movieId: number): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      'DELETE FROM wishlist WHERE movie_id = ?;',
      [movieId]
    );
  },

  getAll: (): Promise<WishlistItem[]> => {
    return getDB().getAllAsync('SELECT * FROM wishlist ORDER BY added_at DESC;');
  },

  exists: async (movieId: number): Promise<boolean> => {
    const result = await getDB().getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM wishlist WHERE movie_id = ?;',
      [movieId]
    );
    return (result?.count ?? 0) > 0;
  },
};