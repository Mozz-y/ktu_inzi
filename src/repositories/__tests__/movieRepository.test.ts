import { getDB } from '../../database/database';
import { MovieRepository } from '../movieRepository';

jest.mock('../../database/database', () => ({
  getDB: jest.fn(),
}));

type FakeDb = {
  execAsync: jest.Mock;
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
};

const fakeDb: FakeDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

const mockedGetDB = getDB as jest.MockedFunction<typeof getDB>;

beforeEach(() => {
  mockedGetDB.mockReturnValue(fakeDb as any);
  fakeDb.execAsync.mockReset();
  fakeDb.runAsync.mockReset();
  fakeDb.getAllAsync.mockReset();
  fakeDb.getFirstAsync.mockReset();
});

describe('MovieRepository', () => {
  it('creates the movies table', async () => {
    fakeDb.execAsync.mockResolvedValue(undefined);

    await MovieRepository.createTable();

    expect(fakeDb.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS movies')
    );
  });

  it('inserts a movie with genres string and stores json', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    await MovieRepository.insert({
      id: 99,
      title: 'Example',
      overview: 'Description',
      poster_path: '/path.jpg',
      release_date: '2026-01-01',
      vote_average: 7.5,
      genres: '[]',
    });

    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO movies'),
      [99, 'Example', 'Description', '/path.jpg', '2026-01-01', 7.5, '"[]"']
    );
  });

  it('inserts a movie with undefined genres as empty JSON array', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    await MovieRepository.insert({
      id: 100,
      title: 'No Genres',
    });

    expect(fakeDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO movies'),
      [100, 'No Genres', null, null, null, null, '[]']
    );
  });

  it('retrieves all movies', async () => {
    const movies = [{ id: 1, title: 'Test Movie' }];
    fakeDb.getAllAsync.mockResolvedValue(movies);

    const result = await MovieRepository.getAll();

    expect(result).toEqual(movies);
    expect(fakeDb.getAllAsync).toHaveBeenCalledWith('SELECT * FROM movies;');
  });

  it('retrieves a movie by id', async () => {
    const movie = { id: 1, title: 'Test Movie' };
    fakeDb.getFirstAsync.mockResolvedValue(movie);

    const result = await MovieRepository.getById(1);

    expect(result).toEqual(movie);
    expect(fakeDb.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM movies WHERE id = ?;', [1]);
  });
});
