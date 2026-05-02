import { getDB } from '../database/database';
import * as userModule from '../services/user';
import { watchedService } from '../services/watchedList';
import { getWishlist } from '../services/wishlist';

jest.mock('../database/database', () => ({
  getDB: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));

const fakeDb = {
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset UserService state
    (userModule as any).currentUser = null;
    (getDB as jest.Mock).mockReturnValue(fakeDb);
    fakeDb.runAsync.mockReset();
    fakeDb.getFirstAsync.mockReset();
    fakeDb.getAllAsync.mockReset();
  });

  it('initializes user service and creates new user if none exists', async () => {
    fakeDb.getFirstAsync.mockResolvedValue(null);
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const user = await userModule.UserService.init();

    expect(fakeDb.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM users LIMIT 1;');
    expect(fakeDb.runAsync).toHaveBeenCalledWith('INSERT INTO users (id) VALUES (?);', ['mocked-uuid']);
    expect(user.id).toBe('mocked-uuid');
  });

  it('initializes user service and returns existing user', async () => {
    const existingUser = { id: 'existing-user-id', created_at: Date.now() };
    fakeDb.getFirstAsync.mockResolvedValue(existingUser);

    const user = await userModule.UserService.init();

    expect(fakeDb.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM users LIMIT 1;');
    expect(fakeDb.runAsync).not.toHaveBeenCalled();
    expect(user).toEqual(existingUser);
  });

  it('returns current user after initialization', () => {
    const user = { id: 'test-user', created_at: Date.now() };
    (userModule as any).currentUser = user;

    const result = userModule.UserService.getCurrentUser();

    expect(result).toBe(user);
  });

  it('throws error if getCurrentUserId called before init', () => {
    (userModule as any).currentUser = null;
    expect(() => userModule.UserService.getCurrentUserId()).toThrow('UserService not initialized. Call init() first.');
  });

  it('integrates watchedService with repositories', async () => {
    // Set up user
    const user = { id: 'test-user', created_at: Date.now() };
    (userModule as any).currentUser = user;

    // Mock history items
    const historyItems = [{ movie_id: 1, watched_at: 1000 }];
    fakeDb.getAllAsync.mockResolvedValueOnce(historyItems); // for history

    // Mock movie
    const dbMovie = { id: 1, title: 'Test Movie', overview: 'Desc', poster_path: '/path.jpg', release_date: '2020-01-01', vote_average: 8.0, genres: '[]' };
    fakeDb.getFirstAsync.mockResolvedValueOnce(dbMovie); // for movie

    // Mock rating
    fakeDb.getFirstAsync.mockResolvedValueOnce({ rating: 9 }); // for rating

    const result = await watchedService.getWatchedMovies();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Movie');
    expect(result[0].userRating).toBe(9);
  });

  it('integrates wishlistService with repositories', async () => {
    // Set up user
    const user = { id: 'test-user', created_at: Date.now() };
    (userModule as any).currentUser = user;

    // Mock wishlist items
    const wishlistItems = [{ movie_id: 2 }];
    fakeDb.getAllAsync.mockResolvedValueOnce(wishlistItems); // for wishlist

    // Mock movie
    const dbMovie = { id: 2, title: 'Wishlist Movie', overview: 'Desc', poster_path: '/path.jpg', release_date: '2021-01-01', vote_average: 7.0, genres: '[]' };
    fakeDb.getFirstAsync.mockResolvedValueOnce(dbMovie); // for movie

    const result = await getWishlist();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Wishlist Movie');
  });
});