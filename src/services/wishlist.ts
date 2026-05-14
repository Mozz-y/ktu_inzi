import { Platform } from 'react-native';

import { MovieRepository } from '../repositories/movieRepository';
import { WishlistRepository } from '../repositories/wishlistRepository';
import { SyncService } from './sync';
import type { Movie as APIMovie } from '../types/movie';
import { UserService } from './user';

const isWeb = Platform.OS === 'web';
const WEB_WISHLIST_STORAGE_KEY = 'bingelog.web.wishlist';

let webWishlist: APIMovie[] = [];
let webWishlistLoaded = false;

const getWebStorageItem = (key: string): string | null => {
  try {
    return (globalThis as any)?.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const setWebStorageItem = (key: string, value: string): void => {
  try {
    (globalThis as any)?.localStorage?.setItem(key, value);
  } catch (error) {
    console.warn('Failed to save wishlist in localStorage:', error);
  }
};

const loadWebWishlist = async (): Promise<APIMovie[]> => {
  if (webWishlistLoaded) {
    return webWishlist;
  }

  try {
    const saved = getWebStorageItem(WEB_WISHLIST_STORAGE_KEY);
    webWishlist = saved ? JSON.parse(saved) : [];
  } catch {
    webWishlist = [];
  }

  webWishlistLoaded = true;
  return webWishlist;
};

const saveWebWishlist = async (movies: APIMovie[]): Promise<void> => {
  webWishlist = movies;
  webWishlistLoaded = true;
  setWebStorageItem(WEB_WISHLIST_STORAGE_KEY, JSON.stringify(movies));
};

const getAllWishlistMovies = async (): Promise<APIMovie[]> => {
  if (isWeb) {
    return loadWebWishlist();
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
          const firstParse = Array.isArray(dbMovie.genres)
            ? dbMovie.genres
            : JSON.parse(dbMovie.genres);
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
    const currentWishlist = await loadWebWishlist();
    const exists = currentWishlist.some((item) => String(item.id) === String(movie.id));

    if (!exists) {
      const updatedWishlist = [...currentWishlist, movie];
      await saveWebWishlist(updatedWishlist);
      return updatedWishlist;
    }

    return currentWishlist;
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
      genres: (movie.genre || []) as unknown as string,
    });
  }

  const alreadyExists = await WishlistRepository.exists(movie.id, userId);

  if (!alreadyExists) {
    await WishlistRepository.add(movie.id, userId);
    const addedAt = Math.floor(Date.now() / 1000);
    await SyncService.enqueue('wishlist', String(movie.id), 'upsert', {
      movieId: movie.id,
      addedAt,
    });
  }

  return getAllWishlistMovies();
};

export const removeFromWishlist = async (movieId: string): Promise<APIMovie[]> => {
  if (isWeb) {
    const currentWishlist = await loadWebWishlist();
    const updatedWishlist = currentWishlist.filter((movie) => String(movie.id) !== String(movieId));
    await saveWebWishlist(updatedWishlist);
    return updatedWishlist;
  }

  const userId = UserService.getCurrentUserId();
  const numericId = Number(movieId);

  await WishlistRepository.remove(numericId, userId);
  await SyncService.enqueue('wishlist', String(numericId), 'delete', {
    movieId: numericId,
  });

  return getAllWishlistMovies();
};
