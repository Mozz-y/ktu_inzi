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

    const remove = async (id: string) => {
        const updated = await removeFromWishlist(id);
        setWishlist(updated);
    };

    const isInWishlist = (id: string) => {
        return wishlist.some(m => m.id === id);
    };

    return { wishlist, add, remove, isInWishlist };
};