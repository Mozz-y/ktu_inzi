import { useCallback, useEffect, useState } from 'react';
import { watchedService } from '../services/watchedList';
import { Movie, WatchedMovie } from '../types/movie';

export const useWatched = () => {
  const [movies, setMovies] = useState<WatchedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await watchedService.getWatchedMovies();
      setMovies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetchWatchedMovies failed:', error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleAdd = useCallback(
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

  const handleRemove = useCallback(
    async (movieId: number) => {
      try {
        await watchedService.removeMovie(movieId);
        await fetchMovies();
      } catch (error) {
        console.error('remove watched movie failed:', error);
      }
    },
    [fetchMovies]
  );

  const handleRate = useCallback(
    async (movieId: number, rating: number) => {
      setMovies((prevMovies) =>
        (Array.isArray(prevMovies) ? prevMovies : []).map((movie) =>
          Number(movie?.id) === Number(movieId)
            ? { ...movie, userRating: rating }
            : movie
        )
      );

      try {
        await watchedService.updateRating(movieId, rating);
      } catch (error) {
        console.error('update watched rating failed:', error);
        await fetchMovies();
      }
    },
    [fetchMovies]
  );

  const isWatched = useCallback(
    (movieId: number) => {
      return (Array.isArray(movies) ? movies : []).some(
        (movie) => Number(movie?.id) === Number(movieId)
      );
    },
    [movies]
  );

  const getUserRating = useCallback(
    (movieId: number) => {
      const movie = (Array.isArray(movies) ? movies : []).find(
        (item) => Number(item?.id) === Number(movieId)
      );

      return movie?.userRating ?? 0;
    },
    [movies]
  );

  return {
    movies: Array.isArray(movies) ? movies : [],
    isLoading,
    addMovie: handleAdd,
    rateMovie: handleRate,
    removeMovie: handleRemove,
    refreshMovies: fetchMovies,
    isWatched,
    getUserRating,
  };
};