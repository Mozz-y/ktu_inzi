import { useEffect, useState } from 'react';
import { addToWishlist, getWishlist, removeFromWishlist } from '../services/wishlist';
import { Movie } from '../types/movie';

export const useWishlist = () => {
    const [wishlist, setWishlist] = useState<Movie[]>([]);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        const data = await getWishlist();
        setWishlist(data);
    };

    const add = async (movie: Movie) =>{
        const updated = await addToWishlist(movie);
        setWishlist(updated);
    };

    const remove = async (movieId: number) => {
        const updated = await removeFromWishlist(movieId.toString());
        setWishlist(updated);
    };

    const isInWishlist = (movieId: number) => {
        return wishlist.some(m => m.id === movieId);
    };

    return { wishlist, add, remove, isInWishlist };
};