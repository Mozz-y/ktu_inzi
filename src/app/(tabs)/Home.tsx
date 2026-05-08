import { fetchMoviesByCategory } from "@/api/tmdb";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useWatched } from "@/hooks/useWatched";
import { useWishlist } from "@/hooks/useWishlist";
import type { Movie } from "@/types/movie";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

type CategoryKey =
  | "trending"
  | "recommended"
  | "newReleases"
  | "wishlist"
  | "popular";

type MenuItem = {
  key: CategoryKey;
  icon: keyof typeof Feather.glyphMap;
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [category, setCategory] = useState<CategoryKey>("trending");
  const [menuVisible, setMenuVisible] = useState(false);

  const { wishlist, add, remove, isInWishlist } = useWishlist();
  const {
    movies: watchedMovies,
    addMovie,
    rateMovie,
    removeMovie,
    isWatched,
    getUserRating,
  } = useWatched();

  const drawerAnim = useRef(new Animated.Value(-screenWidth)).current;

  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const safeWatchedMovies = Array.isArray(watchedMovies) ? watchedMovies : [];

  const menuItems: MenuItem[] = useMemo(
    () => [
      { key: "trending", icon: "trending-up" },
      { key: "recommended", icon: "star" },
      { key: "newReleases", icon: "film" },
      { key: "wishlist", icon: "heart" },
      { key: "popular", icon: "thumbs-up" },
    ],
    [],
  );

  const tmdbCategoryMap: Record<Exclude<CategoryKey, "wishlist">, string> = {
    trending: "Trending",
    recommended: "Recommended",
    newReleases: "New Releases",
    popular: "Popular",
  };

  useEffect(() => {
    let isActive = true;

    if (category === "wishlist") {
      return () => {
        isActive = false;
      };
    }

    const loadData = async () => {
      try {
        const data = await fetchMoviesByCategory(tmdbCategoryMap[category]);
        if (isActive) {
          setMovies(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Home loadData failed:", error);
        if (isActive) {
          setMovies([]);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [category]);

  const openMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeMovie = () => {
    setSelectedMovie(null);
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(drawerAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const handleWishlistToggle = () => {
    if (!selectedMovie) return;

    if (isInWishlist(selectedMovie.id)) {
      remove(selectedMovie.id);
    } else {
      add(selectedMovie);
    }
  };

  const handleSetRating = (rating: number) => {
    if (!selectedMovie) return;
    rateMovie(selectedMovie.id, rating);
  };

  const getWebColumnCount = () => {
    if (width >= 1100) return 5;
    if (width >= 900) return 4;
    if (width >= 680) return 3;
    return 2;
  };

  const numColumns = Platform.OS === "web" ? getWebColumnCount() : 2;
  const cardGap = Platform.OS === "web" ? 20 : 12;
  const cardWidth = `${100 / numColumns}%`;

  const displayedMovies = category === "wishlist" ? safeWishlist : movies;
  const selectedMovieIsWatched = selectedMovie
    ? isWatched(selectedMovie.id)
    : false;
  const selectedMovieUserRating = selectedMovie
    ? getUserRating(selectedMovie.id)
    : 0;
  const categoryTitle = t(`home.categories.${category}`);

  const renderCategoryMenuItems = (variant: "drawer" | "sidebar") =>
    menuItems.map((item) => (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.menuItem,
          variant === "sidebar" && styles.sidebarMenuItem,
          category === item.key &&
            variant === "sidebar" && { backgroundColor: theme.border },
        ]}
        onPress={() => {
          setCategory(item.key);
          if (variant === "drawer") {
            closeMenu();
          }
        }}
      >
        <Feather
          name={item.icon}
          size={variant === "sidebar" ? 18 : 22}
          color={theme.text}
          style={styles.menuIcon}
        />
        <ThemedText
          style={[
            styles.menuItemText,
            variant === "sidebar" && styles.sidebarMenuItemText,
            { color: theme.text },
          ]}
        >
          {t(`home.categories.${item.key}`)}
        </ThemedText>
      </TouchableOpacity>
    ));

  const renderMovieList = () => {
    if (category === "wishlist" && displayedMovies.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {t("home.emptyWishlist")}
          </ThemedText>
        </View>
      );
    }

    if (Platform.OS === "web") {
      return (
        <View style={styles.webGrid}>
          {(Array.isArray(displayedMovies) ? displayedMovies : []).map((item, index) => (
            <View
              key={String(item?.id ?? index)}
              style={[
                styles.cardColumn,
                ({ width: cardWidth, paddingHorizontal: cardGap / 2 } as any),
              ]}
            >
              <TouchableOpacity
                onPress={() => openMovie(item)}
                activeOpacity={0.85}
                style={styles.cardWrapper}
              >
                <MovieCard movie={item} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    }

    return (
      <FlatList
        data={Array.isArray(displayedMovies) ? displayedMovies : []}
        key={`${Platform.OS}-${numColumns}`}
        numColumns={numColumns}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        renderItem={({ item }) => (
          <View
            style={[
              styles.cardColumn,
              ({ width: cardWidth, paddingHorizontal: cardGap / 2 } as any),
            ]}
          >
            <TouchableOpacity
              onPress={() => openMovie(item)}
              activeOpacity={0.85}
              style={styles.cardWrapper}
            >
              <MovieCard movie={item} />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator
        style={styles.movieList}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    );
  };

  return (
    <ThemedView
      style={[
        styles.container,
        Platform.OS === "web" ? (styles.webRoot as any) : null,
      ]}
    >
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <View style={styles.headerSection}>
          <Header onMenuPress={openMenu} />
        </View>

        {menuVisible && (
          <>
            <TouchableWithoutFeedback onPress={closeMenu}>
              <View
                style={[styles.overlay, { backgroundColor: theme.overlay }]}
              />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                styles.menu,
                {
                  left: drawerAnim,
                  backgroundColor: theme.modalBackground,
                  borderRightColor: theme.border,
                },
              ]}
            >
              {renderCategoryMenuItems("drawer")}
            </Animated.View>
          </>
        )}

        <View style={styles.content}>
          {Platform.OS === "web" ? (
            <View style={styles.webContentRow}>
              <View
                style={[
                  styles.sidebar,
                  {
                    backgroundColor: theme.modalBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                {renderCategoryMenuItems("sidebar")}
              </View>

              <View style={styles.webMainContent}>
                <ThemedText
                  type="title"
                  style={[styles.categoryTitle, { color: theme.title }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                >
                  {categoryTitle}
                </ThemedText>
                {renderMovieList()}
              </View>
            </View>
          ) : (
            <>
              <ThemedText
                type="title"
                style={[styles.categoryTitle, { color: theme.title }]}
                numberOfLines={1}
                ellipsizeMode="tail"
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {categoryTitle}
              </ThemedText>
              {renderMovieList()}
            </>
          )}
        </View>

      </SafeAreaView>

      <MovieModal
        movie={selectedMovie}
        visible={!!selectedMovie}
        onClose={closeMovie}
        onWishlistToggle={handleWishlistToggle}
        onMarkWatched={() => {
          if (!selectedMovie) return;

          if (selectedMovieIsWatched) {
            removeMovie(selectedMovie.id);
          } else {
            addMovie(selectedMovie);
          }
        }}
        onRate={handleSetRating}
        isInWishlist={selectedMovie ? isInWishlist(selectedMovie.id) : false}
        isWatched={selectedMovieIsWatched}
        userRating={selectedMovieUserRating}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardColumn: {
    marginBottom: Platform.OS === "web" ? 22 : 12,
  },
  cardWrapper: {
    width: "100%",
  },
  categoryTitle: {
    alignSelf: "flex-start",
    width: "100%",
    marginBottom: Platform.OS === "web" ? 20 : 12,
    fontSize: Platform.OS === "android" ? 30 : 35,
    lineHeight: Platform.OS === "android" ? 38 : 52,
  },
  columnWrapper: {
    alignItems: "flex-start",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: Platform.OS === "web" ? undefined : 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 820 : MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Platform.OS === "web" ? 0 : 0,
  },
  headerSection: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: Platform.OS === "web" ? 104 : 0,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.6,
    textAlign: "center",
  },
  listContent: {
    width: "100%",
    paddingTop: 2,
    paddingBottom: Platform.OS === "web" ? 20 : 0,
  },
  movieList: {
    flex: 1,
    width: "100%",
  },
  menu: {
    paddingVertical: 60,
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 260,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 8,
    elevation: 6,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 18,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  safeArea: {
    flex: 1,
    flexGrow: 1,
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: Platform.OS === "web" ? 0 : Spacing.one,
    alignItems: "center",
    gap: Platform.OS === "web" ? 36 : Spacing.four,
    paddingBottom: Platform.OS === "web" ? 64 : 0,
  },
  sidebar: {
    width: Platform.OS === "web" ? 200 : 260,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    flexShrink: 0,
    ...(Platform.OS === "web"
      ? {
          position: "absolute" as const,
          left: -232,
          top: 0,
        }
      : {}),
  },
  sidebarMenuItem: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sidebarMenuItemText: {
    fontSize: 15,
  },
  webRoot: {
    height: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
  } as any,
  webContentRow: {
    width: "100%",
    minHeight: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    position: "relative",
  },
  webMainContent: {
    width: "100%",
    maxWidth: 820,
    minWidth: 0,
  },
  webGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    paddingBottom: 48,
  },
});
