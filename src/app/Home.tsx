import { Header } from '@/components/Header';
import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useWatched } from '@/hooks/useWatched';
import { useWishlist } from '@/hooks/useWishlist';
import type { Movie } from '@/types/movie';
import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMoviesByCategory } from '../api/tmdb';

const screenWidth = Dimensions.get('window').width;

type CategoryKey =
  | 'trending'
  | 'recommended'
  | 'newReleases'
  | 'wishlist'
  | 'popular';

type MenuItem = {
  key: CategoryKey;
  icon: keyof typeof Feather.glyphMap;
};

export default function HomeScreen() {
  const { t } = useTranslation();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [category, setCategory] = useState<CategoryKey>('trending');
  const [menuVisible, setMenuVisible] = useState(false);

  const { wishlist, add, remove, isInWishlist } = useWishlist();
  const {
    movies: watchedMovies,
    addMovie,
    rateMovie,
    removeMovie,
    isWatched,
    getUserRating,
  } = useWatched();

  const drawerAnim = useRef(new Animated.Value(-screenWidth)).current;

  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const safeWatchedMovies = Array.isArray(watchedMovies) ? watchedMovies : [];

  const menuItems: MenuItem[] = useMemo(
    () => [
      { key: 'trending', icon: 'trending-up' },
      { key: 'recommended', icon: 'star' },
      { key: 'newReleases', icon: 'film' },
      { key: 'wishlist', icon: 'heart' },
      { key: 'popular', icon: 'thumbs-up' },
    ],
    []
  );

  const tmdbCategoryMap: Record<Exclude<CategoryKey, 'wishlist'>, string> = {
    trending: 'Trending',
    recommended: 'Recommended',
    newReleases: 'New Releases',
    popular: 'Popular',
  };

  useEffect(() => {
    let isActive = true;

    if (category === 'wishlist') {
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchMoviesByCategory(tmdbCategoryMap[category]);
        if (isActive) {
          setMovies(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Home loadData failed:', error);
        if (isActive) {
          setMovies([]);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [category]);

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
    }).start(() => {
      setMenuVisible(false);
    });
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
    if (!selectedMovie) return;
    rateMovie(selectedMovie.id, rating);
  };

  const displayedMovies = category === 'wishlist' ? safeWishlist : movies;
  const selectedMovieIsWatched = selectedMovie ? isWatched(selectedMovie.id) : false;
  const selectedMovieUserRating = selectedMovie ? getUserRating(selectedMovie.id) : 0;

  const categoryTitle = t(`home.categories.${category}`);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header onMenuPress={openMenu} />

        {menuVisible && (
          <>
            <TouchableWithoutFeedback onPress={closeMenu}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            <Animated.View style={[styles.menu, { left: drawerAnim }]}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuItem}
                  onPress={() => {
                    setCategory(item.key);
                    closeMenu();
                  }}
                >
                  <Feather
                    name={item.icon}
                    size={22}
                    color="#000"
                    style={styles.menuIcon}
                  />
                  <ThemedText style={styles.menuItemText}>
                    {t(`home.categories.${item.key}`)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </>
        )}

        <ThemedText type="title" style={styles.categoryTitle}>
          {categoryTitle}
        </ThemedText>

        {category === 'wishlist' && displayedMovies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {t('home.emptyWishlist')}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={Array.isArray(displayedMovies) ? displayedMovies : []}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => openMovie(item)}
                activeOpacity={0.85}
                style={styles.cardWrapper}
              >
                <MovieCard movie={item} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
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

          if (selectedMovieIsWatched) {
            removeMovie(selectedMovie.id);
          } else {
            addMovie(selectedMovie);
          }
        }}
        onRate={handleSetRating}
        isInWishlist={selectedMovie ? isInWishlist(selectedMovie.id) : false}
        isWatched={selectedMovieIsWatched}
        userRating={selectedMovieUserRating}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  categoryTitle: {
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.6,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  menu: {
    paddingVertical: 60,
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 8,
    elevation: 6,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 18,
    color: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 5,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.one,
    alignItems: 'center',
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
  },
});