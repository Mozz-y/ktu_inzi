import { getDB } from '../../database/database';
import { HistoryRepository } from '../historyRepository';

jest.mock('../../database/database', () => ({
  getDB: jest.fn(),
}));

type FakeDb = {
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
};

const fakeDb: FakeDb = {
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

const mockedGetDB = getDB as jest.MockedFunction<typeof getDB>;

beforeEach(() => {
  mockedGetDB.mockReturnValue(fakeDb as any);
  fakeDb.runAsync.mockReset();
  fakeDb.getAllAsync.mockReset();
});

describe('HistoryRepository', () => {
  it('adds a history item', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const result = await HistoryRepository.add(42, 'user-1');

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO history (movie_id, user_id) VALUES (?, ?);',
      [42, 'user-1']
    );
  });

  it('removes a history item', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const result = await HistoryRepository.remove(42, 'user-1');

    expect(result).toEqual({ changes: 1 });
    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM history WHERE movie_id = ? AND user_id = ?;',
      [42, 'user-1']
    );
  });

  it('retrieves all history items for a user', async () => {
    const historyItems = [{ id: 1, movie_id: 42, user_id: 'user-1', watched_at: 1680000000 }];
    fakeDb.getAllAsync.mockResolvedValue(historyItems);

    const result = await HistoryRepository.getAll('user-1');

    expect(result).toEqual(historyItems);
    expect(fakeDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM history WHERE user_id = ? ORDER BY watched_at DESC;',
      ['user-1']
    );
  });
});
