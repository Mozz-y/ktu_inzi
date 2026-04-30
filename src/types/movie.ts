export type Movie ={
    id: number;
    title: string;
    year: string;
    rating: number;
    posterUrl: string;
    description: string;
    genre: (string | number)[]; // Can be genre names (string) or IDs (number) from API
};

export type WatchedMovie = Movie & {
    watchedAt: string;
    userRating: number;
};