import { Header } from '@/components/Header';
import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWishlist } from '@/hooks/useWishlist';
import type { Movie } from '@/types/movie';
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Platform, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMoviesByCategory } from '../api/tmdb';
import { useWatched } from '../hooks/useWatched';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const theme = useTheme();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { wishlist, add, remove, isInWishlist } = useWishlist();
  const { movies: watchedMovies, addMovie, rateMovie, removeMovie } = useWatched();
  const drawerAnim = useRef(new Animated.Value(-screenWidth)).current;
  const [category, setCategory] = useState('Trending');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (category === 'Wishlist') return;

    const loadData = async () => {
      const data = await fetchMoviesByCategory(category);
      setMovies(data);
    };

    loadData();
  }, [category]);

  const menuItems = [
    { name: 'Trending', icon: 'trending-up' },
    { name: 'Recommended', icon: 'star' },
    { name: 'New Releases', icon: 'film' },
    { name: 'Wishlist', icon: 'heart' },
    { name: 'Popular', icon: 'thumbs-up' },
  ];

  const openMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeMovie = () => {
    setSelectedMovie(null);
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(drawerAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setMenuVisible(false));
  };

  const handleWishlistToggle = () => {
    if (!selectedMovie) return;

    if (isInWishlist(selectedMovie.id)) {
      remove(selectedMovie.id);
    } else {
      add(selectedMovie);
    }
  };

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
        <Header onMenuPress={openMenu} />

        {menuVisible && (
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={[styles.overlay, { backgroundColor: theme.overlay }]} />
          </TouchableWithoutFeedback>
        )}

        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View
            style={[
              styles.menu,
              {
                left: drawerAnim,
                backgroundColor: theme.card,
                shadowColor: theme.text,
              },
            ]}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.name}
                style={styles.menuText}
                onPress={() => {
                  setCategory(item.name);
                  closeMenu();
                }}>
                <Feather name={item.icon as never} size={20} color={theme.text} style={styles.menuIcon} />
                <ThemedText>{item.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableWithoutFeedback>

        <ThemedText type="title" style={[styles.categoryTitle, { color: theme.title }]}>
          {category}
        </ThemedText>

        {category === 'Wishlist' && displayedMovies.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Start adding movies you want to watch!
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={displayedMovies}
            numColumns={2}
            columnWrapperStyle={styles.listRow}
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
            removeMovie(selectedMovie.id);
          } else {
            addMovie(selectedMovie);
          }
        }}
        onRate={handleSetRating}
        isInWishlist={selectedMovie ? isInWishlist(selectedMovie.id) : false}
        isWatched={isWatched}
        userRating={currentWatchedMovie?.userRating}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  categoryTitle: {
    textAlign: 'right',
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  container: {
    flex: 1,
  },
  emptyState: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.75,
  },
  listRow: {
    justifyContent: 'space-between',
  },
  menu: {
    paddingVertical: 60,
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 250,
    padding: 20,
    zIndex: 10,
    shadowOpacity: 0.25,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 8,
    elevation: 5,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.one,
    alignItems: 'center',
    gap: Spacing.four,
    paddingBottom: -Spacing.four,
    maxWidth: MaxContentWidth,
  },
});
