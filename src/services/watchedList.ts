import { HistoryRepository } from '../repositories/historyRepository';
import { MovieRepository } from '../repositories/movieRepository';
import { RatingsRepository } from '../repositories/ratingsRepository';
import type { Movie as APIMovie } from '../types/movie';
import { UserService } from './user';

export interface WatchedMovie extends APIMovie {
  watchedAt: string;
  userRating: number;
}

export const watchedService = {
  async getWatchedMovies(): Promise<WatchedMovie[]> {
    const userId = UserService.getCurrentUserId();
    const historyItems = await HistoryRepository.getAll(userId);
    const moviesWithRatings: WatchedMovie[] = [];

    for (const item of historyItems) {
      const dbMovie = await MovieRepository.getById(item.movie_id);
      if (dbMovie) {
        const rating = await RatingsRepository.getRating(item.movie_id, userId);
        // Convert database movie format to API movie format
        const posterUrl = dbMovie.poster_path
          ? `https://image.tmdb.org/t/p/w500${dbMovie.poster_path}`
          : 'https://image.tmdb.org/t/p/w500/default.jpg'; // Fallback image

        // Parse genres from stored JSON
        let genres: (string | number)[] = [];
        try {
          if (dbMovie.genres) {
            // First parse takes off the repository's stringification
            const firstParse = JSON.parse(dbMovie.genres);
            
            // If it's STILL a string (double stringified old data), parse it again!
            genres = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
          }
        } catch (e) {
          genres = [];
        }

        const movie: WatchedMovie = {
          id: dbMovie.id,
          title: dbMovie.title,
          year: dbMovie.release_date?.split('-')[0] || 'N/A',
          rating: dbMovie.vote_average || 0,
          posterUrl: posterUrl,
          description: dbMovie.overview || '',
          genre: genres,
          watchedAt: new Date(item.watched_at * 1000).toISOString(),
          userRating: rating?.rating ?? 0,
        };
        moviesWithRatings.push(movie);
      }
    }

    moviesWithRatings.sort((a, b) => b.userRating - a.userRating);
    return moviesWithRatings;
  },

  async addMovie(movie: APIMovie): Promise<void> {
    const userId = UserService.getCurrentUserId();
    const existing = await MovieRepository.getById(movie.id);
    if (!existing) {
      // Convert API movie format to database format
      // Extract poster_path from full URL if it contains the TMDB base URL
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