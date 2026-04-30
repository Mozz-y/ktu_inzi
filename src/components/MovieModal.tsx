import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  actorsByMovie,
  fetchActorDetails,
  fetchMovieTrailer,
  getGenreNames,
} from '../api/tmdb';

import { Actor, ActorCard } from './ActorCard';
import { ActorModal } from './ActorModal';

interface MovieModalProps {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
  onWishlistToggle: () => void | Promise<void>;
  onMarkWatched: () => void | Promise<void>;
  onRate: (rating: number) => void | Promise<void>;
  isInWishlist: boolean;
  isWatched: boolean;
  userRating?: number;
}

export function MovieModal({
  movie,
  visible,
  onClose,
  onWishlistToggle,
  onMarkWatched,
  onRate,
  isInWishlist,
  isWatched,
  userRating = 0,
}: MovieModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [actors, setActors] = useState<Actor[]>([]);
  const [actorDetails, setActorDetails] = useState<any>(null);
  const [actorModalVisible, setActorModalVisible] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  const genreNames = getGenreNames(movie?.genre ?? []);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!movie) return;

      try {
        const loadedActors = await actorsByMovie(movie.id);
        setActors(Array.isArray(loadedActors) ? loadedActors : []);
      } catch {
        setActors([]);
      }

      try {
        const trailer = await fetchMovieTrailer(movie.id);
        setTrailerUrl(trailer);
      } catch {
        setTrailerUrl(null);
      }
    };

    loadMovieDetails();
  }, [movie]);

  const handleActorPress = async (actor: Actor) => {
    setActorModalVisible(true);

    try {
      const details = await fetchActorDetails(actor.id);
      setActorDetails(details ?? actor);
    } catch {
      setActorDetails(actor);
    }
  };

  if (!movie) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <Animated.View
          style={[
            styles.overlay,
            { backgroundColor: theme.overlay, opacity: fadeAnim },
          ]}
        >
          <View
            style={[
              styles.modal,
              {
                backgroundColor: theme.modalBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: movie.posterUrl }}
                style={styles.poster}
                resizeMode="cover"
              />

              <ThemedText style={[styles.title, { color: theme.title }]}>
                {movie.title}
              </ThemedText>

              <ThemedText style={{ color: theme.textSecondary }}>
                {movie.year} • ⭐ {Number(movie.rating ?? 0).toFixed(1)}
                {genreNames.length > 0 ? ` • ${genreNames.join(', ')}` : ''}
              </ThemedText>

              <ThemedText style={[styles.description, { color: theme.text }]}>
                {movie.description || t('movie.description')}
              </ThemedText>

              {trailerUrl && (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                  onPress={() => Linking.openURL(trailerUrl)}
                >
                  <ThemedText style={{ color: theme.primaryText }}>
                    ▶ {t('movie.watchTrailer')}
                  </ThemedText>
                </TouchableOpacity>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isInWishlist
                        ? theme.primary
                        : theme.inputBackground,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  onPress={onWishlistToggle}
                >
                  <ThemedText
                    style={{
                      color: isInWishlist ? theme.primaryText : theme.text,
                      fontWeight: '700',
                    }}
                  >
                    {isInWishlist
                      ? t('movie.removeFromWishlist')
                      : t('movie.addToWishlist')}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isWatched
                        ? theme.primary
                        : theme.inputBackground,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  onPress={onMarkWatched}
                >
                  <ThemedText
                    style={{
                      color: isWatched ? theme.primaryText : theme.text,
                      fontWeight: '700',
                    }}
                  >
                    {isWatched
                      ? t('movie.removeFromWatched')
                      : t('movie.markAsWatched')}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText style={[styles.sectionTitle, { color: theme.title }]}>
                {t('movie.yourRating')}
              </ThemedText>

              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity key={rating} onPress={() => onRate(rating)}>
                    <ThemedText style={styles.star}>
                      {Number(userRating) >= rating ? '★' : '☆'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {actors.length > 0 && (
                <>
                  <ThemedText style={[styles.sectionTitle, { color: theme.title }]}>
                    {t('movie.actors')}
                  </ThemedText>

                  <FlatList
                    horizontal
                    data={actors}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                      <ActorCard actor={item} onPress={handleActorPress} />
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                </>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>

      <ActorModal
        visible={actorModalVisible}
        actor={actorDetails}
        onClose={() => setActorModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 24 : 10,
  },
  modal: {
    width: Platform.OS === 'web' ? 420 : '100%',
    maxHeight: '92%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 3,
  },
  poster: {
    width: '100%',
    height: Platform.OS === 'web' ? 360 : 300,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    paddingHorizontal: 12,
  },
  description: {
    marginTop: 10,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 14,
    marginHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
  },
  star: {
    fontSize: 24,
    color: '#f59e0b',
  },
});