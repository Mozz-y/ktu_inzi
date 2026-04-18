const mockedGetCurrentUserId = jest.fn();
const mockedWishlistGetAll = jest.fn();
const mockedWishlistAdd = jest.fn();
const mockedWishlistRemove = jest.fn();
const mockedWishlistExists = jest.fn();
const mockedMovieGetById = jest.fn();
const mockedMovieInsert = jest.fn();

jest.mock('../user', () => ({
  UserService: {
    getCurrentUserId: mockedGetCurrentUserId,
  },
}));

jest.mock('../../repositories/wishlistRepository', () => ({
  WishlistRepository: {
    getAll: mockedWishlistGetAll,
    add: mockedWishlistAdd,
    remove: mockedWishlistRemove,
    exists: mockedWishlistExists,
  },
}));

jest.mock('../../repositories/movieRepository', () => ({
  MovieRepository: {
    getById: mockedMovieGetById,
    insert: mockedMovieInsert,
  },
}));

describe('wishlist service', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockedGetCurrentUserId.mockReturnValue('user-1');
  });

  const loadWishlist = () => require('../wishlist');

  it('returns wishlist movies with fallback poster and parsed genres', async () => {
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', added_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue({
      id: 11,
      title: 'Movie 11',
      overview: 'Overview',
      poster_path: null,
      release_date: '2024-05-01',
      vote_average: 7,
      genres: '[]',
    });

    const { getWishlist } = loadWishlist();
    const result = await getWishlist();

    expect(result).toEqual([
      expect.objectContaining({ id: 11, posterUrl: expect.stringContaining('default.jpg') }),
    ]);
  });

  it('returns an empty list when the wishlist movie cannot be found', async () => {
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', added_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue(null);

    const { getWishlist } = loadWishlist();
    const result = await getWishlist();

    expect(result).toEqual([]);
  });

  it('handles invalid movie genres by falling back to an empty genre array', async () => {
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', added_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue({
      id: 11,
      title: 'Movie 11',
      overview: 'Overview',
      poster_path: '/path.jpg',
      release_date: '2024-05-01',
      vote_average: 7,
      genres: 'invalid-json',
    });

    const { getWishlist } = loadWishlist();
    const result = await getWishlist();

    expect(result[0].genre).toEqual([]);
  });

  it('handles missing release date and rating values correctly', async () => {
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', added_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue({
      id: 11,
      title: 'Movie 11',
      overview: null,
      poster_path: '/path.jpg',
      release_date: undefined,
      vote_average: undefined,
      genres: undefined,
    });

    const { getWishlist } = loadWishlist();
    const result = await getWishlist();

    expect(result[0].year).toBe('N/A');
    expect(result[0].rating).toBe(0);
    expect(result[0].description).toBe('');
    expect(result[0].genre).toEqual([]);
  });

  it('handles null genres field', async () => {
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 11, user_id: 'user-1', added_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue({
      id: 11,
      title: 'Movie 11',
      overview: 'Overview',
      poster_path: '/path.jpg',
      release_date: '2024-05-01',
      vote_average: 8,
      genres: null,
    });

    const { getWishlist } = loadWishlist();
    const result = await getWishlist();

    expect(result[0].genre).toEqual([]);
  });

  it('adds a new wishlist movie when it does not exist and returns updated list', async () => {
    mockedMovieGetById.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 22,
      title: 'New Wishlist',
      overview: 'Desc',
      poster_path: '/sample.jpg',
      release_date: '2024',
      vote_average: 9,
      genres: '["Action"]',
    });
    mockedWishlistExists.mockResolvedValue(false);
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 22, user_id: 'user-1', added_at: 1680000000 }]);

    const { addToWishlist } = loadWishlist();
    const result = await addToWishlist({
      id: 22,
      title: 'New Wishlist',
      year: '2024',
      rating: 9,
      posterUrl: 'https://image.tmdb.org/t/p/w500/sample.jpg',
      description: 'Desc',
      genre: ['Action'],
    });

    expect(mockedMovieInsert).toHaveBeenCalled();
    expect(mockedWishlistAdd).toHaveBeenCalledWith(22, 'user-1');
    expect(result).toEqual([
      expect.objectContaining({
        id: 22,
        title: 'New Wishlist',
      }),
    ]);
  });

  it('adds a new wishlist movie using a relative posterUrl and no genre list', async () => {
    mockedMovieGetById.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 33,
      title: 'Relative Poster Movie',
      overview: 'No genre',
      poster_path: '/relative.jpg',
      release_date: '2025',
      vote_average: 5,
      genres: '[]',
    });
    mockedWishlistExists.mockResolvedValue(false);
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 33, user_id: 'user-1', added_at: 1680000000 }]);

    const { addToWishlist } = loadWishlist();
    const result = await addToWishlist({
      id: 33,
      title: 'Relative Poster Movie',
      year: '2025',
      rating: 5,
      posterUrl: '/relative.jpg',
      description: 'No genre',
    });

    expect(mockedMovieInsert).toHaveBeenCalledWith({
      id: 33,
      title: 'Relative Poster Movie',
      overview: 'No genre',
      poster_path: '/relative.jpg',
      release_date: '2025',
      vote_average: 5,
      genres: JSON.stringify([]),
    });
    expect(result).toEqual([
      expect.objectContaining({ id: 33, title: 'Relative Poster Movie' }),
    ]);
  });

  it('adds a new wishlist movie with empty posterUrl', async () => {
    mockedMovieGetById.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 44,
      title: 'No Poster Movie',
      overview: 'No poster',
      poster_path: undefined,
      release_date: '2025',
      vote_average: 5,
      genres: '[]',
    });
    mockedWishlistExists.mockResolvedValue(false);
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 44, user_id: 'user-1', added_at: 1680000000 }]);

    const { addToWishlist } = loadWishlist();
    const result = await addToWishlist({
      id: 44,
      title: 'No Poster Movie',
      year: '2025',
      rating: 5,
      posterUrl: '',
      description: 'No poster',
    });

    expect(mockedMovieInsert).toHaveBeenCalledWith({
      id: 44,
      title: 'No Poster Movie',
      overview: 'No poster',
      poster_path: undefined,
      release_date: '2025',
      vote_average: 5,
      genres: JSON.stringify([]),
    });
    expect(result).toEqual([
      expect.objectContaining({ id: 44, title: 'No Poster Movie' }),
    ]);
  });

  it('does not add duplicate wishlist entries when already exists', async () => {
    mockedMovieGetById.mockResolvedValue({
      id: 22,
      title: 'Existing',
      overview: 'Desc',
      poster_path: '/existing.jpg',
      release_date: '2024',
      vote_average: 9,
      genres: '[]',
    });
    mockedWishlistExists.mockResolvedValue(true);
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 22, user_id: 'user-1', added_at: 1680000000 }]);

    const { addToWishlist } = loadWishlist();
    const result = await addToWishlist({
      id: 22,
      title: 'Existing',
      year: '2024',
      rating: 9,
      posterUrl: 'https://image.tmdb.org/t/p/w500/existing.jpg',
      description: 'Desc',
      genre: ['Action'],
    });

    expect(mockedWishlistAdd).not.toHaveBeenCalled();
    expect(result).toEqual([
      expect.objectContaining({
        id: 22,
        title: 'Existing',
      }),
    ]);
  });

  it('removes a wishlist movie and returns the remaining list', async () => {
    mockedWishlistRemove.mockResolvedValue({ changes: 1 });
    mockedWishlistGetAll.mockResolvedValue([{ id: 1, movie_id: 22, user_id: 'user-1', added_at: 1680000000 }]);
    mockedMovieGetById.mockResolvedValue({
      id: 22,
      title: 'Existing',
      overview: 'Desc',
      poster_path: '/existing.jpg',
      release_date: '2024',
      vote_average: 9,
      genres: '[]',
    });

    const { removeFromWishlist } = loadWishlist();
    const result = await removeFromWishlist('22');

    expect(mockedWishlistRemove).toHaveBeenCalledWith(22, 'user-1');
    expect(result).toEqual([
      expect.objectContaining({
        id: 22,
        title: 'Existing',
      }),
    ]);
  });
});
