import { Platform } from 'react-native';

import { MovieRepository } from '../repositories/movieRepository';
import { WishlistRepository } from '../repositories/wishlistRepository';
import type { Movie as APIMovie } from '../types/movie';
import { UserService } from './user';

const isWeb = Platform.OS === 'web';

let webWishlist: APIMovie[] = [];

const getAllWishlistMovies = async (): Promise<APIMovie[]> => {
  if (isWeb) {
    return webWishlist;
  }

  const userId = UserService.getCurrentUserId();
  const items = await WishlistRepository.getAll(userId);
  const movies: APIMovie[] = [];

  for (const item of items) {
    const dbMovie = await MovieRepository.getById(item.movie_id);

    if (dbMovie) {
      const posterUrl = dbMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${dbMovie.poster_path}`
        : 'https://image.tmdb.org/t/p/w500/default.jpg';

      let genres: (string | number)[] = [];

      try {
        if (dbMovie.genres) {
          const firstParse = JSON.parse(dbMovie.genres);
          genres = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
        }
      } catch {
        genres = [];
      }

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
  }

  return movies;
};

export const getWishlist = async (): Promise<APIMovie[]> => {
  return getAllWishlistMovies();
};

export const addToWishlist = async (movie: APIMovie): Promise<APIMovie[]> => {
  if (isWeb) {
    const exists = webWishlist.some((item) => item.id === movie.id);

    if (!exists) {
      webWishlist = [...webWishlist, movie];
    }

    return webWishlist;
  }

  const userId = UserService.getCurrentUserId();

  const existing = await MovieRepository.getById(movie.id);

  if (!existing) {
    let posterPath = movie.posterUrl;

    if (posterPath.includes('https://image.tmdb.org/t/p/w500')) {
      posterPath = posterPath.replace('https://image.tmdb.org/t/p/w500', '');
    }

    await MovieRepository.insert({
      id: movie.id,
      title: movie.title,
      overview: movie.description,
      poster_path: posterPath || undefined,
      release_date: movie.year,
      vote_average: movie.rating,
      genres: movie.genre || [],
    });
  }

  const alreadyExists = await WishlistRepository.exists(movie.id, userId);

  if (!alreadyExists) {
    await WishlistRepository.add(movie.id, userId);
  }

  return getAllWishlistMovies();
};

export const removeFromWishlist = async (movieId: string): Promise<APIMovie[]> => {
  if (isWeb) {
    webWishlist = webWishlist.filter((movie) => String(movie.id) !== String(movieId));
    return webWishlist;
  }

  const userId = UserService.getCurrentUserId();
  const numericId = Number(movieId);

  await WishlistRepository.remove(numericId, userId);

  return getAllWishlistMovies();
};