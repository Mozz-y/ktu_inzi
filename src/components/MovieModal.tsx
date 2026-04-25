import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Linking, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { fetchMovieTrailer, getGenreNames } from '../api/tmdb';

interface MovieModalProps {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
  onWishlistToggle: () => void;
  onMarkWatched: () => void;
  onRate: (rating: number) => void;
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
  userRating,
}: MovieModalProps) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const descriptionPreview = movie?.description?.slice(0, 220) ?? '';
  const hasLongDescription = Boolean(movie?.description && movie.description.length > 220);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [movie?.id, visible]);

  const handleWatchTrailer = async () => {
    if (!movie) return;
    const key = await fetchMovieTrailer(movie.id);

    if (key) {
      Linking.openURL(`https://www.youtube.com/watch?v=${key}`);
    } else {
      Alert.alert('Not found', "Sorry, we couldn't find a trailer for this movie.");
    }
  };

  if (!movie || !visible) return null;

  return (
    <Animated.View style={[styles.animatedModalBackground, { opacity: fadeAnim }]}>
      <View style={[styles.modalBackground, { backgroundColor: theme.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.modalBackground,
              shadowColor: theme.text,
            },
          ]}>
          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: movie.posterUrl }} style={styles.modalPoster} resizeMode="cover" />

            <View style={styles.headerSection}>
              <ThemedText style={[styles.cardTitle, { color: theme.title }]} numberOfLines={2}>
                {movie.title}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitleText} numberOfLines={2}>
                {movie.year} | {getGenreNames(movie.genre).join(', ')}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitleText}>
                {'\u2B50'} {movie.rating.toFixed(1)} IMDB
              </ThemedText>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={[styles.trailerButton, { backgroundColor: theme.primary }]} onPress={handleWatchTrailer}>
                <Ionicons name="play" size={20} color={theme.primaryText} />
                <ThemedText style={[styles.trailerButtonText, { color: theme.primaryText }]}>Watch Trailer</ThemedText>
              </TouchableOpacity>

              <View
                style={[
                  styles.secondaryActionsRow,
                  {
                    borderTopColor: theme.border,
                    borderBottomColor: theme.border,
                  },
                ]}>
                <TouchableOpacity style={styles.iconAction} onPress={onWishlistToggle}>
                  <Ionicons
                    name={isInWishlist ? 'heart' : 'heart-outline'}
                    size={28}
                    color={isInWishlist ? '#E50914' : theme.textSecondary}
                  />
                  <ThemedText themeColor="textSecondary" style={styles.iconActionText}>
                    Wishlist
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconAction} onPress={onMarkWatched}>
                  <Ionicons
                    name={isWatched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={28}
                    color={isWatched ? theme.success : theme.textSecondary}
                  />
                  <ThemedText themeColor="textSecondary" style={styles.iconActionText}>
                    Watched
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {isWatched && (
              <View style={[styles.ratingRow, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={[styles.ratingLabel, { color: theme.title }]}>Your Rating:</ThemedText>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => onRate(star)} style={styles.starButton}>
                      <Ionicons
                        name={(userRating || 0) >= star ? 'star' : 'star-outline'}
                        size={30}
                        color={theme.warning}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => hasLongDescription && setDescriptionExpanded(prev => !prev)}
              style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.title }]}>Description</ThemedText>
              <ThemedText style={[styles.descriptionText, { color: theme.text }] } numberOfLines={descriptionExpanded ? undefined : 4}>
                {hasLongDescription && !descriptionExpanded ? `${descriptionPreview}...` : movie.description}
              </ThemedText>
              {hasLongDescription && (
                <ThemedText style={[styles.expandText, { color: theme.primary }]}>
                  {descriptionExpanded ? 'Show less' : 'Read more'}
                </ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    marginBottom: 20,
  },
  animatedModalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 25,
    flexShrink: 1,
  },
  descriptionText: {
    lineHeight: 20,
  },
  expandText: {
    marginTop: 8,
    fontWeight: '600',
  },
  headerSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  iconAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconActionText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
  modalContent: {
    width: '90%',
    height: '85%',
    borderRadius: 15,
    padding: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalPoster: {
    width: '100%',
    height: 240,
    borderRadius: 15,
  },
  ratingLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingRow: {
    marginBottom: 20,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  scrollArea: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 10,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 5,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  subtitleText: {
    marginTop: 6,
    flexWrap: 'wrap',
  },
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  trailerButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
