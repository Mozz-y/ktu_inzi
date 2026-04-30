import { useCallback, useEffect, useState } from 'react';
import { watchedService } from '../services/watchedList';
import type { Movie, WatchedMovie } from '../types/movie';

export const useWatched = () => {
  const [movies, setMovies] = useState<WatchedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await watchedService.getWatchedMovies();
      setMovies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetch watched movies failed:', error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const addMovie = useCallback(
    async (movie: Movie) => {
      try {
        await watchedService.addMovie(movie);
        await fetchMovies();
      } catch (error) {
        console.error('add watched movie failed:', error);
      }
    },
    [fetchMovies]
  );

  const removeMovie = useCallback(
    async (movieId: number) => {
      try {
        await watchedService.removeMovie(String(movieId));
        await fetchMovies();
      } catch (error) {
        console.error('remove watched movie failed:', error);
      }
    },
    [fetchMovies]
  );

  const rateMovie = useCallback(
    async (movieId: number, rating: number) => {
      setMovies((previousMovies) =>
        previousMovies.map((movie) =>
          Number(movie.id) === Number(movieId)
            ? { ...movie, userRating: rating }
            : movie
        )
      );

      try {
        await watchedService.updateRating(String(movieId), rating);
      } catch (error) {
        console.error('rate watched movie failed:', error);
        await fetchMovies();
      }
    },
    [fetchMovies]
  );

  const isWatched = useCallback(
    (movieId: number) => {
      return movies.some((movie) => Number(movie.id) === Number(movieId));
    },
    [movies]
  );

  const getUserRating = useCallback(
    (movieId: number) => {
      const movie = movies.find((item) => Number(item.id) === Number(movieId));
      return Number(movie?.userRating ?? 0);
    },
    [movies]
  );

  return {
    movies: Array.isArray(movies) ? movies : [],
    isLoading,
    addMovie,
    removeMovie,
    rateMovie,
    isWatched,
    getUserRating,
    refreshMovies: fetchMovies,
  };
};