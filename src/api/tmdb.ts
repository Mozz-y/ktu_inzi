import { config } from '../config';

const API_KEY = config.tmdbApiKey;
const BASE_URL = 'https://api.themoviedb.org/3';

let genreIdMap: { [key: string]: number } = {};
let genreNameMap: { [key: number]: string } = {
  28: 'Action',
  18: 'Drama',
  35: 'Comedy',
  53: 'Thriller',
  878: 'Science Fiction',
  16: 'Animation',
  10751: 'Family',
};

const isDemoMode =
  !API_KEY ||
  API_KEY.trim().length === 0 ||
  API_KEY.includes('PASTE') ||
  API_KEY.includes('YOUR_KEY');

const DEMO_MOVIES = [
  {
    id: 101,
    title: 'Demo Action Movie',
    year: '2024',
    rating: 8.2,
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    description: 'Demo action movie used when TMDB API key is missing.',
    genre: [28, 53],
  },
  {
    id: 102,
    title: 'Demo Drama Story',
    year: '2023',
    rating: 7.8,
    posterUrl: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    description: 'Demo drama movie used for offline testing.',
    genre: [18],
  },
  {
    id: 103,
    title: 'Demo Comedy Night',
    year: '2022',
    rating: 7.1,
    posterUrl: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg',
    description: 'Demo comedy movie used for UI testing.',
    genre: [35],
  },
  {
    id: 104,
    title: 'Demo Sci-Fi World',
    year: '2025',
    rating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg',
    description: 'Demo science fiction movie used for Web and Android testing.',
    genre: [878],
  },
  {
    id: 105,
    title: 'Demo Family Film',
    year: '2021',
    rating: 6.9,
    posterUrl: 'https://image.tmdb.org/t/p/w500/wToO8opxkGwKgSfJ1JK8tGvkG6U.jpg',
    description: 'Demo family movie for fallback mode.',
    genre: [10751],
  },
  {
    id: 106,
    title: 'Demo Animation',
    year: '2020',
    rating: 7.5,
    posterUrl: 'https://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg',
    description: 'Demo animation movie for testing movie cards.',
    genre: [16, 10751],
  },
];

const DEMO_ACTORS = [
  {
    id: 201,
    name: 'Tom',
    surname: 'Hanks',
    imageUrl: 'https://via.placeholder.com/200x300?text=Tom+Hanks',
    character: 'Main character',
    popularity: 90,
  },
  {
    id: 202,
    name: 'Emma',
    surname: 'Stone',
    imageUrl: 'https://via.placeholder.com/200x300?text=Emma+Stone',
    character: 'Supporting character',
    popularity: 88,
  },
  {
    id: 203,
    name: 'Ryan',
    surname: 'Gosling',
    imageUrl: 'https://via.placeholder.com/200x300?text=Ryan+Gosling',
    character: 'Friend',
    popularity: 85,
  },
];

const toMovie = (m: any) => ({
  id: m?.id,
  title: m?.title || m?.name || 'Untitled',
  year: m?.release_date?.split('-')[0] || m?.year || 'N/A',
  rating: m?.vote_average || m?.rating || 0,
  posterUrl: m?.poster_path
    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
    : m?.posterUrl || 'https://via.placeholder.com/500x750?text=No+Image',
  description: m?.overview || m?.description || '',
  genre: Array.isArray(m?.genre_ids)
    ? m.genre_ids
    : Array.isArray(m?.genre)
      ? m.genre
      : [],
});

export const fetchGenres = async (): Promise<{ [key: string]: number }> => {
  if (Object.keys(genreIdMap).length > 0) return genreIdMap;

  genreIdMap = {
    Action: 28,
    Drama: 18,
    Comedy: 35,
    Thriller: 53,
    'Science Fiction': 878,
    Animation: 16,
    Family: 10751,
  };

  if (isDemoMode) return genreIdMap;

  try {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();

    const genres = Array.isArray(data?.genres) ? data.genres : [];

    genres.forEach((genre: any) => {
      if (genre?.name && genre?.id) {
        genreIdMap[genre.name] = genre.id;
        genreNameMap[genre.id] = genre.name;
      }
    });

    return genreIdMap;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return genreIdMap;
  }
};

export const getGenreNames = (genreIds: unknown): string[] => {
  if (!Array.isArray(genreIds)) return [];

  return genreIds
    .map((id) => {
      const numericId = Number(id);
      return genreNameMap[numericId];
    })
    .filter((name): name is string => Boolean(name));
};

export const fetchMoviesByCategory = async (category: string) => {
  if (isDemoMode) return DEMO_MOVIES;

  let endpoint = '/trending/movie/day';

  if (category === 'Popular') endpoint = '/movie/popular';
  if (category === 'New Releases') endpoint = '/movie/now_playing';
  if (category === 'Recommended') endpoint = '/movie/top_rated';

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();

    const results = Array.isArray(data?.results) ? data.results : [];

    if (results.length === 0) return DEMO_MOVIES;

    return results.map(toMovie);
  } catch (error) {
    console.error('Error fetching movies by category:', error);
    return DEMO_MOVIES;
  }
};

export const fetchMovieTrailer = async (
  movieId: number
): Promise<string | null> => {
  if (isDemoMode) {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }

  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();

    const results = Array.isArray(data?.results) ? data.results : [];

    const trailer = results.find(
      (video: any) => video?.site === 'YouTube' && video?.type === 'Trailer'
    );

    return trailer?.key
      ? `https://www.youtube.com/watch?v=${trailer.key}`
      : null;
  } catch (error) {
    console.error(`Error fetching trailer for movie ${movieId}:`, error);
    return null;
  }
};

export const searchMovies = async (query: string) => {
  if (!query) return DEMO_MOVIES;

  if (isDemoMode) {
    const normalizedQuery = query.toLowerCase();

    return DEMO_MOVIES.filter((movie) =>
      movie.title.toLowerCase().includes(normalizedQuery)
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}&language=en-US`
    );
    const data = await response.json();

    const results = Array.isArray(data?.results) ? data.results : [];

    return results.map(toMovie);
  } catch (error) {
    console.error('Search error:', error);
    return DEMO_MOVIES;
  }
};

export const searchMoviesByActor = async (actorName: string) => {
  if (!actorName) return DEMO_MOVIES;

  if (isDemoMode) {
    const normalizedActor = actorName.toLowerCase();

    if (
      normalizedActor.includes('tom') ||
      normalizedActor.includes('hanks') ||
      normalizedActor.includes('emma') ||
      normalizedActor.includes('stone') ||
      normalizedActor.includes('ryan') ||
      normalizedActor.includes('gosling')
    ) {
      return DEMO_MOVIES;
    }

    return DEMO_MOVIES.slice(0, 3);
  }

  try {
    const personResponse = await fetch(
      `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(
        actorName
      )}&language=en-US`
    );
    const personData = await personResponse.json();

    const people = Array.isArray(personData?.results)
      ? personData.results
      : [];

    if (people.length === 0) return [];

    const actorId = people[0]?.id;

    if (!actorId) return [];

    const moviesResponse = await fetch(
      `${BASE_URL}/person/${actorId}/movie_credits?api_key=${API_KEY}&language=en-US`
    );
    const moviesData = await moviesResponse.json();

    const cast = Array.isArray(moviesData?.cast) ? moviesData.cast : [];

    return cast
      .filter((m: any) => Boolean(m?.poster_path))
      .map((m: any) => ({
        ...toMovie(m),
        character: m?.character || '',
      }));
  } catch (error) {
    console.error('Actor search error:', error);
    return DEMO_MOVIES;
  }
};

export const fetchActorDetails = async (actorId: number) => {
  if (isDemoMode) {
    const actor = DEMO_ACTORS.find((item) => item.id === actorId);

    return {
      ...(actor ?? DEMO_ACTORS[0]),
      biography:
        'Demo actor biography. This data is shown because TMDB API key is missing.',
      birthday: '1970-01-01',
      placeOfBirth: 'Demo City',
      popularity: actor?.popularity ?? 80,
    };
  }

  try {
    const url = `${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data?.id) return null;

    return {
      id: data.id,
      name: data.name || 'Unknown',
      surname: '',
      imageUrl: data.profile_path
        ? `https://image.tmdb.org/t/p/w500${data.profile_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image',
      biography: data.biography || 'No biography available.',
      birthday: data.birthday || 'Unknown',
      placeOfBirth: data.place_of_birth || 'Unknown',
      popularity: data.popularity || 0,
    };
  } catch (error) {
    console.error('fetchActorDetails error:', error);
    return null;
  }
};

export const actorsByMovie = async (movieId: number) => {
  if (isDemoMode) return DEMO_ACTORS;

  try {
    const url = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const cast = Array.isArray(data?.cast) ? data.cast : [];

    return cast.slice(0, 10).map((actor: any) => {
      const fullName = actor?.name || '';
      const parts = fullName.split(' ');

      return {
        id: actor?.id,
        name: parts[0] || '',
        surname: parts.slice(1).join(' ') || '',
        imageUrl: actor?.profile_path
          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
          : 'https://via.placeholder.com/200x300?text=No+Image',
        character: actor?.character || '',
        popularity: actor?.popularity || 0,
      };
    });
  } catch (error) {
    console.error('actorsByMovie error:', error);
    return DEMO_ACTORS;
  }
};