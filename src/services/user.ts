import { User, UserRepository } from '../repositories/userRepository';

let currentUser: User | null = null;
let initPromise: Promise<User> | null = null;

const createOrLoadUser = async (): Promise<User> => {
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
};

export const UserService = {
  init: async (): Promise<User> => {
    if (currentUser) {
      return currentUser;
    }

    if (initPromise) {
      return initPromise;
    }

    initPromise = createOrLoadUser();

    try {
      return await initPromise;
    } finally {
      initPromise = null;
    }
  },

  ensureInitialized: async (): Promise<User> => {
    if (currentUser) {
      return currentUser;
    }

    return await UserService.init();
  },

  getCurrentUserId: (): string => {
    if (!currentUser) {
      throw new Error('UserService not initialized. Call init() first.');
    }

    return currentUser.id;
  },

  getCurrentUser: (): User => {
    if (!currentUser) {
      throw new Error('UserService not initialized. Call init() first.');
    }

    return currentUser;
  },

  getCurrentUserIdAsync: async (): Promise<string> => {
    const user = await UserService.ensureInitialized();
    return user.id;
  },

  getCurrentUserAsync: async (): Promise<User> => {
    return await UserService.ensureInitialized();
  },
};