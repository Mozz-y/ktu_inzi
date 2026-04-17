import { HistoryRepository } from '../repositories/historyRepository';
import { MovieRepository } from '../repositories/movieRepository';
import { RatingsRepository } from '../repositories/ratingsRepository';
import type { Movie as APIMovie } from '../types/movie';
import { UserService } from './user';

export interface WatchedMovie extends APIMovie {
  watchedAt: string;
  userRating: number;
}

const TMDB_IMAGE_PREFIX = 'https://image.tmdb.org/t/p/w500';

export const watchedService = {
  async getWatchedMovies(): Promise<WatchedMovie[]> {
    const userId = await UserService.getCurrentUserIdAsync();
    const historyItems = await HistoryRepository.getAll(userId);
    const safeHistoryItems = Array.isArray(historyItems) ? historyItems : [];
    const moviesWithRatings: WatchedMovie[] = [];

    for (const item of safeHistoryItems) {
      const dbMovie = await MovieRepository.getById(item.movie_id);

      if (!dbMovie) {
        continue;
      }

      const rating = await RatingsRepository.getRating(item.movie_id, userId);

      let genres: (string | number)[] = [];
      try {
        genres = dbMovie.genres ? JSON.parse(dbMovie.genres) : [];
      } catch {
        genres = [];
      }

      const posterUrl = dbMovie.poster_path
        ? `${TMDB_IMAGE_PREFIX}${dbMovie.poster_path}`
        : '';

      moviesWithRatings.push({
        id: dbMovie.id,
        title: dbMovie.title,
        year: dbMovie.release_date?.split('-')[0] || 'N/A',
        rating: dbMovie.vote_average || 0,
        posterUrl,
        description: dbMovie.overview || '',
        genre: Array.isArray(genres) ? genres : [],
        watchedAt: new Date(item.watched_at * 1000).toISOString(),
        userRating: rating?.rating ?? 0,
      });
    }

    moviesWithRatings.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    return moviesWithRatings;
  },

  async addMovie(movie: APIMovie): Promise<void> {
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

    await HistoryRepository.add(movie.id, userId);
    await RatingsRepository.setRating(movie.id, 0, userId);
  },

  async removeMovie(movieId: number): Promise<void> {
    const userId = await UserService.getCurrentUserIdAsync();
    const numericId = Number(movieId);

    if (Number.isNaN(numericId)) {
      return;
    }

    await HistoryRepository.remove(numericId, userId);
    await RatingsRepository.remove(numericId, userId);
  },

  async updateRating(movieId: number, newUserRating: number): Promise<void> {
    const userId = await UserService.getCurrentUserIdAsync();
    const numericId = Number(movieId);

    if (Number.isNaN(numericId)) {
      return;
    }

    await RatingsRepository.setRating(numericId, newUserRating, userId);
  },
};