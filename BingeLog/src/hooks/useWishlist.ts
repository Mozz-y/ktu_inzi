import { useEffect, useState } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlist';

export const useWishlist = () => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        const data = await getWishlist();
        setWishlist(data);
    };

    const add = async (movie) =>{
        const updated = await addToWishlist(movie);
        setWishlist(updated);
    };

    const remove = async (id) => {
        const updated = await removeFromWishlist(id);
        setWishlist(updated);
    };

    return { wishlist, add, remove };
};