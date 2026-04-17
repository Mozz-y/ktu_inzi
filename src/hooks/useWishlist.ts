import { useCallback, useEffect, useState } from 'react';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../services/wishlist';
import { Movie } from '../types/movie';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await getWishlist();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('loadWishlist failed:', error);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const add = useCallback(async (movie: Movie) => {
    try {
      const updated = await addToWishlist(movie);
      setWishlist(Array.isArray(updated) ? updated : []);
    } catch (error) {
      console.error('addToWishlist failed:', error);
    }
  }, []);

  const remove = useCallback(async (movieId: number) => {
    try {
      const updated = await removeFromWishlist(movieId);
      setWishlist(Array.isArray(updated) ? updated : []);
    } catch (error) {
      console.error('removeFromWishlist failed:', error);
    }
  }, []);

  const isInWishlist = useCallback(
    (movieId: number) => {
      return (Array.isArray(wishlist) ? wishlist : []).some(
        (movie) => Number(movie?.id) === Number(movieId)
      );
    },
    [wishlist]
  );

  return {
    wishlist: Array.isArray(wishlist) ? wishlist : [],
    isLoading,
    add,
    remove,
    isInWishlist,
    refreshWishlist: loadWishlist,
  };
};