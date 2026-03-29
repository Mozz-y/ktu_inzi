import { useState, useEffect } from 'react';
import { watchedService } from '../services/watchedList';
import { WatchedMovie, Movie } from '../types/movie';

export const useWatched = () => {
  const [movies, setMovies] = useState<WatchedMovie[]>([]);

  const fetchMovies = async () => {
    const data = await watchedService.getWatchedMovies();
    setMovies(data);
  };

  // Paprastas užkrovimas pirmą kartą
  useEffect(() => {
    fetchMovies();
  }, []);

  const handleAdd = async (movie: Movie) => {
    await watchedService.addMovie(movie);
    await fetchMovies(); // Atnaujinam sąrašą ekrane
  };

  const handleRemove = async (movieId: number) => {
    await watchedService.removeMovie(movieId.toString());
    await fetchMovies(); // Atnaujinam sąrašą
  };

  const handleRate = async (movieId: number, rating: number) => {
    await watchedService.updateRating(movieId.toString(), rating);
    await fetchMovies();
  };

  return { movies, addMovie: handleAdd, rateMovie: handleRate, removeMovie: handleRemove, refreshMovies: fetchMovies };
};