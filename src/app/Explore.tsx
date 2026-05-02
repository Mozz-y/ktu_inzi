import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
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
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fetchGenres,
  fetchMoviesByCategory,
  searchMovies,
  searchMoviesByActor,
} from '../api/tmdb';

type GenreOption = {
  key: string;
  label: string;
  id: number | null;
};

type SortOption = {
  key: 'rating' | 'year' | 'title';
  label: string;
};

type SearchMode = 'movie' | 'actor';

export default function ExploreScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenreKey, setSelectedGenreKey] = useState('allGenres');
  const [selectedSortingKey, setSelectedSortingKey] =
    useState<SortOption['key']>('rating');
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('movie');

  const { add, remove, isInWishlist } = useWishlist();
  const {
    addMovie,
    rateMovie,
    removeMovie,
    isWatched,
    getUserRating,
  } = useWatched();

  const genreOptions: GenreOption[] = useMemo(
    () => [
      { key: 'allGenres', label: t('explore.genres.allGenres'), id: null },
      { key: 'action', label: t('explore.genres.action'), id: 28 },
      { key: 'drama', label: t('explore.genres.drama'), id: 18 },
      { key: 'comedy', label: t('explore.genres.comedy'), id: 35 },
      { key: 'thriller', label: t('explore.genres.thriller'), id: 53 },
      { key: 'scienceFiction', label: t('explore.genres.scienceFiction'), id: 878 },
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
    fetchGenres().catch((error) => console.error('fetchGenres warmup failed:', error));
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadMovies = async () => {
      setIsLoading(true);

      try {
        const query = search.trim();
        let results: Movie[] = [];

        if (query.length > 2) {
          const searchResults =
            searchMode === 'actor'
              ? await searchMoviesByActor(query)
              : await searchMovies(query);

          results = Array.isArray(searchResults) ? searchResults : [];

          if (searchMode === 'actor' && results.length === 0) {
            const fallbackResults = await fetchMoviesByCategory('Trending');
            results = Array.isArray(fallbackResults) ? fallbackResults : [];
          }
        } else {
          const trendingResults = await fetchMoviesByCategory('Trending');
          results = Array.isArray(trendingResults) ? trendingResults : [];
        }

        if (isActive) setMovies(results);
      } catch (error) {
        console.error('Explore load failed:', error);
        if (isActive) setMovies([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(loadMovies, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [search, searchMode]);

  const filteredMovies = useMemo(() => {
    let result: Movie[] = Array.isArray(movies) ? [...movies] : [];

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

  const selectedMovieIsInWishlist = selectedMovie
    ? isInWishlist(selectedMovie.id)
    : false;

  const handleWishlistToggle = async () => {
    if (!selectedMovie) return;

    if (selectedMovieIsInWishlist) {
      await remove(selectedMovie.id);
    } else {
      await add(selectedMovie);
    }
  };

  const handleWatchedToggle = async () => {
    if (!selectedMovie) return;

    if (selectedMovieIsWatched) {
      await removeMovie(selectedMovie.id);
    } else {
      await addMovie(selectedMovie);
    }
  };

  const handleRate = async (rating: number) => {
    if (!selectedMovie) return;
    await rateMovie(selectedMovie.id, rating);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <ThemedText
          type="title"
          style={[styles.title, { color: theme.title }]}
          numberOfLines={1}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {t('explore.title')}
        </ThemedText>

        <View style={styles.searchModeRow}>
          <TouchableOpacity
            onPress={() => setSearchMode('movie')}
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  searchMode === 'movie' ? theme.primary : theme.inputBackground,
                borderColor:
                  searchMode === 'movie' ? theme.primary : theme.inputBorder,
              },
            ]}
          >
            <ThemedText
              numberOfLines={1}
              style={[
                styles.modeButtonText,
                { color: searchMode === 'movie' ? theme.primaryText : theme.text },
              ]}
            >
              {t('explore.searchByMovie', { defaultValue: 'Search by movie' })}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSearchMode('actor')}
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  searchMode === 'actor' ? theme.primary : theme.inputBackground,
                borderColor:
                  searchMode === 'actor' ? theme.primary : theme.inputBorder,
              },
            ]}
          >
            <ThemedText
              numberOfLines={1}
              style={[
                styles.modeButtonText,
                { color: searchMode === 'actor' ? theme.primaryText : theme.text },
              ]}
            >
              {t('explore.searchByActor', { defaultValue: 'Search by actor' })}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder={
            searchMode === 'actor'
              ? t('explore.actorSearchPlaceholder', {
                  defaultValue: 'Search by actor...',
                })
              : t('explore.searchPlaceholder')
          }
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.filterRow}>
          <View
            style={[
              styles.pickerWrapper,
              { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowGenreModal(true)}
              activeOpacity={0.8}
            >
              <ThemedText numberOfLines={1}>{selectedGenre?.label ?? ''}</ThemedText>
              <Feather name="chevron-down" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.pickerWrapper,
              { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowSortModal(true)}
              activeOpacity={0.8}
            >
              <ThemedText numberOfLines={1}>{selectedSorting?.label ?? ''}</ThemedText>
              <Feather name="chevron-down" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {showGenreModal && (
          <Modal transparent animationType="fade" visible={showGenreModal}>
            <TouchableOpacity
              style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
              onPress={() => setShowGenreModal(false)}
              activeOpacity={1}
            >
              <View
                style={[
                  styles.modalBox,
                  { backgroundColor: theme.modalBackground, borderColor: theme.border },
                ]}
              >
                {genreOptions.map((genre) => (
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
              style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
              onPress={() => setShowSortModal(false)}
              activeOpacity={1}
            >
              <View
                style={[
                  styles.modalBox,
                  { backgroundColor: theme.modalBackground, borderColor: theme.border },
                ]}
              >
                {sortOptions.map((sort) => (
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
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredMovies}
            key={Platform.OS === 'web' ? 'web-grid' : 'native-grid'}
            numColumns={Platform.OS === 'web' ? 4 : 2}
            columnWrapperStyle={styles.columnWrapper}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedMovie(item)}
                activeOpacity={0.85}
                style={styles.cardWrapper}
              >
                <MovieCard
                  movie={item}
                  userRating={getUserRating(item.id)}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Feather name="search" size={50} color={theme.textSecondary} />
                <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
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
          onWishlistToggle={handleWishlistToggle}
          onMarkWatched={handleWatchedToggle}
          onRate={handleRate}
          isInWishlist={selectedMovieIsInWishlist}
          isWatched={selectedMovieIsWatched}
          userRating={selectedMovieUserRating}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: Platform.OS === 'web' ? '23.5%' : '48%',
    marginBottom: 18,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 18,
    paddingTop: Platform.OS === 'web' ? 55 : 12,
  },
  dropdown: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: Platform.OS === 'web' ? 15 : 13,
    height: Platform.OS === 'web' ? 55 : 50,
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
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 12,
  },
  listContent: {
    paddingBottom: Platform.OS === 'web' ? 24 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: Platform.OS === 'web' ? 420 : '80%',
    borderRadius: 16,
    padding: 15,
    paddingLeft: 30,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Platform.OS === 'web' ? 14 : 12,
    paddingVertical: Platform.OS === 'web' ? 8 : 9,
    flexShrink: 1,
    maxWidth: Platform.OS === 'web' ? undefined : '48%',
  },
  modeButtonText: {
    fontSize: Platform.OS === 'web' ? 14 : 15,
    fontWeight: '600',
  },
  option: {
    paddingVertical: 12,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'web' ? 10 : 9,
    marginBottom: 15,
    borderWidth: 1,
    fontSize: Platform.OS === 'web' ? 14 : 16,
  },
  searchModeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 10 : 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  title: {
    marginTop: Platform.OS === 'web' ? 15 : 8,
    marginBottom: Platform.OS === 'web' ? 15 : 14,
    fontSize: Platform.OS === 'web' ? 28 : 30,
    lineHeight: Platform.OS === 'web' ? 34 : 36,
    maxWidth: '100%',
  },
});
