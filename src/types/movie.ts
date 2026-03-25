export type Movie ={
    id: number;
    title: string;
    year: string;
    rating: number;
    posterUrl: string;
    description: string;
    genre: string[];
};

export type WatchedMovie = Movie & {
    watchedAt: string;
    userRating: number;
};