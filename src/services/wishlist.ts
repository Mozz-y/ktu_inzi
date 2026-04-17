import { MovieRepository } from '../repositories/movieRepository';
import { WishlistRepository } from '../repositories/wishlistRepository';
import type { Movie as APIMovie } from '../types/movie';
import { UserService } from './user';

const TMDB_IMAGE_PREFIX = 'https://image.tmdb.org/t/p/w500';

const getAllWishlistMovies = async (): Promise<APIMovie[]> => {
  const userId = await UserService.getCurrentUserIdAsync();
  const items = await WishlistRepository.getAll(userId);
  const safeItems = Array.isArray(items) ? items : [];
  const movies: APIMovie[] = [];

  for (const item of safeItems) {
    const dbMovie = await MovieRepository.getById(item.movie_id);

    if (!dbMovie) {
      continue;
    }

    let genres: (string | number)[] = [];
    try {
      genres = dbMovie.genres ? JSON.parse(dbMovie.genres) : [];
    } catch {
      genres = [];
    }

    const posterUrl = dbMovie.poster_path
      ? `${TMDB_IMAGE_PREFIX}${dbMovie.poster_path}`
      : '';

    movies.push({
      id: dbMovie.id,
      title: dbMovie.title,
      year: dbMovie.release_date?.split('-')[0] || 'N/A',
      rating: dbMovie.vote_average || 0,
      posterUrl,
      description: dbMovie.overview || '',
      genre: Array.isArray(genres) ? genres : [],
    });
  }

  return movies;
};

export const getWishlist = async (): Promise<APIMovie[]> => {
  return await getAllWishlistMovies();
};

export const addToWishlist = async (movie: APIMovie): Promise<APIMovie[]> => {
  const userId = await UserService.getCurrentUserIdAsync();
  const existing = await MovieRepository.getById(movie.id);

  if (!existing) {
    let posterPath = movie.posterUrl || '';

    if (posterPath.startsWith(TMDB_IMAGE_PREFIX)) {
      posterPath = posterPath.replace(TMDB_IMAGE_PREFIX, '');
    }

    await MovieRepository.insert({
      id: movie.id,
      title: movie.title,
      overview: movie.description,
      poster_path: posterPath || undefined,
      release_date: movie.year,
      vote_average: movie.rating,
      genres: JSON.stringify(Array.isArray(movie.genre) ? movie.genre : []),
    });
  }

  const alreadyExists = await WishlistRepository.exists(movie.id, userId);

  if (!alreadyExists) {
    await WishlistRepository.add(movie.id, userId);
  }

  return await getAllWishlistMovies();
};

export const removeFromWishlist = async (
  movieId: number
): Promise<APIMovie[]> => {
  const userId = await UserService.getCurrentUserIdAsync();

  if (Number.isNaN(Number(movieId))) {
    return await getAllWishlistMovies();
  }

  await WishlistRepository.remove(Number(movieId), userId);
  return await getAllWishlistMovies();
};