const mockedGetCurrentUserId = jest.fn();
const mockedHistoryGetAll = jest.fn();
const mockedMovieGetById = jest.fn();
const mockedMovieInsert = jest.fn();
const mockedRatingsGetRating = jest.fn();
const mockedHistoryAdd = jest.fn();
const mockedRatingsSetRating = jest.fn();
const mockedRatingsRemove = jest.fn();

jest.mock('../user', () => ({
  UserService: {
    getCurrentUserId: mockedGetCurrentUserId,
  },
}));

jest.mock('../../repositories/historyRepository', () => ({
  HistoryRepository: {
    getAll: mockedHistoryGetAll,
    add: mockedHistoryAdd,
    remove: jest.fn(),
  },
}));

jest.mock('../../repositories/movieRepository', () => ({
  MovieRepository: {
    getById: mockedMovieGetById,
    insert: mockedMovieInsert,
  },
}));

jest.mock('../../repositories/ratingsRepository', () => ({
  RatingsRepository: {
    getRating: mockedRatingsGetRating,
    setRating: mockedRatingsSetRating,
    remove: mockedRatingsRemove,
  },
}));

describe('watchedService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockedGetCurrentUserId.mockReturnValue('user-1');
  });

  const loadService = () => require('../watchedList').watchedService;

  it('returns an empty array when no watched history exists', async () => {
    mockedHistoryGetAll.mockResolvedValue([]);
    const service = loadService();

    const result = await service.getWatchedMovies();

    expect(result).toEqual([]);
  });

  it('returns watched movies with default poster and parsed genres', async () => {
    mockedHistoryGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', watched_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue({
      id: 11,
      title: 'Movie 11',
      overview: 'Overview',
      poster_path: null,
      release_date: '2024-05-01',
      vote_average: 8,
      genres: 'invalid json',
    });
    mockedRatingsGetRating.mockResolvedValue(null);

    const service = loadService();
    const result = await service.getWatchedMovies();

    expect(result).toHaveLength(1);
    expect(result[0].posterUrl).toContain('default.jpg');
    expect(result[0].genre).toEqual([]);
    expect(result[0].userRating).toBe(0);
  });

  it('sorts watched movies by user rating descending', async () => {
    mockedHistoryGetAll.mockResolvedValue([
      { id: 1, movie_id: 11, user_id: 'user-1', watched_at: 1680000000 },
      { id: 2, movie_id: 22, user_id: 'user-1', watched_at: 1680001000 },
    ]);
    mockedMovieGetById.mockImplementation(async (id: number) => ({
      id,
      title: `Movie ${id}`,
      overview: '',
      poster_path: '/path.jpg',
      release_date: '2024-05-01',
      vote_average: 5,
      genres: '[]',
    }));
    mockedRatingsGetRating.mockImplementation(async (movieId: number) => ({ rating: movieId === 11 ? 2 : 5 }));

    const service = loadService();
    const result = await service.getWatchedMovies();

    expect(result[0].userRating).toBe(5);
    expect(result[1].userRating).toBe(2);
  });

  it('orders watched movies correctly when one rating is zero', async () => {
    mockedHistoryGetAll.mockResolvedValue([
      { id: 1, movie_id: 11, user_id: 'user-1', watched_at: 1680000000 },
      { id: 2, movie_id: 22, user_id: 'user-1', watched_at: 1680001000 },
    ]);
    mockedMovieGetById.mockImplementation(async (id: number) => ({
      id,
      title: `Movie ${id}`,
      overview: '',
      poster_path: '/path.jpg',
      release_date: '2024-05-01',
      vote_average: id === 11 ? 0 : 5,
      genres: '[]',
    }));
    mockedRatingsGetRating.mockImplementation(async (movieId: number) => (movieId === 11 ? null : { rating: 5 }));

    const service = loadService();
    const result = await service.getWatchedMovies();

    expect(result[0].id).toBe(22);
    expect(result[1].id).toBe(11);
  });

  it('handles movies with missing release date, overview, and vote average', async () => {
    mockedHistoryGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', watched_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue({
      id: 11,
      title: 'Movie 11',
      poster_path: '/path.jpg',
      genres: '[]',
    });
    mockedRatingsGetRating.mockResolvedValue(null);

    const service = loadService();
    const result = await service.getWatchedMovies();

    expect(result[0].year).toBe('N/A');
    expect(result[0].rating).toBe(0);
    expect(result[0].description).toBe('');
  });

  it('adds a movie and sets initial rating when movie does not exist', async () => {
    mockedMovieGetById.mockResolvedValue(null);
    const service = loadService();

    await service.addMovie({
      id: 5,
      title: 'New Movie',
      year: '2023',
      rating: 6.5,
      posterUrl: 'https://image.tmdb.org/t/p/w500/sample.jpg',
      description: 'Desc',
      genre: ['Action'],
    });

    expect(mockedRatingsSetRating).toHaveBeenCalledWith(5, 0, 'user-1');
  });

  it('does not insert a movie if it already exists', async () => {
    mockedMovieGetById.mockResolvedValue({ id: 5, title: 'Existing', genres: '[]' });
    const service = loadService();

    await service.addMovie({
      id: 5,
      title: 'Existing',
      year: '2023',
      rating: 6.5,
      posterUrl: 'https://image.tmdb.org/t/p/w500/existing.jpg',
      description: 'Desc',
      genre: ['Drama'],
    });

    expect(mockedRatingsSetRating).toHaveBeenCalledWith(5, 0, 'user-1');
  });

  it('removes a watched movie by numeric id', async () => {
    const service = loadService();

    await service.removeMovie('5');

    expect(mockedRatingsRemove).toHaveBeenCalledWith(5, 'user-1');
  });

  it('updates a rating by numeric id', async () => {
    const service = loadService();

    await service.updateRating('7', 4);

    expect(mockedRatingsSetRating).toHaveBeenCalledWith(7, 4, 'user-1');
  });

  it('skips history items when movie is missing', async () => {
    mockedHistoryGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', watched_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue(null);

    const service = loadService();
    const result = await service.getWatchedMovies();

    expect(result).toEqual([]);
  });

  it('adds a movie without TMDB base url in posterUrl', async () => {
    mockedMovieGetById.mockResolvedValue(null);
    const service = loadService();

    await service.addMovie({
      id: 6,
      title: 'New Movie',
      year: '2023',
      rating: 6.5,
      posterUrl: '/custom.jpg',
      description: 'Desc',
      genre: ['Action'],
    });

    expect(mockedMovieInsert).toHaveBeenCalledWith({
      id: 6,
      title: 'New Movie',
      overview: 'Desc',
      poster_path: '/custom.jpg',
      release_date: '2023',
      vote_average: 6.5,
      genres: JSON.stringify(['Action']),
    });
  });

  it('handles movies with null genres field', async () => {
    mockedHistoryGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', watched_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue({
      id: 11,
      title: 'Movie 11',
      overview: 'Overview',
      poster_path: '/path.jpg',
      release_date: '2024-05-01',
      vote_average: 8,
      genres: null,
    });
    mockedRatingsGetRating.mockResolvedValue(null);

    const service = loadService();
    const result = await service.getWatchedMovies();

    expect(result[0].genre).toEqual([]);
  });

  it('orders watched movies correctly when one rating is zero', async () => {
    mockedHistoryGetAll.mockResolvedValue([
      { id: 1, movie_id: 11, user_id: 'user-1', watched_at: 1680000000 },
      { id: 2, movie_id: 22, user_id: 'user-1', watched_at: 1680001000 },
    ]);
    mockedMovieGetById.mockImplementation(async (id: number) => ({
      id,
      title: `Movie ${id}`,
      overview: '',
      poster_path: '/path.jpg',
      release_date: '2024-05-01',
      vote_average: 5,
      genres: '[]',
    }));
    mockedRatingsGetRating.mockImplementation(async (movieId: number) => movieId === 11 ? null : { rating: 5 });

    const service = loadService();
    const result = await service.getWatchedMovies();

    expect(result[0].userRating).toBe(5);
    expect(result[1].userRating).toBe(0);
  });

  it('orders watched movies by user rating descending with positive ratings', async () => {
    mockedHistoryGetAll.mockResolvedValue([
      { id: 1, movie_id: 11, user_id: 'user-1', watched_at: 1680000000 },
      { id: 2, movie_id: 22, user_id: 'user-1', watched_at: 1680001000 },
    ]);
    mockedMovieGetById.mockImplementation(async (id: number) => ({
      id,
      title: `Movie ${id}`,
      overview: '',
      poster_path: '/path.jpg',
      release_date: '2024-05-01',
      vote_average: 5,
      genres: '[]',
    }));
    mockedRatingsGetRating.mockImplementation(async (movieId: number) => ({ rating: movieId === 11 ? 3 : 5 }));

    const service = loadService();
    const result = await service.getWatchedMovies();

    expect(result[0].userRating).toBe(5);
    expect(result[1].userRating).toBe(3);
  });

  it('adds a movie with empty posterUrl', async () => {
    mockedMovieGetById.mockResolvedValue(null);
    const service = loadService();

    await service.addMovie({
      id: 8,
      title: 'No Poster Movie',
      year: '2023',
      rating: 6.5,
      posterUrl: '',
      description: 'No poster',
      genre: ['Action'],
    });

    expect(mockedMovieInsert).toHaveBeenCalledWith({
      id: 8,
      title: 'No Poster Movie',
      overview: 'No poster',
      poster_path: undefined,
      release_date: '2023',
      vote_average: 6.5,
      genres: JSON.stringify(['Action']),
    });
  });

  it('adds a movie with null genre', async () => {
    mockedMovieGetById.mockResolvedValue(null);
    const service = loadService();

    await service.addMovie({
      id: 9,
      title: 'Null Genre Movie',
      year: '2025',
      rating: 4.2,
      posterUrl: '/poster.jpg',
      description: 'Null genre',
      genre: null,
    });

    expect(mockedMovieInsert).toHaveBeenCalledWith({
      id: 9,
      title: 'Null Genre Movie',
      overview: 'Null genre',
      poster_path: '/poster.jpg',
      release_date: '2025',
      vote_average: 4.2,
      genres: JSON.stringify([]),
    });
  });
});
