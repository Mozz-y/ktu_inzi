import { HistoryRepository } from '../repositories/historyRepository';
import { RatingsRepository } from '../repositories/ratingsRepository';
import { MovieRepository, Movie } from '../repositories/movieRepository';
import { UserService } from './user';

export interface WatchedMovie extends Movie {
  watchedAt: string;
  userRating: number;
}

export const watchedService = {
  async getWatchedMovies(): Promise<WatchedMovie[]> {
    const userId = UserService.getCurrentUserId();
    const historyItems = await HistoryRepository.getAll(userId);
    const moviesWithRatings: WatchedMovie[] = [];

    for (const item of historyItems) {
      const movie = await MovieRepository.getById(item.movie_id);
      if (movie) {
        const rating = await RatingsRepository.getRating(item.movie_id, userId);
        moviesWithRatings.push({
          ...movie,
          watchedAt: new Date(item.watched_at * 1000).toISOString(),
          userRating: rating?.rating ?? 0,
        });
      }
    }

    moviesWithRatings.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    return moviesWithRatings;
  },

  async addMovie(movie: Movie): Promise<void> {
    const userId = UserService.getCurrentUserId();
    const existing = await MovieRepository.getById(movie.id);
    if (!existing) {
      await MovieRepository.insert(movie);
    }
    await HistoryRepository.add(movie.id, userId);
    await RatingsRepository.setRating(movie.id, 0, userId);
  },

  async removeMovie(movieId: string): Promise<void> {
    const userId = UserService.getCurrentUserId();
    const numericId = Number(movieId);
    await HistoryRepository.remove(numericId, userId);
    await RatingsRepository.remove(numericId, userId);
  },

  async updateRating(movieId: string, newUserRating: number): Promise<void> {
    const userId = UserService.getCurrentUserId();
    const numericId = Number(movieId);
    await RatingsRepository.setRating(numericId, newUserRating, userId);
  },
};