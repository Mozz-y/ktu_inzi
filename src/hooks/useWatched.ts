import { useEffect, useState } from 'react';
import { watchedService } from '../services/watchedList';
import { Movie, WatchedMovie } from '../types/movie';

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
  // 1. Iškart atnaujiname vietinę būseną (state), kad vartotojas pamatytų pokytį
  setMovies(prevMovies => 
    prevMovies.map(m => 
      // Svarbu: užtikriname, kad ID būtų lyginami teisingai (abu paverčiam į String)
      String(m.id) === String(movieId) ? { ...m, userRating: rating } : m
    )
  );

  try {
    // 2. Siunčiame užklausą į duomenų bazę fone
    await watchedService.updateRating(movieId.toString(), rating);
    // 3. Papildomai galime persiuntį šviežius duomenis užtikrinimui
    // await fetchMovies(); 
  } catch (error) {
    console.error("Nepavyko atnaujinti reitingo:", error);
    // Jei įvyko klaida, būtų gerai vėl paleisti fetchMovies(), kad grįžtų seni duomenys
    fetchMovies();
  }
};

  return { movies, addMovie: handleAdd, rateMovie: handleRate, removeMovie: handleRemove, refreshMovies: fetchMovies };
};