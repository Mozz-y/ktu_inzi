import { WishlistRepository } from '../repositories/wishlistRepository';
import { MovieRepository, Movie } from '../repositories/movieRepository';
import { UserService } from './user';

// Helper to get all wishlist movies
const getAllWishlistMovies = async (): Promise<Movie[]> => {
  const userId = UserService.getCurrentUserId();
  const items = await WishlistRepository.getAll(userId);
  const movies: Movie[] = [];

  for (const item of items) {
    const movie = await MovieRepository.getById(item.movie_id);
    if (movie) movies.push(movie);
  }
  return movies;
};

// Export functions exactly as before
export const getWishlist = async (): Promise<Movie[]> => {
  return getAllWishlistMovies();
};

export const addToWishlist = async (movie: Movie): Promise<Movie[]> => {
  const userId = UserService.getCurrentUserId();

  // Ensure movie exists in movies table
  const existing = await MovieRepository.getById(movie.id);
  if (!existing) {
    await MovieRepository.insert(movie);
  }

  const alreadyExists = await WishlistRepository.exists(movie.id, userId);
  if (!alreadyExists) {
    await WishlistRepository.add(movie.id, userId);
  }
  return getAllWishlistMovies();
};

export const removeFromWishlist = async (movieId: string): Promise<Movie[]> => {
  const userId = UserService.getCurrentUserId();
  const numericId = Number(movieId);
  await WishlistRepository.remove(numericId, userId);
  return getAllWishlistMovies();
};