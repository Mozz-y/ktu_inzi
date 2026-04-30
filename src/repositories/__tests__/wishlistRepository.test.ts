import { getDB } from '../../database/database';
import { WishlistRepository } from '../wishlistRepository';

jest.mock('../../database/database', () => ({
  getDB: jest.fn(),
}));

type FakeDb = {
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
};

const fakeDb: FakeDb = {
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

const mockedGetDB = getDB as jest.MockedFunction<typeof getDB>;

beforeEach(() => {
  mockedGetDB.mockReturnValue(fakeDb as any);
  fakeDb.runAsync.mockReset();
  fakeDb.getAllAsync.mockReset();
  fakeDb.getFirstAsync.mockReset();
});

describe('WishlistRepository', () => {
  it('adds a wishlist item', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const result = await WishlistRepository.add(7, 'user-1');

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO wishlist (movie_id, user_id) VALUES (?, ?);',
      [7, 'user-1']
    );
  });

  it.each([
    { movieId: 7, userId: 'user-1' },
    { movieId: 123, userId: 'user-2' },
    { movieId: 456, userId: 'user-3' },
  ])('adds a wishlist item for movie $movieId and user $userId', async ({ movieId, userId }) => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const result = await WishlistRepository.add(movieId, userId);

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO wishlist (movie_id, user_id) VALUES (?, ?);',
      [movieId, userId]
    );
  });

  it('removes a wishlist item', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const result = await WishlistRepository.remove(7, 'user-1');

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM wishlist WHERE movie_id = ? AND user_id = ?;',
      [7, 'user-1']
    );
  });

  it.each([
    { movieId: 7, userId: 'user-1' },
    { movieId: 123, userId: 'user-2' },
    { movieId: 456, userId: 'user-3' },
  ])('removes a wishlist item for movie $movieId and user $userId', async ({ movieId, userId }) => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const result = await WishlistRepository.remove(movieId, userId);

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM wishlist WHERE movie_id = ? AND user_id = ?;',
      [movieId, userId]
    );
  });

  it('retrieves all wishlist items', async () => {
    const items = [{ id: 2, movie_id: 7, user_id: 'user-1', added_at: 1680000000 }];
    fakeDb.getAllAsync.mockResolvedValue(items);

    const result = await WishlistRepository.getAll('user-1');

    expect(result).toEqual(items);
    expect(fakeDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM wishlist WHERE user_id = ? ORDER BY added_at DESC;',
      ['user-1']
    );
  });

  it('returns true when a wishlist item exists', async () => {
    fakeDb.getFirstAsync.mockResolvedValue({ count: 1 });

    const result = await WishlistRepository.exists(7, 'user-1');

    expect(result).toBe(true);
    expect(fakeDb.getFirstAsync).toHaveBeenCalledWith(
      'SELECT COUNT(*) as count FROM wishlist WHERE movie_id = ? AND user_id = ?;',
      [7, 'user-1']
    );
  });

  it('returns false when a wishlist item does not exist', async () => {
    fakeDb.getFirstAsync.mockResolvedValue(undefined);

    const result = await WishlistRepository.exists(7, 'user-1');

    expect(result).toBe(false);
  });
});
