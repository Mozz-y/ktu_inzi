import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import type { Movie } from "@/types/movie";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  actorsByMovie,
  fetchActorDetails,
  fetchMovieTrailer,
  getGenreNames,
} from "../api/tmdb";

import { Actor, ActorCard } from "./ActorCard";
import { ActorModal } from "./ActorModal";

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

const isWeb = Platform.OS === "web";

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
  const { height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [actors, setActors] = useState<Actor[]>([]);
  const [actorDetails, setActorDetails] = useState<any>(null);
  const [actorModalVisible, setActorModalVisible] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  const descriptionPreview = movie?.description?.slice(0, 220) ?? "";
  const hasLongDescription = Boolean(movie?.description && movie.description.length > 220);
  const genreNames = getGenreNames(movie?.genre ?? []);
  const genreText =
    genreNames.length > 0
      ? genreNames.join(", ")
      : Array.isArray(movie?.genre)
      ? movie.genre.filter(Boolean).join(", ")
      : "";
  const webModalMaxHeight = Math.min(height * 0.94, 920);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [movie?.id, visible]);

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!movie) return;

      try {
        const loadedActors = await actorsByMovie(movie.id, (movie as any).searchedActorId);
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
      <Modal
        visible={visible}
        transparent
        animationType={isWeb ? "fade" : "slide"}
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.animatedModalBackground,
              { opacity: fadeAnim },
            ]}
          >
            <View style={[styles.modalBackground, { backgroundColor: theme.overlay }]}> 
              <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

              <Animated.View
                style={[
                  styles.modalContent,
                  isWeb ? { maxHeight: webModalMaxHeight } : null,
                  {
                    backgroundColor: theme.modalBackground,
                    shadowColor: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              >
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>

                <ScrollView
                  style={styles.scrollArea}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Image
                    source={{ uri: movie.posterUrl }}
                    style={styles.modalPoster}
                    resizeMode="cover"
                  />

                  <View style={styles.headerSection}>
                    <ThemedText
                      style={[styles.cardTitle, { color: theme.title }]}
                      numberOfLines={2}
                    >
                      {movie.title}
                    </ThemedText>
                    <ThemedText
                      style={[styles.subtitleText, { color: theme.textSecondary }]}
                      numberOfLines={2}
                    >
                      {movie.year}{genreText ? ` | ${genreText}` : ""}
                    </ThemedText>
                    <ThemedText style={[styles.subtitleText, { color: theme.textSecondary }]}> 
                      ⭐ {Number(movie.rating ?? 0).toFixed(1)} IMDB
                    </ThemedText>
                  </View>

                  <View style={styles.actionsContainer}>
                    {trailerUrl && (
                      <TouchableOpacity
                        style={[styles.trailerButton, { backgroundColor: theme.primary }]}
                        onPress={() => Linking.openURL(trailerUrl)}
                      >
                        <Ionicons name="play" size={20} color={theme.primaryText} />
                        <ThemedText
                          style={[styles.trailerButtonText, { color: theme.primaryText }]}
                        >
                          {t("movie.watchTrailer")}
                        </ThemedText>
                      </TouchableOpacity>
                    )}

                    <View
                      style={[
                        styles.secondaryActionsRow,
                        {
                          borderTopColor: theme.border,
                          borderBottomColor: theme.border,
                        },
                      ]}
                    >
                      <TouchableOpacity style={styles.iconAction} onPress={onWishlistToggle}>
                        <Ionicons
                          name={isInWishlist ? "heart" : "heart-outline"}
                          size={32}
                          color={isInWishlist ? "#E50914" : theme.textSecondary}
                        />
                        <ThemedText
                          style={[styles.iconActionText, { color: theme.textSecondary }]}
                        >
                          {t("home.categories.wishlist")}
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.iconAction} onPress={onMarkWatched}>
                        <Ionicons
                          name={isWatched ? "checkmark-circle" : "checkmark-circle-outline"}
                          size={32}
                          color={isWatched ? theme.success : theme.textSecondary}
                        />
                        <ThemedText
                          style={[styles.iconActionText, { color: theme.textSecondary }]}
                        >
                          {t("profile.tabs.alreadySeen")}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {isWatched && (
                    <View style={[styles.ratingCard, { backgroundColor: theme.backgroundElement }]}> 
                      <ThemedText style={[styles.ratingLabel, { color: theme.title }]}> 
                        {t("movie.yourRating")}
                      </ThemedText>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => onRate(star)}
                            style={styles.starButton}
                          >
                            <Ionicons
                              name={Number(userRating) >= star ? "star" : "star-outline"}
                              size={34}
                              color={theme.warning}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => hasLongDescription && setDescriptionExpanded((prev) => !prev)}
                    style={styles.section}
                  >
                    <ThemedText style={[styles.sectionTitle, { color: theme.title }]}> 
                      {t("movie.description")}
                    </ThemedText>
                    <ThemedText
                      style={[styles.descriptionText, { color: theme.text }]}
                      numberOfLines={descriptionExpanded ? undefined : 4}
                    >
                      {movie.description
                        ? hasLongDescription && !descriptionExpanded
                          ? `${descriptionPreview}...`
                          : movie.description
                        : t("movie.description")}
                    </ThemedText>
                    {hasLongDescription && (
                      <ThemedText style={[styles.expandText, { color: theme.primary }]}> 
                        {descriptionExpanded ? t("movie.showLess") : t("movie.readMore")}
                      </ThemedText>
                    )}
                  </TouchableOpacity>

                  {actors.length > 0 && (
                    <>
                      <ThemedText style={[styles.sectionTitle, { color: theme.title }]}> 
                        {t("movie.actors")}
                      </ThemedText>

                      {isWeb ? (
                        <View style={styles.actorGrid}>
                          {actors.map((actor) => (
                            <TouchableOpacity
                              key={String(actor.id)}
                              onPress={() => handleActorPress(actor)}
                              style={styles.actorCard}
                            >
                              <Image
                                source={{ uri: actor.imageUrl }}
                                style={styles.actorImage}
                                resizeMode="cover"
                              />
                              <ThemedText
                                style={[styles.actorName, { color: theme.text }]}
                                numberOfLines={2}
                              >
                                {actor.name} {actor.surname}
                              </ThemedText>
                              {actor.character ? (
                                <ThemedText
                                  style={[styles.actorCharacter, { color: theme.textSecondary }]}
                                  numberOfLines={1}
                                >
                                  as {actor.character}
                                </ThemedText>
                              ) : null}
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <FlatList
                          horizontal
                          data={actors}
                          keyExtractor={(item) => String(item.id)}
                          renderItem={({ item }) => (
                            <ActorCard actor={item} onPress={handleActorPress} />
                          )}
                          showsHorizontalScrollIndicator={false}
                        />
                      )}
                    </>
                  )}
                </ScrollView>
              </Animated.View>
            </View>
          </Animated.View>
        </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  animatedModalBackground: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0,
  },
  modalContent: {
    width: isWeb ? 760 : "90%",
    height: isWeb ? undefined : "85%",
    borderRadius: 15,
    padding: 20,
    overflow: "hidden",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: isWeb ? 1 : 0,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111827",
    padding: 3,
  },
  scrollArea: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  modalPoster: {
    width: "100%",
    height: isWeb ? 260 : 240,
    borderRadius: 15,
    backgroundColor: "#000000",
  },
  headerSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: isWeb ? 26 : 25,
    fontWeight: "800",
    flexShrink: 1,
  },
  subtitleText: {
    marginTop: 6,
    flexWrap: "wrap",
    fontSize: isWeb ? 15 : 16,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  trailerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  trailerButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 10,
  },
  iconAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconActionText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  ratingCard: {
    marginBottom: 20,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  ratingLabel: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
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
    fontWeight: "bold",
    marginBottom: 8,
  },
  descriptionText: {
    lineHeight: 20,
    fontSize: 15,
  },
  expandText: {
    marginTop: 8,
    fontWeight: "600",
  },
  actorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 12,
  },
  actorCard: {
    width: 112,
    alignItems: "center",
    marginBottom: 4,
  },
  actorImage: {
    width: 112,
    height: 132,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  actorName: {
    marginTop: 5,
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600",
  },
  actorCharacter: {
    marginTop: 2,
    fontSize: 9,
    textAlign: "center",
    fontStyle: "italic",
  },
});
