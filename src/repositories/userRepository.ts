import { getDB } from '../database/database';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  created_at: number;
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
    return { id, created_at: Date.now() };
  },
};