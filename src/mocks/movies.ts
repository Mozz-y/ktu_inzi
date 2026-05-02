export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  posterUrl: string;
  description: string;
  actors: string[];
  comments: Comment[];
  userRating?: number;
  watched?: boolean;
  watchLater?: boolean;
}

export interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  rating: number;
  timestamp: string;
}

export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    year: 1994,
    genre: ["Drama"],
    rating: 9.3,
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    actors: ["Tim Robbins", "Morgan Freeman"],
    comments: [
      {
        id: 1,
        user: "John Doe",
        avatar: "https://images.unsplash.com/photo-1511367461584-a89df32912df?w=400",
        text: "A masterpiece of storytelling and acting.",
        rating: 5,
        timestamp: "2023-10-01T12:00:00Z",
      },
      {
        id: 2,
        user: "Jane Smith",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        text: "Incredibly moving and thought-provoking.",
        rating: 5,
        timestamp: "2023-10-02T14:30:00Z",
      },
    ],
    userRating: 5,
    watched: true,
  },
  {
    id: 2,
    title: "The Godfather",
    year: 1972,
    genre: ["Crime", "Drama"],
    rating: 9.2,
    posterUrl: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    actors: ["Marlon Brando", "Al Pacino"],
    comments: [
      {
        id: 3,
        user: "Alice Johnson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        text: "A classic that never gets old.",
        rating: 5,
        timestamp: "2023-10-03T16:45:00Z",
      },
    ],
    userRating: 5,
    watched: true,
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    genre: ["Action", "Crime", "Drama"],
    rating: 9.0,
    posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    actors: ["Christian Bale", "Heath Ledger"],
    comments: [
      {
        id: 4,
        user: "Bob Brown",
        avatar: "https://images.unsplash.com/photo-1511367461584-a89df32912df?w=400",
        text: "A thrilling and intense superhero film.",
        rating: 5,
        timestamp: "2023-10-04T18:00:00Z",
      },
    ],
    userRating: 4,
    watched: true,
  },
  {
    id: 4,
    title: "Pulp Fiction",
    year: 1994,
    genre: ["Crime", "Drama"],
    rating: 8.9,
    posterUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    actors: ["John Travolta", "Uma Thurman"],
    comments: [
      {
        id: 5,
        user: "Charlie Davis",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        text: "A unique and engaging story.",
        rating: 5,
        timestamp: "2023-10-05T20:15:00Z",
      },
    ],
    watchLater: true,
  },
  {
    id: 5,
    title: "Inception",
    year: 2010,
    genre: ["Action", "Sci-Fi", "Thriller"],
    rating: 8.8,
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
    actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
    comments: [
      {
        id: 6,
        user: "Diana White",
        avatar: "https://images.unsplash.com/photo-1511367461584-a89df32912df?w=400",
        text: "A mind-bending and visually stunning film.",
        rating: 5,
        timestamp: "2023-10-06T22:30:00Z",
      },
    ],
    userRating: 5,
    watched: true,
  },
  {
    id: 6,
    title: "The Matrix",
    year: 1999,
    genre: ["Action", "Sci-Fi"],
    rating: 8.7,
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    actors: ["Keanu Reeves", "Laurence Fishburne"],
    comments: [
      {
        id: 7,
        user: "Ethan Black",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        text: "A groundbreaking and influential film.",
        rating: 5,
        timestamp: "2023-10-07T00:45:00Z",
      },
    ],
    userRating: 4,
    watched: true,
  },
  {
    id: 7,
    title: "Interstellar",
    year: 2014,
    genre: ["Adventure", "Drama", "Sci-Fi"],
    rating: 8.6,
    posterUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    actors: ["Matthew McConaughey", "Anne Hathaway"],
    comments: [
      {
        id: 8,
        user: "Fiona Green",
        avatar: "https://images.unsplash.com/photo-1511367461584-a89df32912df?w=400",
        text: "A profound and emotional journey.",
        rating: 5,
        timestamp: "2023-10-08T03:00:00Z",
      },
    ],
    watchLater: true,
  },
  {
    id: 8,
    title: "Parasite",
    year: 2019,
    genre: ["Drama", "Thriller"],
    rating: 8.6,
    posterUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    actors: ["Song Kang-ho", "Lee Sun-kyun"],
    comments: [
      {
        id: 9,
        user: "George White",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        text: "A powerful and socially relevant film.",
        rating: 5,
        timestamp: "2023-10-09T05:15:00Z",
      },
    ],
  },
  {
    id: 9,
    title: "Dune: Part Two",
    year: 2024,
    genre: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.5,
    posterUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    actors: ["Timothée Chalamet", "Zendaya"],
    comments: [
      {
        id: 10,
        user: "Hannah Brown",
        avatar: "https://images.unsplash.com/photo-1511367461584-a89df32912df?w=400",
        text: "A grand and epic adventure.",
        rating: 5,
        timestamp: "2023-10-10T07:30:00Z",
      },
    ],
  },
  {
    id: 10,
    title: "Oppenheimer",
    year: 2023,
    genre: ["Biography", "Drama", "History"],
    rating: 8.4,
    posterUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    actors: ["Robert Downey Jr.", "Cillian Murphy"],
    comments: [
      {
        id: 11,
        user: "Ian Black",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        text: "A fascinating and well-researched biopic.",
        rating: 5,
        timestamp: "2023-10-11T09:45:00Z",
      },
    ],
  },
  {
    id: 11,
    title: "The Whale",
    year: 2022,
    genre: ["Drama"],
    rating: 7.7,
    posterUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400",
    description: "A reclusive English teacher suffering from severe obesity attempts to reconnect with his estranged teenage daughter.",
    actors: ["Benedict Cumberbatch", "Sadie Sink"],
    comments: [
      {
        id: 12,
        user: "Jenna White",
        avatar: "https://images.unsplash.com/photo-1511367461584-a89df32912df?w=400",
        text: "A poignant and heartwarming story.",
        rating: 5,
        timestamp: "2023-10-12T12:00:00Z",
      },
    ],
  },
  {
    id: 12,
    title: "Everything Everywhere All at Once",
    year: 2022,
    genre: ["Action", "Adventure", "Comedy"],
    rating: 8.0,
    posterUrl: "https://images.unsplash.com/photo-1574267432644-f610a4ab6a5c?w=400",
    description: "An aging Chinese immigrant is swept up in an insane adventure in which she alone can save the world.",
    actors: ["Michelle Yeoh", "Ke Huy Quan"],
    comments: [
      {
        id: 13,
        user: "Kevin Brown",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        text: "A wild and hilarious ride.",
        rating: 5,
        timestamp: "2023-10-13T14:30:00Z",
      },
    ],
    watchLater: true,
  },
  {
    id: 13,
    title: "Top Gun: Maverick",
    year: 2022,
    genre: ["Action", "Drama"],
    rating: 8.3,
    posterUrl: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past.",
    actors: ["Tom Cruise", "Miles Teller"],
    comments: [
      {
        id: 14,
        user: "Laura Green",
        avatar: "https://images.unsplash.com/photo-1511367461584-a89df32912df?w=400",
        text: "A thrilling and nostalgic action film.",
        rating: 5,
        timestamp: "2023-10-14T16:45:00Z",
      },
    ],
  },
  {
    id: 14,
    title: "Avatar: The Way of Water",
    year: 2022,
    genre: ["Action", "Adventure", "Fantasy"],
    rating: 7.6,
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.",
    actors: ["Sam Worthington", "Zoe Saldana"],
    comments: [
      {
        id: 15,
        user: "Michael White",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        text: "A visually stunning and immersive experience.",
        rating: 5,
        timestamp: "2023-10-15T18:00:00Z",
      },
    ],
  },
  {
    id: 15,
    title: "The Batman",
    year: 2022,
    genre: ["Action", "Crime", "Drama"],
    rating: 7.9,
    posterUrl: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400",
    description: "When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate.",
    actors: ["Robert Pattinson", "Zoe Kravitz"],
    comments: [
      {
        id: 16,
        user: "Nancy Brown",
        avatar: "https://images.unsplash.com/photo-1511367461584-a89df32912df?w=400",
        text: "A dark and gritty superhero film.",
        rating: 5,
        timestamp: "2023-10-16T20:15:00Z",
      },
    ],
  },
];
