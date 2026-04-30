import { ThemedText } from '@/components/themed-text';
import type { Movie } from '@/types/movie';
import { Image, Platform, StyleSheet, View } from 'react-native';

interface MovieCardProps {
  movie: Movie;
  userRating?: number;
}

export function MovieCard({ movie, userRating }: MovieCardProps) {
  const displayRating = Number(userRating ?? movie.rating ?? 0);
  const ratingLabel =
    userRating && userRating > 0
      ? `Your rating: ⭐ ${displayRating.toFixed(1)}`
      : `⭐ ${displayRating.toFixed(1)}`;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: movie.posterUrl }}
        style={styles.poster}
        resizeMode="cover"
      />

      <View style={styles.rating}>
        <ThemedText>{ratingLabel}</ThemedText>
      </View>

      <ThemedText numberOfLines={2} style={styles.title}>
        {movie.title}
      </ThemedText>

      <ThemedText>{movie.year}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 10,
    padding: 5,
  },
  poster: {
    width: '100%',
    height: Platform.OS === 'web' ? 320 : 220,
    borderRadius: 15,
    marginBottom: 5,
    backgroundColor: '#ddd',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  title: {
    fontWeight: '600',
  },
});