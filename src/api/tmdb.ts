import { config } from '../config';

const API_KEY = (config.tmdbApiKey || '').trim();
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type GenreMap = Record<string, number>;
type GenreNameMap = Record<number, string>;

type TmdbGenre = {
  id?: number;
  name?: string;
};

type TmdbMovie = {
  id?: number;
  title?: string;
  release_date?: string;
  vote_average?: number;
  poster_path?: string | null;
  overview?: string;
  genre_ids?: number[];
};

type TmdbResultsResponse = {
  results?: TmdbMovie[];
};

type TmdbGenresResponse = {
  genres?: TmdbGenre[];
};

type AppMovie = {
  id: number;
  title: string;
  year: string;
  rating: number;
  posterUrl: string;
  description: string;
  genre: (string | number)[];
};

const shouldUseMockData = !API_KEY;

let genreIdMap: GenreMap = {};
let genreNameMap: GenreNameMap = {};

const MOCK_GENRES: GenreMap = {
  Action: 28,
  Drama: 18,
  Comedy: 35,
  Thriller: 53,
  'Science Fiction': 878,
  Animation: 16,
  Family: 10751,
};

const MOCK_MOVIES: AppMovie[] = [
  {
    id: 1,
    title: 'Inception',
    year: '2010',
    rating: 8.8,
    posterUrl: `${IMAGE_BASE_URL}/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg`,
    description:
      'A thief who steals corporate secrets through dream-sharing technology is given a chance at redemption.',
    genre: [28, 878, 53],
  },
  {
    id: 2,
    title: 'Interstellar',
    year: '2014',
    rating: 8.7,
    posterUrl: `${IMAGE_BASE_URL}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
    description:
      'A team of explorers travels through a wormhole in space in an attempt to ensure humanity’s survival.',
    genre: [18, 878],
  },
  {
    id: 3,
    title: 'The Dark Knight',
    year: '2008',
    rating: 9.0,
    posterUrl: `${IMAGE_BASE_URL}/qJ2tW6WMUDux911r6m7haRef0WH.jpg`,
    description: 'Batman raises the stakes in his war on crime and faces the Joker.',
    genre: [28, 18, 53],
  },
  {
    id: 4,
    title: 'Toy Story',
    year: '1995',
    rating: 8.3,
    posterUrl: `${IMAGE_BASE_URL}/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg`,
    description: 'A story of toys coming to life when humans are not around.',
    genre: [16, 35, 10751],
  },
];

const buildPosterUrl = (posterPath?: string | null): string => {
  if (!posterPath) {
    return '';
  }

  return `${IMAGE_BASE_URL}${posterPath}`;
};

const mapTmdbMovie = (movie: TmdbMovie): AppMovie => ({
  id: typeof movie?.id === 'number' ? movie.id : 0,
  title: typeof movie?.title === 'string' && movie.title.trim()
    ? movie.title.trim()
    : 'Unknown title',
  year:
    typeof movie?.release_date === 'string' && movie.release_date.includes('-')
      ? movie.release_date.split('-')[0]
      : 'N/A',
  rating: typeof movie?.vote_average === 'number' ? movie.vote_average : 0,
  posterUrl: buildPosterUrl(movie?.poster_path),
  description: typeof movie?.overview === 'string' ? movie.overview : '',
  genre: Array.isArray(movie?.genre_ids) ? movie.genre_ids : [],
});

const safeResultsArray = (data: unknown): TmdbMovie[] => {
  const candidate = data as TmdbResultsResponse | null | undefined;
  return Array.isArray(candidate?.results) ? candidate.results : [];
};

const hydrateMockGenres = (): GenreMap => {
  genreIdMap = { ...MOCK_GENRES };
  genreNameMap = {};

  Object.entries(MOCK_GENRES).forEach(([name, id]) => {
    genreNameMap[id] = name;
  });

  return genreIdMap;
};

export const fetchGenres = async (): Promise<GenreMap> => {
  if (Object.keys(genreIdMap).length > 0) {
    return genreIdMap;
  }

  if (shouldUseMockData) {
    return hydrateMockGenres();
  }

  try {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      console.error(`fetchGenres HTTP error: ${response.status}`);
      return hydrateMockGenres();
    }

    const data = (await response.json()) as TmdbGenresResponse;

    genreIdMap = {};
    genreNameMap = {};

    const genres = Array.isArray(data?.genres) ? data.genres : [];

    genres.forEach((genre) => {
      if (typeof genre?.name === 'string' && typeof genre?.id === 'number') {
        genreIdMap[genre.name] = genre.id;
        genreNameMap[genre.id] = genre.name;
      }
    });

    if (Object.keys(genreIdMap).length === 0) {
      return hydrateMockGenres();
    }

    return genreIdMap;
  } catch (error) {
    console.error('fetchGenres error:', error);
    return hydrateMockGenres();
  }
};

export const getGenreNames = (genreIds: (string | number)[] = []): string[] => {
  if (!Array.isArray(genreIds)) {
    return [];
  }

  return genreIds
    .map((id) => genreNameMap[Number(id)])
    .filter((name): name is string => typeof name === 'string' && name.length > 0);
};

export const fetchMoviesByCategory = async (category: string): Promise<AppMovie[]> => {
  if (shouldUseMockData) {
    return [...MOCK_MOVIES];
  }

  let endpoint = '/trending/movie/day';

  if (category === 'Popular') {
    endpoint = '/movie/popular';
  } else if (category === 'New Releases') {
    endpoint = '/movie/now_playing';
  } else if (category === 'Recommended') {
    endpoint = '/movie/top_rated';
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      console.error(`fetchMoviesByCategory HTTP error: ${response.status}`);
      return [...MOCK_MOVIES];
    }

    const data = (await response.json()) as TmdbResultsResponse;
    const results = safeResultsArray(data);

    return Array.isArray(results) ? results.map(mapTmdbMovie) : [];
  } catch (error) {
    console.error('fetchMoviesByCategory error:', error);
    return [...MOCK_MOVIES];
  }
};

export const searchMovies = async (query: string): Promise<AppMovie[]> => {
  const safeQuery = typeof query === 'string' ? query.trim() : '';

  if (!safeQuery) {
    return [];
  }

  if (shouldUseMockData) {
    const q = safeQuery.toLowerCase();
    return MOCK_MOVIES.filter((movie) =>
      String(movie?.title ?? '').toLowerCase().includes(q)
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        safeQuery
      )}&language=en-US`
    );

    if (!response.ok) {
      console.error(`searchMovies HTTP error: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as TmdbResultsResponse;
    const results = safeResultsArray(data);

    return Array.isArray(results) ? results.map(mapTmdbMovie) : [];
  } catch (error) {
    console.error('searchMovies error:', error);
    return [];
  }
};