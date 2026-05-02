import { ThemedText } from '@/components/themed-text';
import type { Movie } from '@/types/movie';
import { useTranslation } from 'react-i18next';
import { Image, Platform, StyleSheet, View } from 'react-native';

interface MovieCardProps {
  movie: Movie;
  userRating?: number;
}

export function MovieCard({ movie, userRating }: MovieCardProps) {
  const { t } = useTranslation();
  const displayRating = Number(userRating ?? movie.rating ?? 0);
  const ratingLabel =
    userRating && userRating > 0
      ? t('movie.yourRatingInline', { rating: displayRating.toFixed(1) })
      : `⭐ ${displayRating.toFixed(1)}`;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: movie.posterUrl }}
        style={styles.poster}
        resizeMode="cover"
      />

      <View style={styles.rating}>
        <ThemedText numberOfLines={2} style={styles.ratingText}>{ratingLabel}</ThemedText>
      </View>

      <ThemedText numberOfLines={2} style={styles.title}>
        {movie.title}
      </ThemedText>

      <ThemedText style={styles.year}>{movie.year}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 10,
    padding: Platform.OS === 'web' ? 0 : 5,
  },
  poster: {
    width: '100%',
    height: Platform.OS === 'web' ? undefined : 220,
    aspectRatio: Platform.OS === 'web' ? 2 / 3 : undefined,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: '#ddd',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: Platform.OS === 'web' ? 15 : 16,
  },
  title: {
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 16 : 18,
    lineHeight: Platform.OS === 'web' ? 20 : 24,
  },
  year: {
    fontSize: Platform.OS === 'web' ? 15 : 16,
    marginTop: 4,
  },
});
