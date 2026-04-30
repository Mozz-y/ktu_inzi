import { getDB } from '../../database/database';
import { RatingsRepository } from '../ratingsRepository';

jest.mock('../../database/database', () => ({
  getDB: jest.fn(),
}));

type FakeDb = {
  runAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
};

const fakeDb: FakeDb = {
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

const mockedGetDB = getDB as jest.MockedFunction<typeof getDB>;

beforeEach(() => {
  mockedGetDB.mockReturnValue(fakeDb as any);
  fakeDb.runAsync.mockReset();
  fakeDb.getFirstAsync.mockReset();
});

describe('RatingsRepository', () => {
  it('updates an existing rating when changes are nonzero', async () => {
    fakeDb.runAsync.mockResolvedValueOnce({ changes: 1 });

    const result = await RatingsRepository.setRating(5, 4, 'user-1');

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledTimes(1);
    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      'UPDATE ratings SET rating = ?, timestamp = ? WHERE movie_id = ? AND user_id = ?;',
      expect.any(Array)
    );
  });

  it('inserts a rating when update affected no rows', async () => {
    fakeDb.runAsync.mockResolvedValueOnce({ changes: 0 }).mockResolvedValueOnce({ changes: 1 });

    const result = await RatingsRepository.setRating(5, 3, 'user-1');

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledTimes(2);
    expect(fakeDb.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO ratings'),
      expect.any(Array)
    );
  });

  it('retrieves the latest rating', async () => {
    const rating = { id: 1, movie_id: 5, user_id: 'user-1', rating: 5, timestamp: 1000 };
    fakeDb.getFirstAsync.mockResolvedValue(rating);

    const result = await RatingsRepository.getRating(5, 'user-1');

    expect(result).toEqual(rating);
    expect(fakeDb.getFirstAsync).toHaveBeenCalledWith(
      'SELECT * FROM ratings WHERE movie_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 1;',
      [5, 'user-1']
    );
  });

  it.each([
    { movieId: 5, userId: 'user-1', rating: { id: 1, movie_id: 5, user_id: 'user-1', rating: 5, timestamp: 1000 } },
    { movieId: 10, userId: 'user-2', rating: { id: 2, movie_id: 10, user_id: 'user-2', rating: 4, timestamp: 2000 } },
    { movieId: 15, userId: 'user-3', rating: null },
  ])('retrieves rating for movie $movieId and user $userId', async ({ movieId, userId, rating }) => {
    fakeDb.getFirstAsync.mockResolvedValue(rating);

    const result = await RatingsRepository.getRating(movieId, userId);

    expect(result).toEqual(rating);
    expect(fakeDb.getFirstAsync).toHaveBeenCalledWith(
      'SELECT * FROM ratings WHERE movie_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 1;',
      [movieId, userId]
    );
  });

  it('removes a rating', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const result = await RatingsRepository.remove(5, 'user-1');

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM ratings WHERE movie_id = ? AND user_id = ?;',
      [5, 'user-1']
    );
  });

  it('retrieves all ratings for a user', async () => {
    const ratings = [{ id: 2, movie_id: 5, user_id: 'user-1', rating: 4, timestamp: 1500 }];
    fakeDb.getAllAsync = jest.fn().mockResolvedValue(ratings);
    mockedGetDB.mockReturnValue(fakeDb as any);

    const result = await RatingsRepository.getAll('user-1');

    expect(result).toEqual(ratings);
    expect(fakeDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM ratings WHERE user_id = ? ORDER BY timestamp DESC;',
      ['user-1']
    );
  });
});
