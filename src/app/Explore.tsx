import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
<<<<<<< HEAD
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { searchMovies, fetchMoviesByCategory, fetchGenres, getGenreNames } from '../api/tmdb';
=======
import { Spacing } from '@/constants/theme';
import { useWatched } from '@/hooks/useWatched';
import { useWishlist } from '@/hooks/useWishlist';
>>>>>>> af43e19bbd861782096b35115ac8d752c0323b57
import type { Movie } from '@/types/movie';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMoviesByCategory, searchMovies } from '../api/tmdb';

export default function ExploreScreen(){
    const [search, setSearch] = useState('');
<<<<<<< HEAD
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
=======
    const [movies, setMovies] = useState<Movie[]>([]); 
>>>>>>> af43e19bbd861782096b35115ac8d752c0323b57
    const [selectedGenre, setSelectedGenre] = useState('All Genres');
    const [selectedSorting, setSelectedSorting] = useState('Rating');
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
<<<<<<< HEAD
    const [genreIdMap, setGenreIdMap] = useState<{ [key: string]: number }>({});

    const genres = ["All Genres","Action","Drama","Comedy","Sci-Fi","Adventure","Animation"];
=======
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const genres = ["All Genres","Action","Drama","Comedy","Sci-Fi"];
>>>>>>> af43e19bbd861782096b35115ac8d752c0323b57
    const sorting = ['Rating','Year','Title'];
    const { add, remove, isInWishlist } = useWishlist();
    const { movies: watchedMovies, addMovie, rateMovie, removeMovie } = useWatched();

    useEffect(() => {
        // Fetch genre mappings on mount
        const loadGenres = async () => {
            const genres = await fetchGenres();
            setGenreIdMap(genres);
        };
        loadGenres();
    }, []);

    useEffect(() => {
    const loadInitialOrSearch = async () => {
        if (search.length > 2) {
            // Jei ieškome
            const results = await searchMovies(search);
            setMovies(results);
        } else {
            // Jei paieška tuščia, užkrauname Trending
            const trending = await fetchMoviesByCategory('Trending');
            setMovies(trending);
        }
    };

    const delayDebounceFn = setTimeout(loadInitialOrSearch, 500);
    return () => clearTimeout(delayDebounceFn);
}, [search]);

const filteredMovies = useMemo(() => {
    let result: Movie[] = [...movies];

    // Žanrų filtravimas pagal selected genre ID
    if (selectedGenre !== 'All Genres' && genreIdMap[selectedGenre]) {
        const genreId = genreIdMap[selectedGenre];
        result = result.filter(movie =>
            Array.isArray(movie.genre) && movie.genre.includes(genreId as any)
        );
    }

    // RŪŠIAVIMAS (SVARBU: rating is now a number type)
    if (selectedSorting === 'Rating') {
        result.sort((a, b) => b.rating - a.rating);
    } else if (selectedSorting === 'Year') {
        result.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    } else if (selectedSorting === 'Title') {
        result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
}, [movies, selectedSorting, selectedGenre, genreIdMap]);

    return(
        <ThemedView style = {{flex: 1}}>
            <SafeAreaView style = {styles.container}>
                {/* Title */}
                <ThemedText type = "title" style = {styles.title}>
                    Search for Movies
                </ThemedText>

                {/* Search bar */}
                <TextInput
                    placeholder = "Search..."
                    value = {search}
                    onChangeText = {setSearch}
                    style = {styles.searchInput}
                />

                {/* Filters */}
                <View style={styles.filterRow}>
                    <View style = {styles.pickerWrapper}>
                        <TouchableOpacity
                            style = {styles.dropdown}
                            onPress={() => setShowGenreModal(true)}>
                            <ThemedText>{selectedGenre}</ThemedText>
                            <Feather name = "chevron-down" size = {18} color = 'gray'/>
                        </TouchableOpacity>
                    </View>

                    <View style = {styles.pickerWrapper}>
                        <TouchableOpacity
                            style = {styles.dropdown}
                            onPress={() => setShowSortModal(true)}>
                        <ThemedText>{selectedSorting}</ThemedText>
                            <Feather name = "chevron-down" size = {18} color = 'gray'/>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Genre pasirinkimo menu */}
                {showGenreModal && (
                    <Modal transparent animationType = "fade">
                        <TouchableOpacity
                            style = {styles.modalOverlay}
                            onPress={() => setShowGenreModal(false)}>
                            <View style = {styles.modalBox}>
                                {genres.map(g => (
                                    <TouchableOpacity
                                    key = {g}
                                    style = {styles.option}
                                    onPress = {() => {
                                        setSelectedGenre(g);
                                        setShowGenreModal(false);
                                    }}>
                                        <ThemedText>{g}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )}

            {/*Sort pasirinkimo menu*/}
            {showSortModal && (
                <Modal transparent animationType = "fade">
                    <TouchableOpacity
                        style = {styles.modalOverlay}
                        onPress={() => setShowSortModal(false)}>
                        <View style = {styles.modalBox}>
                            {sorting.map(g => (
                            <TouchableOpacity
                                key = {g}
                                style = {styles.option}
                                onPress = {() => {
                                    setSelectedSorting(g);
                                    setShowSortModal(false);
                                }}>
                                    <ThemedText>{g}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

                {/* Movie list */}
                <FlatList
                    data={filteredMovies} // PAKEISTA iš mockMovies
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => setSelectedMovie(item)}>
                            <MovieCard movie={item} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', marginTop: 100 }}>
                    <Feather name="search" size={50} color="#ccc" />
                    <ThemedText style={{ marginTop: 10, color: '#888' }}>
                        No movies found. Try another title!
                    </ThemedText>
                    </View>
                )}
                />

                <MovieModal
                    movie={selectedMovie}
                    visible={!!selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    onWishlistToggle={() => {
                        if (!selectedMovie) return;
                        if (isInWishlist(String(selectedMovie.id))) {
                            remove(String(selectedMovie.id));
                        } else {
                            add(selectedMovie);
                        }
                    }}
                    onMarkWatched={() => {
                        if (!selectedMovie) return;
                        const isWatched = watchedMovies.some(m => String(m.id) === String(selectedMovie.id));
                        if (isWatched) {
                            removeMovie(String(selectedMovie.id));
                        } else {
                            addMovie(selectedMovie);
                        }
                    }}
                    onRate={(rating) => {
                        if (!selectedMovie) return;
                        rateMovie(String(selectedMovie.id), rating);
                    }}
                    isInWishlist={selectedMovie ? isInWishlist(String(selectedMovie.id)) : false}
                    isWatched={!!watchedMovies.find(m => String(m.id) === String(selectedMovie?.id))}
                    userRating={watchedMovies.find(m => String(m.id) === String(selectedMovie?.id))?.userRating}
                />
            </SafeAreaView>
        </ThemedView>
    );
}

<<<<<<< HEAD
function MovieCard({ movie }: { movie: Movie }) {
    return (
        <View style={styles.card}>
            <Image source = {{uri : movie.posterUrl }} style = {styles.poster} />

            <View style = {styles.rating}>
               <ThemedText style = {styles.movieText}>⭐ {movie.rating.toFixed(1)}</ThemedText>
            </View>

            <ThemedText style = {styles.movieText}>{movie.title}</ThemedText>
            <ThemedText style = {styles.movieText}>{movie.year}</ThemedText>
        </View>
    );
}

=======
>>>>>>> af43e19bbd861782096b35115ac8d752c0323b57
const styles = StyleSheet.create({
    card:{
        width: '48%',
        marginBottom: 15,
    },
    centerText: {
      textAlign: 'center',
    },
    collapsibleContent: {
       alignItems: 'center',
    },
    contentContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: -30,
    },
    dropdown:{
        width: '100%',
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        paddingVertical: 0,
        paddingHorizontal: 15,
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filterRow:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    linkButton: {
       flexDirection: 'row',
       paddingHorizontal: Spacing.four,
       paddingVertical: Spacing.two,
       borderRadius: Spacing.five,
       justifyContent: 'center',
       gap: Spacing.one,
       alignItems: 'center',
    },
    modalBox:{
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        paddingLeft: 30,
    },
    modalOverlay:{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    option:{
        paddingVertical: 12,
    },
    pickerWrapper:{
        width: '48%',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        paddingLeft: 10,
    },
    poster:{
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 5,
    },
    pressed: {
        opacity: 0.7,
    },
    scrollView: {
      flex: 1,
    },
    searchInput:{
        backgroundColor: '#f2f2f2',
        borderRadius : 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
    },
    sectionsWrapper: {
       gap: Spacing.five,
       paddingHorizontal: Spacing.four,
       paddingTop: Spacing.three,
    },
    movieText: {
        marginTop: 5,
        fontSize: 14,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    titleContainer: {
        gap: Spacing.three,
        alignItems: 'center',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.six,
    },
    title:{
        marginTop: 15,
        marginBottom: 15,
        color: 'black',
    },
    year:{
        color: '#888',
    },
});
