import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_KEY = 'wishlist';

//Gauti wishlist
export const getWishlist = async () => {
    const data = await AsyncStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
};

//Prideti filma
export const addToWishlist = async (movie) => {
    const wishlist = await getWishlist();

    //tikrinam ar jau yra filmas wishlist'e
    const exists = wishlist.find(item => item.id === movie.id);
    if(exists) return wishlist;

    const updated = [...wishlist, movie];
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
};

//Pasalinti filma
export const removeFromWishlist = async (movieId) => {
    const wishlist = await getWishlist();

    const updated = wishlist.filter(item => item.id !== movieId);
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    return updated;
};