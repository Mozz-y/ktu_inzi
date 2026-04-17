import { ThemedText } from '@/components/themed-text';
import type { Movie } from '@/types/movie';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const numColumns = 2;
const cardWidth = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

interface MovieCardProps {
  movie: Movie;
  userRating?: number;
}

export function MovieCard({ movie, userRating }: MovieCardProps) {
  const { t } = useTranslation();

  const safeRating =
    typeof userRating === 'number'
      ? userRating
      : typeof movie?.rating === 'number'
        ? movie.rating
        : 0;

  const ratingLabel =
    typeof userRating === 'number'
      ? t('movie.yourRatingInline', { rating: safeRating.toFixed(1) })
      : `⭐ ${safeRating.toFixed(1)}`;

  const posterSource =
    typeof movie?.posterUrl === 'string' && movie.posterUrl.trim().length > 0
      ? { uri: movie.posterUrl }
      : undefined;

  return (
    <View style={styles.card}>
      {posterSource ? (
        <Image source={posterSource} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.posterFallback]}>
          <ThemedText style={styles.posterFallbackText}>No image</ThemedText>
        </View>
      )}

      <View style={styles.rating}>
        <ThemedText>{ratingLabel}</ThemedText>
      </View>

      <ThemedText numberOfLines={2} style={styles.title}>
        {movie?.title ?? ''}
      </ThemedText>

      <ThemedText style={styles.year}>{movie?.year ?? ''}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    marginBottom: 10,
    padding: 5,
  },
  poster: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 5,
    backgroundColor: '#e5e5e5',
  },
  posterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterFallbackText: {
    color: '#777',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    minHeight: 40,
  },
  year: {
    color: '#666',
  },
});