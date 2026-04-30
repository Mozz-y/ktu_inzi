import { Platform } from 'react-native';

import type { AppThemePreference } from '@/constants/theme';
import { User, UserRepository } from '../repositories/userRepository';

export let currentUser: User | null = null;

const webUser: User = {
  id: 'web-user',
  theme_preference: 'system',
};

const isWeb = Platform.OS === 'web';

export const UserService = {
  async init(): Promise<User> {
    if (isWeb) {
      currentUser = webUser;
      return currentUser;
    }

    if (currentUser) {
      return currentUser;
    }

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

  getCurrentUserId(): string {
    if (!currentUser) {
      currentUser = webUser;
    }

    return currentUser.id;
  },

  getCurrentUser(): User {
    if (!currentUser) {
      currentUser = webUser;
    }

    return currentUser;
  },

  getThemePreference(): AppThemePreference {
    return UserService.getCurrentUser().theme_preference ?? 'system';
  },

  async updateThemePreference(themePreference: AppThemePreference): Promise<void> {
    const user = UserService.getCurrentUser();

    if (isWeb) {
      currentUser = {
        ...user,
        theme_preference: themePreference,
      };
      return;
    }

    await UserRepository.updateThemePreference(user.id, themePreference);

    currentUser = {
      ...user,
      theme_preference: themePreference,
    };
  },
};