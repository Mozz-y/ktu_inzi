import { SymbolView } from 'expo-symbols';
import React, { useState, useMemo, useEffect } from 'react';
import { Modal, View, TextInput, Platform, Pressable,
    ScrollView, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Picker } from '@react-native-picker/picker';
import { mockMovies } from '@/data/movies';
import { Feather } from '@expo/vector-icons';
import { searchMovies, fetchMoviesByCategory } from '../Services/tmdb';


export default function ExploreScreen(){
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [movies, setMovies] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState('All Genres');
    const [selectedSorting, setSelectedSorting] = useState('Rating');
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const genres = ["All Genres","Action","Drama","Comedy","Sci-Fi"];
    const sorting = ['Rating','Year','Title'];

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
    let result = [...movies];

    // Žanrų filtravimas (kadangi tmdb.ts dabar negrąžina ID, filtruojame pagal pavadinimą arba paliekame ateičiai)
    if (selectedGenre !== 'All Genres') {
        // Kol kas TMDB žanrų integracija sudėtingesnė, tad šitą galime palikti tuščią 
        // arba filtruoti jei tavo tmdb.ts pridėtum žanrų ID.
    }

    // RŪŠIAVIMAS (SVARBU: čia naudojame parseFloat, nes reitingas yra tekstas)
    if (selectedSorting === 'Rating') {
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (selectedSorting === 'Year') {
        result.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    } else if (selectedSorting === 'Title') {
        result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
}, [movies, selectedSorting]); // Išėmiau selectedGenre iš priklausomybių, jei jo nenaudojame

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
                    renderItem={({ item }) => <MovieCard movie={item} />}
                    ListEmptyComponent={() => (
                    <View style={{ alignItems: 'center', marginTop: 100 }}>
                    <Feather name="search" size={50} color="#ccc" />
                    <ThemedText style={{ marginTop: 10, color: '#888' }}>
                        No movies found. Try another title!
                    </ThemedText>
                    </View>
                )}
                />
            </SafeAreaView>
        </ThemedView>
    );
}

function MovieCard({ movie }){
    return (
        <View style={styles.card}>
            <Image source = {{uri : movie.posterUrl }} style = {styles.poster} />

            <View style = {styles.rating}>
               <ThemedText style = {styles.movieText}>⭐ {movie.rating}</ThemedText>
            </View>

            <ThemedText style = {styles.movieText}>{movie.title}</ThemedText>
            <ThemedText style = {styles.movieText}>{movie.year}</ThemedText>
        </View>
    );
}

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
