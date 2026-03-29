import { WishlistRepository } from '../repositories/wishlistRepository';
import { MovieRepository } from '../repositories/movieRepository';
import { UserService } from './user';
import type { Movie as APIMovie } from '../types/movie';

// Helper to get all wishlist movies
const getAllWishlistMovies = async (): Promise<APIMovie[]> => {
  const userId = UserService.getCurrentUserId();
  const items = await WishlistRepository.getAll(userId);
  const movies: APIMovie[] = [];

  for (const item of items) {
    const dbMovie = await MovieRepository.getById(item.movie_id);
    if (dbMovie) {
      // Convert database movie format to API movie format
      const posterUrl = dbMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${dbMovie.poster_path}`
        : 'https://image.tmdb.org/t/p/w500/default.jpg';

      // Parse genres from stored JSON
      let genres: (string | number)[] = [];
      try {
        genres = dbMovie.genres ? JSON.parse(dbMovie.genres) : [];
      } catch (e) {
        genres = [];
      }

      const apiMovie: APIMovie = {
        id: dbMovie.id,
        title: dbMovie.title,
        year: dbMovie.release_date?.split('-')[0] || 'N/A',
        rating: dbMovie.vote_average || 0,
        posterUrl: posterUrl,
        description: dbMovie.overview || '',
        genre: genres,
      };
      movies.push(apiMovie);
    }
  }
  return movies;
};

// Export functions exactly as before
export const getWishlist = async (): Promise<APIMovie[]> => {
  return getAllWishlistMovies();
};

export const addToWishlist = async (movie: APIMovie): Promise<APIMovie[]> => {
  const userId = UserService.getCurrentUserId();

  // Ensure movie exists in movies table
  const existing = await MovieRepository.getById(movie.id);
  if (!existing) {
    // Convert API movie format to database format
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
      genres: JSON.stringify(movie.genre || []), // Store genres as JSON
    });
  }

  const alreadyExists = await WishlistRepository.exists(movie.id, userId);
  if (!alreadyExists) {
    await WishlistRepository.add(movie.id, userId);
  }
  return getAllWishlistMovies();
};

export const removeFromWishlist = async (movieId: string): Promise<APIMovie[]> => {
  const userId = UserService.getCurrentUserId();
  const numericId = Number(movieId);
  await WishlistRepository.remove(numericId, userId);
  return getAllWishlistMovies();
};