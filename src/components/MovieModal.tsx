import { ThemedText } from '@/components/themed-text';
import type { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const descriptionPreview = movie?.description?.slice(0, 220) ?? '';
    const hasLongDescription = Boolean(movie?.description && movie.description.length > 220);

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

    useEffect(() => {
        setDescriptionExpanded(false);
    }, [movie?.id, visible]);

    if (!movie || !visible) return null;

    return (
        <Animated.View style={[styles.animatedModalBackground, { opacity: fadeAnim }]}> 
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalBackground}>
                    <TouchableWithoutFeedback>
                        <Animated.View style={styles.modalContent}>
                            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
                                <Image source={{ uri: movie.posterUrl }} style={styles.modalPoster} resizeMode="cover" />

                                <View style={styles.headerSection}>
                                    <ThemedText style={styles.cardTitle} numberOfLines={2}>{movie.title}</ThemedText>
                                    <ThemedText style={styles.subtitleText} numberOfLines={2}>
                                        {movie.year} | {getGenreNames(movie.genre).join(', ')}
                                    </ThemedText>
                                    <ThemedText style={styles.subtitleText}>
                                        ⭐ {movie.rating.toFixed(1)} IMDB
                                    </ThemedText>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => hasLongDescription && setDescriptionExpanded(prev => !prev)}
                                    style={styles.section}
                                >
                                    <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                                    <ThemedText style={styles.descriptionText} numberOfLines={descriptionExpanded ? undefined : 4}>
                                        {hasLongDescription && !descriptionExpanded ? `${descriptionPreview}...` : movie.description}
                                    </ThemedText>
                                    {hasLongDescription && (
                                        <ThemedText style={styles.expandText}>
                                            {descriptionExpanded ? 'Show less' : 'Read more'}
                                        </ThemedText>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>

                            <View style={styles.buttonSection}>
                                <TouchableOpacity style={styles.wishlistButton} onPress={onWishlistToggle}>
                                    <Ionicons name={isInWishlist ? 'heart' : 'heart-outline'} size={24} color="white" />
                                    <ThemedText style={styles.wishlistText}>
                                        {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                    </ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.wishlistButton, styles.watchedButton]}
                                    onPress={onMarkWatched}
                                >
                                    <Ionicons name={isWatched ? 'close-circle-outline' : 'checkmark-circle-outline'} size={24} color="white" />
                                    <ThemedText style={styles.wishlistText}>
                                        {isWatched ? 'Remove from Watched' : 'Mark as Watched'}
                                    </ThemedText>
                                </TouchableOpacity>

                                {isWatched && (
                                    <View style={styles.ratingRow}>
                                        <ThemedText style={styles.ratingLabel}>Your Rating:</ThemedText>
                                        <View style={styles.starsRow}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <TouchableOpacity key={star} onPress={() => onRate(star)} style={styles.starButton}>
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
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
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
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
    },
    modalContent: {
        width: '90%',
        height: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        overflow: 'hidden',
    },
    scrollArea: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        paddingBottom: 20,
        flexGrow: 1,
    },
    modalPoster: {
        width: '100%',
        height: 240,
        borderRadius: 15,
    },
    headerSection: {
        marginTop: 16,
        marginBottom: 16,
    },
    cardTitle: {
        marginTop: 0,
        marginBottom: 8,
        fontSize: 25,
        color: 'black',
        flexShrink: 1,
    },
    subtitleText: {
        color: '#555',
        marginTop: 6,
        flexWrap: 'wrap',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    descriptionText: {
        lineHeight: 20,
        color: '#333',
    },
    expandText: {
        marginTop: 8,
        color: '#2563eb',
        fontWeight: '600',
    },
    buttonSection: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    wishlistButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e50914',
        paddingVertical: 12,
        borderRadius: 10,
    },
    watchedButton: {
        backgroundColor: '#28a745',
        marginTop: 10,
    },
    ratingRow: {
        marginTop: 10,
        alignItems: 'center',
    },
    ratingLabel: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    starButton: {
        padding: 4,
        marginHorizontal: 5,
    },
    wishlistText: {
        color: 'white',
        fontWeight: 'bold',
    },
});