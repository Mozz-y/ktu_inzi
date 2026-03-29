import { Header } from '@/components/Header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useWishlist } from '@/hooks/useWishlist';
import type { Movie } from '@/types/movie';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Dimensions,
    FlatList, Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMoviesByCategory, getGenreNames } from '../api/tmdb';
import { useWatched } from '../hooks/useWatched';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const numColumns = 2;
const cardWidth = (screenWidth - cardMargin * (numColumns+1)) / numColumns;

export default function HomeScreen() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null); //Kai paspaudi ant filmu
    const fadeAnim = useRef(new Animated.Value(0)).current; //Pradzioje invisible
    const { wishlist, add, remove, isInWishlist } = useWishlist();
    const { movies: watchedMovies, addMovie, rateMovie, removeMovie } = useWatched();
    const drawerAnim = useRef(new Animated.Value(-screenWidth)).current; //Pradzia uz ekrano

    const [category, setCategory] = useState('Trending');

    useEffect(() => {
    if(category === 'Wishlist') return;
    const loadData = async () => {
        const data = await fetchMoviesByCategory(category);
        setMovies(data);
    };
    loadData();
}, [category]);

    const menuItems = [
        {name: 'Trending', icon: 'trending-up'},
        {name: 'Recommended', icon: 'star'},
        {name: 'New Releases', icon: 'film'},
        {name: 'Wishlist', icon: 'heart'},
        {name: 'Popular', icon: 'thumbs-up'},
    ];

    {/*Filmu card atidarymas/uzdarymas*/}
    const openMovie = (movie: Movie) => {
        setSelectedMovie(movie);
        Animated.timing(fadeAnim,{
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };
    const closeMovie = () => {
        Animated.timing(fadeAnim,{
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedMovie(null)); //Passibaigus animacijai, paslepiam
    };

    {/*Menu atidarymas / uzdarymas*/}
  const openMenu = () => {
      Animated.timing(drawerAnim,{
          toValue: 0, //Visiskai matomas
          duration: 300,
          useNativeDriver: false,
      }).start();
  }
  const closeMenu = () => {
      Animated.timing(drawerAnim,{
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: false,
      }).start();
  }

  const handleWishlistToggle = () => {
    if (!selectedMovie) return;
    if(isInWishlist(selectedMovie.id)){
        remove(selectedMovie.id);
    } else {
        add (selectedMovie);
    }
  }

    const handleSetRating = (rating: number) => {
        if (selectedMovie) {
            rateMovie(selectedMovie.id, rating);
        }
    };

    const currentWatchedMovie = watchedMovies.find(m => String(m.id) === String(selectedMovie?.id));
    const isWatched = !!currentWatchedMovie;

    const displayedMovies = category === 'Wishlist' ? wishlist : movies;
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

      {/* KATEGORIJU PASIRINKIMO MENU */}
        <Header onMenuPress={openMenu}/>
        <Animated.View style={[styles.menu, {left: drawerAnim }]}>
            {menuItems.map(item => (
                <TouchableOpacity
                key = {item.name}
                style = {styles.menuText}
                onPress={() => {
                    setCategory(item.name);
                    closeMenu();
                    }}
                >
                    <Feather name = {item.icon as any} size = {20} color = "#000" style = {styles.menuIcon}/>
                    <ThemedText>{item.name}</ThemedText>
                </TouchableOpacity>
            ))}
        </Animated.View>

        {/* PAGRINDINIS HOME PAGE CONTENT */}
        <ThemedText type = "title" style = {styles.categoryTitle}>
        {category}
        </ThemedText>
        {category === 'Wishlist' && displayedMovies.length === 0 ? (
        <View style={{ marginTop: 50, alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 18, opacity: 0.6 }}>
                Start adding movies you want to watch!
            </ThemedText>
        </View>
        ) : (
            <FlatList
                data={displayedMovies}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => openMovie(item)}>
                        <MovieCard movie={item} />
                    </TouchableOpacity>
                )}
            />
        )}
        
        {/*Atidarome filmu info naujame langely paspaudus ant filmo*/}
        {selectedMovie && (
            <Animated.View
               style = {[styles.animatedModalBackground,{opacity: fadeAnim},]}
            >
                <TouchableOpacity style = {styles.modalBackground} activeOpacity = {1} onPress = {closeMovie}>
                    <Animated.View style = {styles.modalContent}>
                        <ScrollView>
                            <Image source = {{uri: selectedMovie.posterUrl}} style = {styles.modalPoster}/>
                            
                            <ThemedText style={styles.cardTitle}>
                                {selectedMovie.title}
                            </ThemedText>

                            <ThemedText style = {{marginTop:5}}>
                                {selectedMovie.year} | {getGenreNames(selectedMovie.genre).join(', ') || 'N/A'} | ⭐ {selectedMovie.rating.toFixed(1)}
                            </ThemedText>

                            <ThemedText style = {{marginTop:10}}>
                                {selectedMovie.description || 'No description available'}
                            </ThemedText>        
                        </ScrollView>
                    {/*Wishlist mygtukas*/}
                    <TouchableOpacity style = {styles.wishlistButton} onPress = {handleWishlistToggle}>
                        <Ionicons name = {isInWishlist(selectedMovie.id) ? 'heart' : 'heart-outline'}
                        size = {24}
                        color = "white"
                        />
                        <ThemedText style = {styles.wishlistText}>
                            {isInWishlist(selectedMovie.id) ?  'Remove from Wishlist' : 'Add to Wishlist'}
                        </ThemedText>
                    </TouchableOpacity>
                    {/* "Mark as Watched" button */}
                    <TouchableOpacity
                        style={[styles.wishlistButton, { backgroundColor: isWatched ? '#dc3545' : '#28a745', marginTop: 10 }]}
                        onPress={() => {
                            if (!selectedMovie) return;
                            if (isWatched) {
                                removeMovie(selectedMovie.id);
                            } else {
                                addMovie(selectedMovie);
                            }
                        }}
                    >
                        <Ionicons name={isWatched ? "close-circle-outline" : "checkmark-circle-outline"} size={24} color="white" />
                        <ThemedText style={styles.wishlistText}>
                            {isWatched ? 'Remove from Watched' : 'Mark as Watched'}
                        </ThemedText>
                    </TouchableOpacity>
                    {/* Rating option is visible only when seen */}
                    {isWatched && (
                        <View style={{ marginVertical: 15, alignItems: 'center' }}>
                            <ThemedText style={{ fontWeight: 'bold', marginBottom: 5 }}>Your Rating:</ThemedText>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => handleSetRating(star)}>
                                        <Ionicons
                                            name={ (currentWatchedMovie?.userRating || 0) >= star ? 'star' : 'star-outline' }
                                            size={30}
                                            color="#eab308"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        )}
        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
    return (
        <View style={styles.card}>
            <Image source = {{uri : movie.posterUrl }} style = {styles.poster} />

            <View style = {styles.rating}>
               <ThemedText>⭐ {movie.rating.toFixed(1)}</ThemedText>
            </View>

            <ThemedText>{movie.title}</ThemedText>
            <ThemedText>{movie.year}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    animatedModalBackground:{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    card:{
        width: cardWidth,
        marginBottom: 10,
        padding: 5,
    },
    cardTitle:{
        marginVertical: 15,
        fontSize: 25,
        color: 'black',
    },
    categoryTitle:{
        textAlign: 'right',
        alignSelf: 'flex-start',
        marginLeft: 16,
    },
    container: {
      flex: 1,
    },
    modalBackground:{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent:{
        flex: 1,
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        justifyContent: 'space-between',
        borderRadius: 15,
        padding: 20,
    },
    modalPoster:{
        width: '100%',
        height: 300,
        borderRadius: 15,
    },
    menu:{
        paddingVertical: 60,
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 250,
        backgroundColor: '#fff',
        padding: 20,
        zIndex: 10,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowOffset: {width: 2, height: 0},
        shadowRadius: 5,
        elevation: 5,
    },
    menuIcon:{
        marginRight: 10,
    },
    menuText:{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        fontSize: 30,
    },
    poster:{
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginBottom: 5,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    safeArea: {
        flex: 1, //Flex = 1 reiskia kad uzpildo visa likusia erdve
        paddingHorizontal: Spacing.one, //Prideda tarpa is kaires ir desines
        alignItems: 'center', //centruoja vaikus horizontaliai
        gap: Spacing.four,
        paddingBottom: -Spacing.four, //Jeigu 0 tai siek tiek bus tuscias tarpas tarp filmu ir navigation bar apacioj
        maxWidth: MaxContentWidth,
    },
    wishlistButton:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e50914',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 10,
        gap: 8,
    },
    wishlistText:{
        color: 'white',
        fontWeight: 'bold',
    },
});
