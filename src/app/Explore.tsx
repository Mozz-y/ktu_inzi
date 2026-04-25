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
import { FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGenres, fetchMoviesByCategory, searchMovies } from '../api/tmdb';

export default function ExploreScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedSorting, setSelectedSorting] = useState('Rating');
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [genreIdMap, setGenreIdMap] = useState<{ [key: string]: number }>({});
  const genres = ['All Genres', 'Action', 'Drama', 'Comedy', 'Sci-Fi'];
  const sorting = ['Rating', 'Year', 'Title'];
  const { add, remove, isInWishlist } = useWishlist();
  const { movies: watchedMovies, addMovie, rateMovie, removeMovie } = useWatched();

  useEffect(() => {
    const loadGenres = async () => {
      const loadedGenres = await fetchGenres();
      setGenreIdMap(loadedGenres);
    };

    loadGenres();
  }, []);

  useEffect(() => {
    const loadInitialOrSearch = async () => {
      if (search.length > 2) {
        const results = await searchMovies(search);
        setMovies(results);
      } else {
        const trending = await fetchMoviesByCategory('Trending');
        setMovies(trending);
      }
    };

    const delayDebounceFn = setTimeout(loadInitialOrSearch, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const filteredMovies = useMemo(() => {
    const result = [...movies];

    if (selectedGenre !== 'All Genres' && genreIdMap[selectedGenre]) {
      const genreId = genreIdMap[selectedGenre];
      return result
        .filter(movie => Array.isArray(movie.genre) && movie.genre.includes(genreId as never))
        .sort(sortMovies(selectedSorting));
    }

    return result.sort(sortMovies(selectedSorting));
  }, [genreIdMap, movies, selectedGenre, selectedSorting]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <ThemedText type="title" style={[styles.title, { color: theme.title }]}>
          Search for Movies
        </ThemedText>

        <TextInput
          placeholder="Search..."
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
        />

        <View style={styles.filterRow}>
          <View style={[styles.pickerWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowGenreModal(true)}>
              <ThemedText>{selectedGenre}</ThemedText>
              <Feather name="chevron-down" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.pickerWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowSortModal(true)}>
              <ThemedText>{selectedSorting}</ThemedText>
              <Feather name="chevron-down" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {showGenreModal && (
          <Modal transparent animationType="fade">
            <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: theme.overlay }]} onPress={() => setShowGenreModal(false)}>
              <View style={[styles.modalBox, { backgroundColor: theme.modalBackground, borderColor: theme.border }]}>
                {genres.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={styles.option}
                    onPress={() => {
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

        {showSortModal && (
          <Modal transparent animationType="fade">
            <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: theme.overlay }]} onPress={() => setShowSortModal(false)}>
              <View style={[styles.modalBox, { backgroundColor: theme.modalBackground, borderColor: theme.border }]}>
                {sorting.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.option}
                    onPress={() => {
                      setSelectedSorting(option);
                      setShowSortModal(false);
                    }}>
                    <ThemedText>{option}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        <FlatList
          data={filteredMovies}
          numColumns={2}
          columnWrapperStyle={styles.listRow}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedMovie(item)}>
              <MovieCard movie={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Feather name="search" size={50} color={theme.textSecondary} />
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
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

            if (isInWishlist(selectedMovie.id)) {
              remove(selectedMovie.id);
            } else {
              add(selectedMovie);
            }
          }}
          onMarkWatched={() => {
            if (!selectedMovie) return;

            const isWatched = watchedMovies.some(m => String(m.id) === String(selectedMovie.id));
            if (isWatched) {
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
          isWatched={!!watchedMovies.find(m => String(m.id) === String(selectedMovie?.id))}
          userRating={watchedMovies.find(m => String(m.id) === String(selectedMovie?.id))?.userRating}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

function sortMovies(sortKey: string) {
  return (a: Movie, b: Movie) => {
    if (sortKey === 'Rating') return b.rating - a.rating;
    if (sortKey === 'Year') return parseInt(b.year) - parseInt(a.year);
    return a.title.localeCompare(b.title);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: -30,
  },
  dropdown: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  listRow: {
    justifyContent: 'space-between',
  },
  modalBox: {
    width: '80%',
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
  option: {
    paddingVertical: 12,
  },
  pickerWrapper: {
    width: '48%',
    borderRadius: 10,
    paddingLeft: 10,
    borderWidth: 1,
  },
  screen: {
    flex: 1,
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
  },
  title: {
    marginTop: 15,
    marginBottom: 15,
  },
});
