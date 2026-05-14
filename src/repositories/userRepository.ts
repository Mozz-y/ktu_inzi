import { getDB } from '../database/database';
import type { AppThemePreference } from '../constants/theme';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  created_at: number;
  theme_preference: AppThemePreference;
  supabase_user_id?: string | null;
  email?: string | null;
  last_sync_at?: number | null;
}

export const UserRepository = {
  // Get the existing user
  getCurrentUser: async (): Promise<User | null> => {
    const result = await getDB().getFirstAsync<User>('SELECT * FROM users LIMIT 1;');
    return result || null;
  },

  // Create a new user with a random UUID
  createUser: async (): Promise<User> => {
    const id = Crypto.randomUUID();
    await getDB().runAsync('INSERT INTO users (id) VALUES (?);', [id]);
    // The created_at will be set by default in the database, so we can return the user object directly
    return { id, created_at: Date.now(), theme_preference: 'system' };
  },

  updateThemePreference: async (userId: string, themePreference: AppThemePreference): Promise<void> => {
    await getDB().runAsync('UPDATE users SET theme_preference = ? WHERE id = ?;', [themePreference, userId]);
  },

  updateSupabaseIdentity: async (
    userId: string,
    supabaseUserId: string | null,
    email: string | null
  ): Promise<void> => {
    await getDB().runAsync(
      'UPDATE users SET supabase_user_id = ?, email = ? WHERE id = ?;',
      [supabaseUserId, email, userId]
    );
  },

  updateLastSyncAt: async (userId: string, lastSyncAt: number | null): Promise<void> => {
    await getDB().runAsync('UPDATE users SET last_sync_at = ? WHERE id = ?;', [lastSyncAt, userId]);
  },
};
