import { ThemedText } from '@/components/themed-text';
import type { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { getGenreNames } from '../api/tmdb';

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
    userRating
}: MovieModalProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim]);

    if (!movie || !visible) return null;

    return (
        <Animated.View style={[styles.animatedModalBackground, { opacity: fadeAnim, flex: 1 }]}>
            <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={onClose}>
                <Animated.View style={styles.modalContent}>
                    <ScrollView>
                        <Image source={{ uri: movie.posterUrl }} style={styles.modalPoster} />

                        <ThemedText style={styles.cardTitle}>
                            {movie.title}
                        </ThemedText>

                        <ThemedText style={{ marginTop: 5 }}>
                            {movie.year} | {getGenreNames(movie.genre).join(', ')} | ⭐ {movie.rating.toFixed(1)}
                        </ThemedText>

                        <ThemedText style={{ marginTop: 10 }}>
                            {movie.description}
                        </ThemedText>
                    </ScrollView>
                    {/* Wishlist button */}
                    <TouchableOpacity style={styles.wishlistButton} onPress={onWishlistToggle}>
                        <Ionicons
                            name={isInWishlist ? 'heart' : 'heart-outline'}
                            size={24}
                            color="white"
                        />
                        <ThemedText style={styles.wishlistText}>
                            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </ThemedText>
                    </TouchableOpacity>
                    {/* "Mark as Watched" button */}
                    <TouchableOpacity
                        style={[styles.wishlistButton, { backgroundColor: isWatched ? '#dc3545' : '#28a745', marginTop: 10 }]}
                        onPress={onMarkWatched}
                    >
                        <Ionicons name={isWatched ? "close-circle-outline" : "checkmark-circle-outline"} size={24} color="white" />
                        <ThemedText style={styles.wishlistText}>
                            {isWatched ? 'Remove from Watched' : 'Mark as Watched'}
                        </ThemedText>
                    </TouchableOpacity>
                    {/* Rating option is visible only when seen */}
                    {isWatched && (
                        <View style={{ marginVertical: 15, alignItems: 'center' }}>
                            <ThemedText style={{ fontWeight: 'bold', marginBottom: 5 }}>Your Rating:</ThemedText>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => onRate(star)}>
                                        <Ionicons
                                            name={(userRating || 0) >= star ? 'star' : 'star-outline'}
                                            size={30}
                                            color="#eab308"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    animatedModalBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    cardTitle: {
        marginVertical: 15,
        fontSize: 25,
        color: 'black',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
    },
    modalContent: {
        flex: 1,
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        justifyContent: 'space-between',
        borderRadius: 15,
        padding: 20,
    },
    modalPoster: {
        width: '100%',
        height: 300,
        borderRadius: 15,
    },
    wishlistButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e50914',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 10,
        gap: 8,
    },
    wishlistText: {
        color: 'white',
        fontWeight: 'bold',
    },
});