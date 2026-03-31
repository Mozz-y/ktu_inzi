import { Header } from '@/components/Header';
import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useWishlist } from '@/hooks/useWishlist';
import type { Movie } from '@/types/movie';
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMoviesByCategory } from '../api/tmdb';
import { useWatched } from '../hooks/useWatched';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const numColumns = 2;
const cardWidth = (screenWidth - cardMargin * (numColumns+1)) / numColumns;

export default function HomeScreen() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null); //Kai paspaudi ant filmu
    const { wishlist, add, remove, isInWishlist } = useWishlist();
    const { movies: watchedMovies, addMovie, rateMovie, removeMovie } = useWatched();
    const drawerAnim = useRef(new Animated.Value(-screenWidth)).current; //Pradzia uz ekrano

    const [category, setCategory] = useState('Trending');

    const [menuVisible, setMenuVisible] = useState(false);
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
    };
    const closeMovie = () => {
        setSelectedMovie(null);
    };

    {/*Menu atidarymas / uzdarymas*/}
  const openMenu = () => {
        setMenuVisible (true)
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
      setMenuVisible (false)
  }

  const handleWishlistToggle = () => {
    if (!selectedMovie) return;
    if(isInWishlist(String(selectedMovie.id))){
        remove(String(selectedMovie.id));
    } else {
        add (selectedMovie);
    }
  }

    const handleSetRating = (rating: number) => {
        if (selectedMovie) {
            rateMovie(String(selectedMovie.id), rating);
        }
    };

    const currentWatchedMovie = watchedMovies.find(m => String(m.id) === String(selectedMovie?.id));
    const isWatched = !!currentWatchedMovie;

    const displayedMovies = category === 'Wishlist' ? wishlist : movies;
  return (
    <ThemedView style={styles.container}>
          <SafeAreaView style={styles.safeArea}>

              {/* KATEGORIJU PASIRINKIMO MENU */}
              <Header onMenuPress={openMenu} />
              {menuVisible && (
                  <TouchableWithoutFeedback onPress={closeMenu}>
                      <View style={styles.overlay} />
                  </TouchableWithoutFeedback>
              )}

      <TouchableWithoutFeedback
          onPress={() => {
              closeMenu();
          } }
      >

              <Animated.View
                  style={[styles.menu, { left: drawerAnim }]}>

                  {menuItems.map(item => (
                      <TouchableOpacity
                          key={item.name}
                          style={styles.menuText}
                          onPress={() => {
                              setCategory(item.name);
                              closeMenu();
                          } }
                      >
                          <Feather name={item.icon as any} size={20} color="#000" style={styles.menuIcon} />
                          <ThemedText>{item.name}</ThemedText>
                      </TouchableOpacity>
                  ))}
              </Animated.View>
          </TouchableWithoutFeedback>

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
        
        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>

      <MovieModal
        movie={selectedMovie}
        visible={!!selectedMovie}
        onClose={closeMovie}
        onWishlistToggle={handleWishlistToggle}
        onMarkWatched={() => {
          if (!selectedMovie) return;
          if (isWatched) {
            removeMovie(String(selectedMovie.id));
          } else {
            addMovie(selectedMovie);
          }
        }}
        onRate={handleSetRating}
        isInWishlist={selectedMovie ? isInWishlist(String(selectedMovie.id)) : false}
        isWatched={isWatched}
        userRating={currentWatchedMovie?.userRating}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    categoryTitle:{
        textAlign: 'right',
        alignSelf: 'flex-start',
        marginLeft: 16,
    },
    container: {
      flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)', // optional tamsinimas
        zIndex: 5,
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
    safeArea: {
        flex: 1, //Flex = 1 reiskia kad uzpildo visa likusia erdve
        paddingHorizontal: Spacing.one, //Prideda tarpa is kaires ir desines
        alignItems: 'center', //centruoja vaikus horizontaliai
        gap: Spacing.four,
        paddingBottom: -Spacing.four, //Jeigu 0 tai siek tiek bus tuscias tarpas tarp filmu ir navigation bar apacioj
        maxWidth: MaxContentWidth,
    },
});
