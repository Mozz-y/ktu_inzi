import { config } from '../config';
const API_KEY = config.tmdbApiKey;
const BASE_URL = 'https://api.themoviedb.org/3';

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
      id: m.id.toString(),
      title: m.title,
      year: m.release_date?.split('-')[0] || 'N/A',
      rating: m.vote_average.toFixed(1),
      posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      description: m.overview,
      genre: ['Movie'] // TMDB duoda ID, pradžiai palikim taip
    }));
  } catch (error) {
    console.error("Error:", error);
    return [];
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
      id: m.id.toString(),
      title: m.title,
      year: m.release_date?.split('-')[0] || 'N/A',
      rating: m.vote_average.toFixed(1),
      posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      description: m.overview,
      genre: ['Movie']
    }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};