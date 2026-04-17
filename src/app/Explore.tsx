import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWatched } from '@/hooks/useWatched';
import { useWishlist } from '@/hooks/useWishlist';
import type { Movie } from '@/types/movie';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGenres, fetchMoviesByCategory, searchMovies } from '../api/tmdb';

type GenreOption = {
  key: string;
  label: string;
  id: number | null;
};

type SortOption = {
  key: 'rating' | 'year' | 'title';
  label: string;
};

export default function ExploreScreen() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenreKey, setSelectedGenreKey] = useState('allGenres');
  const [selectedSortingKey, setSelectedSortingKey] =
    useState<SortOption['key']>('rating');
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { add, remove, isInWishlist } = useWishlist();
  const {
    movies: watchedMovies,
    addMovie,
    rateMovie,
    removeMovie,
    isWatched,
    getUserRating,
  } = useWatched();

  const safeWatchedMovies = Array.isArray(watchedMovies) ? watchedMovies : [];

  const genreOptions: GenreOption[] = useMemo(
    () => [
      { key: 'allGenres', label: t('explore.genres.allGenres'), id: null },
      { key: 'action', label: t('explore.genres.action'), id: 28 },
      { key: 'drama', label: t('explore.genres.drama'), id: 18 },
      { key: 'comedy', label: t('explore.genres.comedy'), id: 35 },
      { key: 'thriller', label: t('explore.genres.thriller'), id: 53 },
      {
        key: 'scienceFiction',
        label: t('explore.genres.scienceFiction'),
        id: 878,
      },
      { key: 'animation', label: t('explore.genres.animation'), id: 16 },
      { key: 'family', label: t('explore.genres.family'), id: 10751 },
    ],
    [t]
  );

  const sortOptions: SortOption[] = useMemo(
    () => [
      { key: 'rating', label: t('explore.sorting.rating') },
      { key: 'year', label: t('explore.sorting.year') },
      { key: 'title', label: t('explore.sorting.title') },
    ],
    [t]
  );

  const selectedGenre =
    genreOptions.find((option) => option.key === selectedGenreKey) ??
    genreOptions[0];

  const selectedSorting =
    sortOptions.find((option) => option.key === selectedSortingKey) ??
    sortOptions[0];

  useEffect(() => {
    const warmGenres = async () => {
      try {
        await fetchGenres();
      } catch (error) {
        console.error('fetchGenres warmup failed:', error);
      }
    };

    warmGenres();
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadMovies = async () => {
      setIsLoading(true);

      try {
        let results: Movie[] = [];

        if (search.trim().length > 2) {
          const searchResults = await searchMovies(search.trim());
          results = Array.isArray(searchResults) ? searchResults : [];
        } else {
          const trendingResults = await fetchMoviesByCategory('Trending');
          results = Array.isArray(trendingResults) ? trendingResults : [];
        }

        if (isActive) {
          setMovies(Array.isArray(results) ? results : []);
        }
      } catch (error) {
        console.error('Explore load failed:', error);

        if (isActive) {
          setMovies([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(loadMovies, 400);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [search]);

  const filteredMovies = useMemo(() => {
    const safeMovies = Array.isArray(movies) ? movies : [];
    let result: Movie[] = [...safeMovies];

    if (selectedGenre?.id !== null) {
      result = result.filter((movie) => {
        const movieGenres = Array.isArray(movie?.genre) ? movie.genre : [];
        return movieGenres.some(
          (genreId) => Number(genreId) === Number(selectedGenre.id)
        );
      });
    }

    result.sort((a, b) => {
      if (selectedSortingKey === 'rating') {
        return Number(b?.rating ?? 0) - Number(a?.rating ?? 0);
      }

      if (selectedSortingKey === 'year') {
        return Number(b?.year ?? 0) - Number(a?.year ?? 0);
      }

      return String(a?.title ?? '').localeCompare(String(b?.title ?? ''));
    });

    return result;
  }, [movies, selectedGenre, selectedSortingKey]);

  const selectedMovieIsWatched = selectedMovie
    ? isWatched(selectedMovie.id)
    : false;

  const selectedMovieUserRating = selectedMovie
    ? getUserRating(selectedMovie.id)
    : 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          {t('explore.title')}
        </ThemedText>

        <TextInput
          placeholder={t('explore.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.filterRow}>
          <View style={styles.pickerWrapper}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowGenreModal(true)}
              activeOpacity={0.8}
            >
              <ThemedText numberOfLines={1}>
                {selectedGenre?.label ?? ''}
              </ThemedText>
              <Feather name="chevron-down" size={18} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerWrapper}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowSortModal(true)}
              activeOpacity={0.8}
            >
              <ThemedText numberOfLines={1}>
                {selectedSorting?.label ?? ''}
              </ThemedText>
              <Feather name="chevron-down" size={18} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        {showGenreModal && (
          <Modal transparent animationType="fade" visible={showGenreModal}>
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowGenreModal(false)}
              activeOpacity={1}
            >
              <View style={styles.modalBox}>
                {(Array.isArray(genreOptions) ? genreOptions : []).map((genre) => (
                  <TouchableOpacity
                    key={genre.key}
                    style={styles.option}
                    onPress={() => {
                      setSelectedGenreKey(genre.key);
                      setShowGenreModal(false);
                    }}
                  >
                    <ThemedText>{genre.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {showSortModal && (
          <Modal transparent animationType="fade" visible={showSortModal}>
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowSortModal(false)}
              activeOpacity={1}
            >
              <View style={styles.modalBox}>
                {(Array.isArray(sortOptions) ? sortOptions : []).map((sort) => (
                  <TouchableOpacity
                    key={sort.key}
                    style={styles.option}
                    onPress={() => {
                      setSelectedSortingKey(sort.key);
                      setShowSortModal(false);
                    }}
                  >
                    <ThemedText>{sort.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={Array.isArray(filteredMovies) ? filteredMovies : []}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedMovie(item)}
                activeOpacity={0.85}
                style={styles.cardWrapper}
              >
                <MovieCard movie={item} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Feather name="search" size={50} color="#ccc" />
                <ThemedText style={styles.emptyText}>
                  {t('explore.emptyResults')}
                </ThemedText>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        <MovieModal
          movie={selectedMovie}
          visible={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onWishlistToggle={() => {
            if (!selectedMovie) return;

            if (isInWishlist(selectedMovie.id)) {
              remove(selectedMovie.id);
            } else {
              add(selectedMovie);
            }
          }}
          onMarkWatched={() => {
            if (!selectedMovie) return;

            if (selectedMovieIsWatched) {
              removeMovie(selectedMovie.id);
            } else {
              addMovie(selectedMovie);
            }
          }}
          onRate={(rating) => {
            if (!selectedMovie) return;
            rateMovie(selectedMovie.id, rating);
          }}
          isInWishlist={selectedMovie ? isInWishlist(selectedMovie.id) : false}
          isWatched={selectedMovieIsWatched}
          userRating={selectedMovieUserRating}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dropdown: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 12,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    paddingLeft: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  option: {
    paddingVertical: 12,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  title: {
    marginTop: 15,
    marginBottom: 15,
    color: 'black',
  },
});