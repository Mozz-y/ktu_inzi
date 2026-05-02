import { Platform } from 'react-native';

import { HistoryRepository } from '../repositories/historyRepository';
import { MovieRepository } from '../repositories/movieRepository';
import { RatingsRepository } from '../repositories/ratingsRepository';
import type { Movie as APIMovie } from '../types/movie';
import { UserService } from './user';

export interface WatchedMovie extends APIMovie {
  watchedAt: string;
  userRating: number;
}

const isWeb = Platform.OS === 'web';
const WEB_WATCHED_STORAGE_KEY = 'bingelog.web.watchedMovies';

let webWatchedMovies: WatchedMovie[] = [];
let webWatchedMoviesLoaded = false;

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
    console.warn('Failed to save watched movies in localStorage:', error);
  }
};

const loadWebWatchedMovies = async (): Promise<WatchedMovie[]> => {
  if (webWatchedMoviesLoaded) {
    return webWatchedMovies;
  }

  try {
    const saved = getWebStorageItem(WEB_WATCHED_STORAGE_KEY);
    webWatchedMovies = saved ? JSON.parse(saved) : [];
  } catch {
    webWatchedMovies = [];
  }

  webWatchedMoviesLoaded = true;
  return webWatchedMovies;
};

const saveWebWatchedMovies = async (movies: WatchedMovie[]): Promise<void> => {
  webWatchedMovies = movies;
  webWatchedMoviesLoaded = true;
  setWebStorageItem(WEB_WATCHED_STORAGE_KEY, JSON.stringify(movies));
};

export const watchedService = {
  async getWatchedMovies(): Promise<WatchedMovie[]> {
    if (isWeb) {
      return loadWebWatchedMovies();
    }

    const userId = UserService.getCurrentUserId();
    const historyItems = await HistoryRepository.getAll(userId);
    const moviesWithRatings: WatchedMovie[] = [];

    for (const item of historyItems) {
      const dbMovie = await MovieRepository.getById(item.movie_id);

      if (dbMovie) {
        const rating = await RatingsRepository.getRating(item.movie_id, userId);

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

        moviesWithRatings.push({
          id: dbMovie.id,
          title: dbMovie.title,
          year: dbMovie.release_date?.split('-')[0] || 'N/A',
          rating: dbMovie.vote_average || 0,
          posterUrl,
          description: dbMovie.overview || '',
          genre: genres,
          watchedAt: new Date(item.watched_at * 1000).toISOString(),
          userRating: rating?.rating ?? 0,
        });
      }
    }

    moviesWithRatings.sort((a, b) => b.userRating - a.userRating);

    return moviesWithRatings;
  },

  async addMovie(movie: APIMovie): Promise<void> {
    if (isWeb) {
      const currentMovies = await loadWebWatchedMovies();
      const exists = currentMovies.some((item) => String(item.id) === String(movie.id));

      if (!exists) {
        await saveWebWatchedMovies([
          ...currentMovies,
          {
            ...movie,
            watchedAt: new Date().toISOString(),
            userRating: 0,
          },
        ]);
      }

      return;
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

    await HistoryRepository.add(movie.id, userId);
    await RatingsRepository.setRating(movie.id, 0, userId);
  },

  async removeMovie(movieId: string): Promise<void> {
    if (isWeb) {
      const currentMovies = await loadWebWatchedMovies();
      await saveWebWatchedMovies(
        currentMovies.filter((movie) => String(movie.id) !== String(movieId))
      );
      return;
    }

    const userId = UserService.getCurrentUserId();
    const numericId = Number(movieId);

    await HistoryRepository.remove(numericId, userId);
    await RatingsRepository.remove(numericId, userId);
  },

  async updateRating(movieId: string, newUserRating: number): Promise<void> {
    if (isWeb) {
      const currentMovies = await loadWebWatchedMovies();
      await saveWebWatchedMovies(
        currentMovies.map((movie) =>
          String(movie.id) === String(movieId)
            ? { ...movie, userRating: newUserRating }
            : movie
        )
      );
      return;
    }

    const userId = UserService.getCurrentUserId();
    const numericId = Number(movieId);

    await RatingsRepository.setRating(numericId, newUserRating, userId);
  },
};
