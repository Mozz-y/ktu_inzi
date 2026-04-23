import { ThemedText } from '@/components/themed-text';
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

    const handleWatchTrailer = async () => {
        if (!movie) return;
        const key = await fetchMovieTrailer(movie.id);

        if (key) {
            Linking.openURL(`https://www.youtube.com/watch?v=${key}`);
        } else {
            Alert.alert("Not found", "Sorry, we couldn't find a trailer for this movie.");
        }
    };

    if (!movie || !visible) return null;

    return (
        <Animated.View style={[styles.animatedModalBackground, { opacity: fadeAnim }]}> 
            <View style={styles.modalBackground}>
                
                {/* 1. NEMATOMAS FONAS - jį paspaudus modalas užsidaro. 
                    Jis užima visą ekraną, bet guli PO modalo turiniu. */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                {/* 2. MODALO TURINYS - visiškai atskirtas, niekas netrukdo slinkti */}
                <Animated.View style={styles.modalContent}>
                    <ScrollView 
                        style={styles.scrollArea} 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
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

                        {/* VEIKSMŲ SEKCIJA (Mygtukai) */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.trailerButton} onPress={handleWatchTrailer}>
                                <Ionicons name="play" size={20} color="white" />
                                <ThemedText style={styles.trailerButtonText}>Watch Trailer</ThemedText>
                            </TouchableOpacity>

                            <View style={styles.secondaryActionsRow}>
                                <TouchableOpacity style={styles.iconAction} onPress={onWishlistToggle}>
                                    <Ionicons name={isInWishlist ? 'heart' : 'heart-outline'} size={28} color={isInWishlist ? '#e50914' : '#333'} />
                                    <ThemedText style={styles.iconActionText}>Wishlist</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.iconAction} onPress={onMarkWatched}>
                                    <Ionicons name={isWatched ? 'checkmark-circle' : 'checkmark-circle-outline'} size={28} color={isWatched ? '#28a745' : '#333'} />
                                    <ThemedText style={styles.iconActionText}>Watched</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ŽVAIGŽDUTĖS */}
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

                        {/* APRAŠYMAS */}
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
                </Animated.View>

            </View>
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
        elevation: 5, // Pridėtas lengvas šešėlis Android
        shadowColor: '#000', // Šešėlis iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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
    actionsContainer: {
        marginBottom: 20,
    },
    trailerButton: {
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    trailerButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    secondaryActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        paddingVertical: 12,
        marginBottom: 10,
    },
    iconAction: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    iconActionText: {
        fontSize: 12,
        color: '#555',
        marginTop: 4,
        fontWeight: '500',
    },
    ratingRow: {
        marginBottom: 20,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
    },
    ratingLabel: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    starButton: {
        padding: 4,
        marginHorizontal: 5,
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
});