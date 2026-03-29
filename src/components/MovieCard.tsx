import { ThemedText } from '@/components/themed-text';
import type { Movie } from '@/types/movie';
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
    const displayRating = userRating ?? movie.rating;
    const ratingLabel = userRating ? `Your rating: ⭐ ${displayRating}` : `⭐ ${displayRating}`;

    return (
        <View style={styles.card}>
            <Image source={{ uri: movie.posterUrl }} style={styles.poster} />

            <View style={styles.rating}>
                <ThemedText>{ratingLabel}</ThemedText>
            </View>

            <ThemedText>{movie.title}</ThemedText>
            <ThemedText>{movie.year}</ThemedText>
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
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
});