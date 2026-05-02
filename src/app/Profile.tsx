import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { useWatched } from "@/hooks/useWatched";
import { useWishlist } from "@/hooks/useWishlist";
import { useThemePreference } from "@/providers/theme-preference-provider";
import type { Movie } from "@/types/movie";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MovieModal } from "../components/MovieModal";

type ProfileTab = "alreadySeen" | "friends" | "settings";

const PROFILE_PHOTO_STORAGE_KEY = "bingelog.profile.photoUri";

const getStoredProfilePhoto = async () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const webPhotoUri = window.localStorage.getItem(PROFILE_PHOTO_STORAGE_KEY);
    if (webPhotoUri) return webPhotoUri;
  }

  return AsyncStorage.getItem(PROFILE_PHOTO_STORAGE_KEY);
};

const storeProfilePhoto = async (photoUri: string) => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, photoUri);
  }

  await AsyncStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, photoUri);
};

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { isDarkMode, setThemePreference } = useThemePreference();

  const {
    movies: watchedMovies,
    refreshMovies,
    removeMovie,
    rateMovie,
    addMovie,
  } = useWatched();

  const { wishlist, refreshWishlist, add, remove, isInWishlist } =
    useWishlist();

  const [name, setName] = useState(t("profile.defaultName"));
  const [bio, setBio] = useState(t("profile.defaultBio"));
  const [activeTab, setActiveTab] = useState<ProfileTab>("settings");
  const [selectedMovie, setSelectedMovie] = useState<
    (Movie & { userRating?: number; watchedAt?: string }) | null
  >(null);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("");
  const [friends, setFriends] = useState<string[]>([
    "Alice",
    "Bob",
    "Charlie",
    "Jeffrey",
    "David",
  ]);

  const profileLanguage = String(i18n.language ?? "en").split("-")[0];

  const friendPlaceholderDefault =
    profileLanguage === "lt"
      ? "Draugo vardas"
      : profileLanguage === "ru"
        ? "Имя друга"
        : profileLanguage === "de"
          ? "Name des Freundes"
          : profileLanguage === "fr"
            ? "Nom de l’ami"
            : "Friend name";

  const friendAddButtonDefault =
    profileLanguage === "lt"
      ? "Pridėti"
      : profileLanguage === "ru"
        ? "Добавить"
        : profileLanguage === "de"
          ? "Hinzufügen"
          : profileLanguage === "fr"
            ? "Ajouter"
            : "Add";

  const emptyFriendsDefault =
    profileLanguage === "lt"
      ? "Draugų dar nepridėta."
      : profileLanguage === "ru"
        ? "Друзья пока не добавлены."
        : profileLanguage === "de"
          ? "Noch keine Freunde hinzugefügt."
          : profileLanguage === "fr"
            ? "Aucun ami ajouté."
            : "No friends added yet.";

  useEffect(() => {
    const loadProfilePhoto = async () => {
      try {
        const savedPhotoUri = await getStoredProfilePhoto();
        if (savedPhotoUri) {
          setProfilePhotoUri(savedPhotoUri);
        }
      } catch (error) {
        console.warn("Failed to load profile photo:", error);
      }
    };

    loadProfilePhoto();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshMovies?.();
      refreshWishlist?.();
    }, [refreshMovies, refreshWishlist]),
  );

  const handlePickProfilePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          i18n.language === "lt"
            ? "Leidimas reikalingas"
            : "Permission required",
          i18n.language === "lt"
            ? "Norint pasirinkti profilio nuotrauką, reikia leisti pasiekti galeriją."
            : "Gallery access is required to choose a profile photo.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      const selectedPhotoUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;

      setProfilePhotoUri(selectedPhotoUri);
      await storeProfilePhoto(selectedPhotoUri);
    } catch (error) {
      console.warn("Failed to pick profile photo:", error);
      Alert.alert(
        i18n.language === "lt" ? "Klaida" : "Error",
        i18n.language === "lt"
          ? "Nepavyko pasirinkti profilio nuotraukos."
          : "Failed to select profile photo.",
      );
    }
  };

  const handleAddFriend = () => {
    const trimmedFriendName = friendName.trim();

    if (!trimmedFriendName) {
      return;
    }

    setFriends((currentFriends) => {
      const alreadyExists = currentFriends.some(
        (friend) => friend.toLowerCase() === trimmedFriendName.toLowerCase(),
      );

      if (alreadyExists) {
        return currentFriends;
      }

      return [...currentFriends, trimmedFriendName];
    });

    setFriendName("");
  };

  const safeWatched = Array.isArray(watchedMovies) ? watchedMovies : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  const isSelectedMovieWatched = selectedMovie
    ? safeWatched.some((movie) => movie.id === selectedMovie.id)
    : false;

  const handleWishlistToggle = () => {
    if (!selectedMovie) return;

    if (isInWishlist(selectedMovie.id)) {
      remove(selectedMovie.id);
    } else {
      add(selectedMovie);
    }
  };

  const handleToggleWatched = () => {
    if (!selectedMovie) return;

    if (isSelectedMovieWatched) {
      removeMovie(selectedMovie.id);
    } else {
      addMovie(selectedMovie);
    }
  };

  const handleRateSelectedMovie = (rating: number) => {
    if (!selectedMovie) return;

    rateMovie(selectedMovie.id, rating);
    setSelectedMovie({ ...selectedMovie, userRating: rating });
  };

  const ratedMoviesCount = safeWatched.filter(
    (movie) => Number(movie.userRating ?? 0) > 0,
  ).length;

  const averageRating = useMemo(() => {
    const ratings = safeWatched
      .map((movie) => Number(movie.userRating ?? 0))
      .filter((rating) => rating > 0);

    if (ratings.length === 0) return "0";

    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return (sum / ratings.length).toFixed(1);
  }, [safeWatched]);

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "alreadySeen", label: t("profile.tabs.alreadySeen") },
    { key: "friends", label: t("profile.tabs.friends") },
    { key: "settings", label: t("profile.tabs.settings") },
  ];

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.profileContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePickProfilePhoto}
              style={styles.avatarButton}
            >
              {profilePhotoUri ? (
                <Image
                  source={{ uri: profilePhotoUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <Image
                  source={require("@/assets/images/defaultprofile.jpg")}
                  style={styles.avatarImage}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePickProfilePhoto}
              style={[
                styles.changePhotoButton,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                },
              ]}
            >
              <ThemedText style={{ color: theme.text }}>
                {t("profile.changePhoto")}
              </ThemedText>
            </TouchableOpacity>

            <TextInput
              value={name}
              onChangeText={setName}
              style={[styles.name, { color: theme.title }]}
              placeholder={t("profile.defaultName")}
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText style={[styles.label, { color: theme.text }]}>
              {t("profile.aboutMe")}
            </ThemedText>

            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              style={[
                styles.description,
                {
                  color: theme.text,
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                },
              ]}
              placeholder={t("profile.defaultBio")}
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.statsContainer}>
            <StatBox
              value={safeWatched.length}
              label={t("profile.stats.moviesWatched")}
              color="#22c55e"
              theme={theme}
            />
            <StatBox
              value={ratedMoviesCount}
              label={t("profile.stats.moviesRated")}
              color="#f59e0b"
              theme={theme}
            />
            <StatBox
              value={safeWishlist.length}
              label={t("profile.stats.watchLater")}
              color="#3b82f6"
              theme={theme}
            />
            <StatBox
              value={averageRating}
              label={t("profile.stats.avgRating")}
              color="#a855f7"
              theme={theme}
            />
          </View>

          <View
            style={[
              styles.tabRow,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabButton,
                  activeTab === tab.key && { backgroundColor: theme.card },
                ]}
              >
                <ThemedText
                  style={{
                    color:
                      activeTab === tab.key ? theme.title : theme.textSecondary,
                    fontWeight: activeTab === tab.key ? "700" : "400",
                  }}
                >
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "alreadySeen" && (
            <View style={styles.moviesGrid}>
              {safeWatched.length === 0 ? (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: theme.backgroundElement },
                  ]}
                >
                  <ThemedText style={{ color: theme.textSecondary }}>
                    {t("profile.emptyWatched")}
                  </ThemedText>
                </View>
              ) : (
                safeWatched.map((movie) => (
                  <TouchableOpacity
                    key={movie.id}
                    activeOpacity={0.85}
                    style={styles.movieCard}
                    onPress={() => setSelectedMovie(movie)}
                  >
                    {movie.posterUrl ? (
                      <Image
                        source={{ uri: movie.posterUrl }}
                        style={styles.moviePoster}
                      />
                    ) : (
                      <View
                        style={[
                          styles.moviePoster,
                          styles.moviePosterPlaceholder,
                          { backgroundColor: theme.backgroundElement },
                        ]}
                      >
                        <ThemedText style={{ color: theme.textSecondary }}>
                          {movie.title}
                        </ThemedText>
                      </View>
                    )}

                    <ThemedText
                      style={[styles.movieTitle, { color: theme.title }]}
                      numberOfLines={2}
                    >
                      {movie.title}
                    </ThemedText>

                    <View style={styles.movieRatingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <ThemedText key={star} style={styles.movieStar}>
                          {Number(movie.userRating ?? 0) >= star ? "★" : "☆"}
                        </ThemedText>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {activeTab === "friends" && (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <View style={styles.friendInputRow}>
                <TextInput
                  value={friendName}
                  onChangeText={setFriendName}
                  placeholder={t("profile.friends.addPlaceholder", {
                    defaultValue: friendPlaceholderDefault,
                  })}
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.friendInput,
                    {
                      color: theme.text,
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                />

                <TouchableOpacity
                  onPress={handleAddFriend}
                  style={[
                    styles.friendAddButton,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <ThemedText style={{ color: theme.primaryText }}>
                    {t("profile.friends.addButton", {
                      defaultValue: friendAddButtonDefault,
                    })}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {friends.length === 0 ? (
                <ThemedText style={{ color: theme.textSecondary }}>
                  {t("profile.friends.empty", {
                    defaultValue: emptyFriendsDefault,
                  })}
                </ThemedText>
              ) : (
                <View style={styles.friendsGrid}>
                  {friends.map((friend) => (
                    <View
                      key={friend}
                      style={[
                        styles.friendCard,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.inputBorder,
                        },
                      ]}
                    >
                      <Image
                        source={require("@/assets/images/defaultprofile.jpg")}
                        style={styles.friendAvatar}
                      />
                      <ThemedText
                        style={[styles.friendName, { color: theme.title }]}
                        numberOfLines={1}
                      >
                        {friend}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === "settings" && (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <ThemedText
                type="title"
                style={[styles.settingsTitle, { color: theme.title }]}
              >
                {t("profile.settings.title")}
              </ThemedText>

              <SettingRow
                label={t("profile.settings.nightMode")}
                value={isDarkMode}
                onValueChange={(value) =>
                  setThemePreference(value ? "dark" : "light")
                }
              />

              <SettingRow label={t("profile.settings.notifications")} />
              <SettingRow label={t("profile.settings.autoplayTrailers")} />

              <ThemedText style={[styles.sectionLabel, { color: theme.text }]}>
                {t("profile.settings.language")}
              </ThemedText>

              <View style={styles.languageRow}>
                <LanguageButton
                  label={t("profile.settings.lithuanian")}
                  active={i18n.language === "lt"}
                  onPress={() => i18n.changeLanguage("lt")}
                  theme={theme}
                />
                <LanguageButton
                  label={t("profile.settings.english")}
                  active={i18n.language === "en"}
                  onPress={() => i18n.changeLanguage("en")}
                  theme={theme}
                />
                <LanguageButton
                  label={t("profile.settings.russian")}
                  active={i18n.language === "ru"}
                  onPress={() => i18n.changeLanguage("ru")}
                  theme={theme}
                />
                <LanguageButton
                  label={t("profile.settings.german")}
                  active={i18n.language === "de"}
                  onPress={() => i18n.changeLanguage("de")}
                  theme={theme}
                />
                <LanguageButton
                  label={t("profile.settings.french")}
                  active={i18n.language === "fr"}
                  onPress={() => i18n.changeLanguage("fr")}
                  theme={theme}
                />
              </View>

              <ThemedText style={[styles.sectionLabel, { color: theme.text }]}>
                {t("profile.settings.favoriteGenres")}
              </ThemedText>

              <View style={styles.genreRow}>
                <GenreChip
                  label={t("profile.favoriteGenres.action")}
                  theme={theme}
                />
                <GenreChip
                  label={t("profile.favoriteGenres.drama")}
                  theme={theme}
                />
                <GenreChip
                  label={t("profile.favoriteGenres.comedy")}
                  theme={theme}
                />
                <GenreChip
                  label={t("profile.favoriteGenres.sciFi")}
                  theme={theme}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <MovieModal
        movie={selectedMovie}
        visible={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
        isWatched={isSelectedMovieWatched}
        userRating={selectedMovie?.userRating}
        isInWishlist={selectedMovie ? isInWishlist(selectedMovie.id) : false}
        onWishlistToggle={handleWishlistToggle}
        onMarkWatched={handleToggleWatched}
        onRate={handleRateSelectedMovie}
      />
    </ThemedView>
  );
}

function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
}) {
  const [localValue, setLocalValue] = useState(false);
  const enabled = value ?? localValue;

  return (
    <View style={styles.settingRow}>
      <ThemedText>{label}</ThemedText>
      <Switch
        value={enabled}
        onValueChange={(nextValue) =>
          onValueChange ? onValueChange(nextValue) : setLocalValue(nextValue)
        }
      />
    </View>
  );
}

function StatBox({
  value,
  label,
  color,
  theme,
}: {
  value: string | number;
  label: string;
  color: string;
  theme: any;
}) {
  return (
    <View style={[styles.statBox, { borderColor: color }]}>
      <ThemedText style={[styles.statValue, { color: theme.title }]}>
        {value}
      </ThemedText>
      <ThemedText style={{ color: theme.textSecondary }}>{label}</ThemedText>
    </View>
  );
}

function LanguageButton({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.languageButton,
        {
          backgroundColor: active ? theme.primary : theme.inputBackground,
          borderColor: active ? theme.primary : theme.inputBorder,
        },
      ]}
    >
      <ThemedText style={{ color: active ? theme.primaryText : theme.text }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

function GenreChip({ label, theme }: { label: string; theme: any }) {
  return (
    <View style={[styles.genreChip, { backgroundColor: theme.primary }]}>
      <ThemedText style={{ color: theme.primaryText }}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#cfd3d8",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  changePhotoButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 10,
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "700",
    marginBottom: 6,
  },
  description: {
    width: "100%",
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    textAlignVertical: "top",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    width: "48%",
    minHeight: 110,
    borderWidth: 2,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  tabRow: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  card: {
    borderRadius: 14,
    padding: 18,
  },
  listItem: {
    marginBottom: 8,
  },
  friendInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  friendInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  friendAddButton: {
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  friendsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  friendCard: {
    width: "48%",
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  friendAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 10,
    resizeMode: "cover",
  },
  friendName: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    maxWidth: "100%",
  },
  moviesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 24,
  },
  movieCard: {
    width: "48%",
    marginBottom: 6,
  },
  moviePoster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 14,
    resizeMode: "cover",
    marginBottom: 8,
  },
  moviePosterPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  movieRatingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  movieStar: {
    color: "#facc15",
    fontSize: 18,
    lineHeight: 20,
  },
  settingsTitle: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 42,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "700",
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  languageButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreChip: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
});
