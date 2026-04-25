import type { AppThemePreference } from '@/constants/theme';
import { User, UserRepository } from '../repositories/userRepository';

export let currentUser: User | null = null;

export const UserService = {
  /**
   * Initialize the user: retrieves existing user or creates one.
   * Call this once after the database is ready.
   */
  init: async (): Promise<User> => {
    if (currentUser) return currentUser;

    let user = await UserRepository.getCurrentUser();
    if (!user) {
      console.log('[UserService] No user found, creating new user...');
      user = await UserRepository.createUser();
      console.log('[UserService] Created new user:', user.id);
    } else {
      console.log('[UserService] Existing user found:', user.id);
    }
    currentUser = user;
    return user;
  },

  /**
   * Returns the current user's ID. Assumes init() has been called.
   */
  getCurrentUserId: (): string => {
    if (!currentUser) {
      throw new Error('UserService not initialized. Call init() first.');
    }
    return currentUser.id;
  },

  /**
   * Returns the current user object.
   */
  getCurrentUser: (): User => {
    if (!currentUser) {
      throw new Error('UserService not initialized. Call init() first.');
    }
    return currentUser;
  },

  getThemePreference: (): AppThemePreference => {
    return UserService.getCurrentUser().theme_preference ?? 'system';
  },

  updateThemePreference: async (themePreference: AppThemePreference): Promise<void> => {
    const user = UserService.getCurrentUser();
    await UserRepository.updateThemePreference(user.id, themePreference);
    currentUser = {
      ...user,
      theme_preference: themePreference,
    };
  },
};
