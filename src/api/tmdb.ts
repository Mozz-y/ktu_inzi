import { config } from '../config';
const API_KEY = config.tmdbApiKey;
const BASE_URL = 'https://api.themoviedb.org/3';

// Genre ID mapping cache
let genreIdMap: { [key: string]: number } = {};
let genreNameMap: { [key: number]: string } = {}; // Reverse mapping for display

export const fetchGenres = async (): Promise<{ [key: string]: number }> => {
  if (Object.keys(genreIdMap).length > 0) return genreIdMap;

  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
    const data = await response.json();

    genreIdMap = {};
    genreNameMap = {};
    data.genres?.forEach((genre: any) => {
      genreIdMap[genre.name] = genre.id;
      genreNameMap[genre.id] = genre.name;
    });

    return genreIdMap;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return {};
  }
};

// Helper to convert genre IDs to names
export const getGenreNames = (genreIds: (string | number)[]): string[] => {
  return genreIds
    .map(id => genreNameMap[Number(id)])
    .filter(name => name !== undefined);
};

export const fetchMoviesByCategory = async (category: string) => {
  // TMDB naudoja kitokius pavadinimus, todėl pritaikom:
  let endpoint = '/trending/movie/day';
  if (category === 'Popular') {
    endpoint = '/movie/popular';
  } else if (category === 'New Releases') {
    endpoint = '/movie/now_playing';
  } else if (category === 'Recommended') {
    endpoint = '/movie/top_rated'; // TMDB "Top Rated" kolkas tinka rekomendacijoms
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
    const data = await response.json();

    // Suformuojame objektus taip, kad jie tiktų HomeScreen (posterUrl ir t.t.)
    return data.results.map((m: any) => ({
      id: m.id,
      title: m.title,
      year: m.release_date?.split('-')[0] || 'N/A',
      rating: m.vote_average,
      posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      description: m.overview,
      genre: m.genre_ids ? m.genre_ids : [] // Store genre IDs from API
    }));
  } catch (error) {
    console.error("Error:", error);
    return [];
  }

};

export const fetchMovieTrailer = async (movieId: number): Promise<string | null> => {
  try {
    // Kreipiamės į TMDB /videos galinį tašką (endpoint)
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();

    // Patikriname, ar gavome rezultatų
    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Ieškome oficialaus YouTube treilerio
    const trailer = data.results.find(
      (video: any) => video.site === 'YouTube' && video.type === 'Trailer'
    );

    // Jei radome, grąžiname jo raktą (pvz., "6JnN1DmbqoU"), jei ne - null
    return trailer ? trailer.key : null;
    
  } catch (error) {
    console.error(`Error fetching trailer for movie ${movieId}:`, error);
    return null;
  }
};

export const searchMovies = async (query: string) => {
  if (!query) return []; // Jei nieko neįvedė, neieškome

  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
    );
    const data = await response.json();

    return data.results.map((m: any) => ({
      id: m.id,
      title: m.title,
      year: m.release_date?.split('-')[0] || 'N/A',
      rating: m.vote_average,
      posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      description: m.overview,
      genre: m.genre_ids ? m.genre_ids : [] // Store genre IDs from API
    }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};

export const actorsByMovie = async (movieId: number) => {

  try {
    const url = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
  const response = await fetch( url);
    const data = await response.json();
    return [];
    
  } catch (error) {
    console.error("actorsByMovie error:", error);
    return [];
  }
 
}