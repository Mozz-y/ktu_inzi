import { getDB } from '../database/database';
import type { SQLiteRunResult } from 'expo-sqlite';

export interface WishlistItem {
  id: number;
  movie_id: number;
  user_id: string;
  added_at: number;
}

export const WishlistRepository = {
  add: (movieId: number, userId: string): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      'INSERT INTO wishlist (movie_id, user_id) VALUES (?, ?);',
      [movieId, userId]
    );
  },

  remove: (movieId: number, userId: string): Promise<SQLiteRunResult> => {
    return getDB().runAsync(
      'DELETE FROM wishlist WHERE movie_id = ? AND user_id = ?;',
      [movieId, userId]
    );
  },

  getAll: (userId: string): Promise<WishlistItem[]> => {
    return getDB().getAllAsync(
      'SELECT * FROM wishlist WHERE user_id = ? ORDER BY added_at DESC;',
      [userId]
    );
  },

  exists: async (movieId: number, userId: string): Promise<boolean> => {
    const result = await getDB().getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM wishlist WHERE movie_id = ? AND user_id = ?;',
      [movieId, userId]
    );
    return (result?.count ?? 0) > 0;
  },
};