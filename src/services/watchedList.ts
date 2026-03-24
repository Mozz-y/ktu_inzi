import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, WatchedMovie } from '../types/movie';

const WATCHED_STORAGE_KEY = '@watched_movies';

export const watchedService = {
  // 1. Gauti visą sąrašą (SCRUM-103)
  async getWatchedMovies(): Promise<WatchedMovie[]> {
    const jsonValue = await AsyncStorage.getItem(WATCHED_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  },

  // 2. Pridėti filmą (SCRUM-99 & 102)
  async addMovie(movie: Movie): Promise<void> {
    const currentList = await this.getWatchedMovies();
    
    // Tikrinam, ar jau yra sąraše
    if (currentList.some(m => m.id === movie.id)) return;

    const newMovie: WatchedMovie = {
      ...movie,
      watchedAt: new Date().toISOString(),
      userRating: 0 // Pradžioje reitingas nulis
    };

    const newList = [...currentList, newMovie];
    await AsyncStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(newList));
  },

  async removeMovie(movieId: string): Promise<void> {
    const currentList = await this.getWatchedMovies();
    // Paliekame tik tuos filmus, kurių ID nesutampa su trinamo filmo ID
    const newList = currentList.filter(m => String(m.id) !== String(movieId));
    await AsyncStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(newList));
  },

  // 3. Atnaujinti reitingą (SCRUM-100)
  async updateRating(movieId: string, newUserRating: number): Promise<void> {
    const currentList = await this.getWatchedMovies();
    const newList = currentList.map(m => 
      m.id === movieId ? { ...m, userRating: newUserRating } : m
    );
    // Surūšiuojam iškart pagal reitingą (SCRUM-100 Rank dalis)
    newList.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    
    await AsyncStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(newList));
  }
};