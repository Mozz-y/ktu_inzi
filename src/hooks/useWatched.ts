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

  const handleRemove = async (id: string) => {
    await watchedService.removeMovie(id);
    await fetchMovies(); // Atnaujinam sąrašą
  };

  const handleRate = async (id: string, rating: number) => {
    await watchedService.updateRating(id, rating);
    await fetchMovies();
  };

  return { movies, addMovie: handleAdd, rateMovie: handleRate, removeMovie: handleRemove, refreshMovies: fetchMovies };
};