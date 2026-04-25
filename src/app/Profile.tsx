import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWatched } from '@/hooks/useWatched';
import { useWishlist } from '@/hooks/useWishlist';
import { useThemePreference } from '@/providers/theme-preference-provider';
import type { Movie } from '@/types/movie';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MovieModal } from '../components/MovieModal';

export default function ProfileScreen() {
  const theme = useTheme();
  const { isSystemTheme, isDarkMode, lastManualColorScheme, setThemePreference } = useThemePreference();
  const [activeTab, setActiveTab] = useState<'AlreadySeen' | 'Friends' | 'Settings'>('AlreadySeen');
  const { add, remove, isInWishlist } = useWishlist();
  const { movies, refreshMovies, removeMovie, rateMovie, addMovie } = useWatched();
  const [selectedMovie, setSelectedMovie] = useState<(Movie & { userRating?: number; watchedAt?: string }) | null>(null);
  const [username, onChangeUsername] = useState('Vardenis Pavardenis');
  const [description, onChangeDescription] = useState('ieskau darbo, parduodu audi');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [autoplayTrailersEnabled, setAutoplayTrailersEnabled] = useState(false);
  const exampleImage = require('@/assets/images/defaultprofile.jpg');
  const [profileImage, setProfileImage] = useState(Image.resolveAssetSource(exampleImage).uri);

  useFocusEffect(
    useCallback(() => {
      refreshMovies();
    }, [refreshMovies])
  );

  const watchedCount = movies.length;
  const ratedMovies = movies.filter(m => (m.userRating || 0) > 0);
  const avgRating =
    ratedMovies.length > 0
      ? (ratedMovies.reduce((acc, m) => acc + (m.userRating || 0), 0) / ratedMovies.length).toFixed(1)
      : '0';
  const isSingleWatched = movies.length === 1;

  const friends = [
    { id: 1, name: 'Alice', avatar: '@/assets/images/defaultprofile.jpg' },
    { id: 2, name: 'Bob', avatar: '@/assets/images/defaultprofile.jpg' },
    { id: 3, name: 'Charlie', avatar: '@/assets/images/defaultprofile.jpg' },
    { id: 4, name: 'Jeffrey', avatar: '@/assets/images/defaultprofile.jpg' },
    { id: 5, name: 'David', avatar: '@/assets/images/defaultprofile.jpg' },
  ];

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: false,
      selectionLimit: 1,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    } else {
      alert('You did not select any image.');
    }
  };

  const handleWishlistToggle = () => {
    if (!selectedMovie) return;

    if (isInWishlist(selectedMovie.id)) {
      remove(selectedMovie.id);
    } else {
      add(selectedMovie);
    }
  };

  const isCurrentlyWatched = selectedMovie ? movies.some(m => m.id === selectedMovie.id) : false;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator>
        <SafeAreaView style={styles.container}>
          <Pressable onPress={pickImageAsync}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          </Pressable>

          <TextInput
            style={[
              styles.name,
              {
                color: theme.text,
                borderColor: theme.inputBorder,
                backgroundColor: theme.inputBackground,
              },
            ]}
            onChangeText={onChangeUsername}
            value={username}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
          />

          <View style={styles.fullWidth}>
            <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
              About me
            </ThemedText>
            <TextInput
              style={[
                styles.description,
                {
                  color: theme.text,
                  borderColor: theme.inputBorder,
                  backgroundColor: theme.inputBackground,
                },
              ]}
              onChangeText={onChangeDescription}
              value={description}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>

          <View style={styles.grid}>
            <StatBox icon="eye" label="Movies Watched" value={watchedCount} color={theme.success} />
            <StatBox icon="star" label="Movies Rated" value={ratedMovies.length} color={theme.warning} />
            <StatBox icon="clock" label="Watch Later" value="0" color={theme.primary} />
            <StatBox icon="star" label="Avg Rating" value={avgRating} color="#A855F7" />
          </View>

          <View style={[styles.tabRow, { backgroundColor: theme.backgroundElement }]}>
            {['AlreadySeen', 'Friends', 'Settings'].map(tab => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    isActive && { backgroundColor: theme.backgroundSelected },
                  ]}
                  onPress={() => setActiveTab(tab as 'AlreadySeen' | 'Friends' | 'Settings')}>
                  <ThemedText
                    style={[
                      isActive ? styles.tabTextActive : styles.tabText,
                      { color: isActive ? theme.title : theme.textSecondary },
                    ]}>
                    {tab === 'AlreadySeen' ? 'Already Seen' : tab}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.contentArea}>
            {activeTab === 'AlreadySeen' && (
              <FlatList
                scrollEnabled={false}
                data={movies}
                numColumns={2}
                columnWrapperStyle={isSingleWatched ? styles.singleMovieWrapper : styles.multiMovieWrapper}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.movieRow, isSingleWatched && styles.movieRowSingle]}
                    onPress={() => setSelectedMovie(item)}>
                    <Image source={{ uri: item.posterUrl }} style={styles.moviePoster} />
                    <ThemedText style={styles.movieTitle} numberOfLines={2}>
                      {item.title}
                    </ThemedText>

                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={(item.userRating || 0) >= star ? 'star' : 'star-outline'}
                          size={14}
                          color={theme.warning}
                        />
                      ))}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <ThemedText style={styles.emptyState}>
                    You haven't watched any movies yet.
                  </ThemedText>
                )}
              />
            )}

            {activeTab === 'Friends' && (
              <FlatList
                scrollEnabled={false}
                data={friends}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.friendRow}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.friendBox,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Image source={require('@/assets/images/defaultprofile.jpg')} style={styles.friendAvatar} />
                    <ThemedText>{item.name}</ThemedText>
                  </View>
                )}
              />
            )}

            {activeTab === 'Settings' && (
              <View
                style={[
                  styles.settingsCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <ThemedText type="title" style={[styles.title, { color: theme.title }]}>
                  Settings
                </ThemedText>

                <SettingRow
                  label="Use device theme"
                  value={isSystemTheme}
                  onValueChange={(enabled) => setThemePreference(enabled ? 'system' : lastManualColorScheme)}
                />
                <SettingRow
                  label="Night Mode"
                  value={isDarkMode}
                  disabled={isSystemTheme}
                  onValueChange={(enabled) => setThemePreference(enabled ? 'dark' : 'light')}
                />
                <SettingRow label="Notifications" value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
                <SettingRow
                  label="Autoplay Trailers"
                  value={autoplayTrailersEnabled}
                  onValueChange={setAutoplayTrailersEnabled}
                />

                <ThemedText type="title" style={[styles.title, { color: theme.title }]}>
                  Favorite genres
                </ThemedText>
                <View style={styles.genreRow}>
                  {['Action', 'Drama', 'Comedy', 'Sci-Fi'].map(g => (
                    <View key={g} style={[styles.genreChip, { backgroundColor: theme.primary }]}>
                      <ThemedText style={[styles.genreText, { color: theme.primaryText }]}>{g}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </ScrollView>

      <MovieModal
        movie={selectedMovie}
        visible={selectedMovie !== null}
        onClose={() => setSelectedMovie(null)}
        isWatched={isCurrentlyWatched}
        userRating={selectedMovie?.userRating}
        isInWishlist={selectedMovie ? isInWishlist(selectedMovie.id) : false}
        onWishlistToggle={handleWishlistToggle}
        onMarkWatched={() => {
          if (!selectedMovie) return;

          if (isCurrentlyWatched) {
            removeMovie(selectedMovie.id);
          } else {
            addMovie(selectedMovie);
          }
        }}
        onRate={(rating) => {
          if (selectedMovie) {
            rateMovie(selectedMovie.id, rating);
            setSelectedMovie({ ...selectedMovie, userRating: rating });
          }
        }}
      />
    </View>
  );
}

function SettingRow({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void | Promise<void>;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.settingRow,
        {
          opacity: disabled ? 0.5 : 1,
          borderBottomColor: theme.border,
        },
      ]}>
      <ThemedText>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.backgroundSelected, true: theme.primary }}
        thumbColor={value ? theme.primaryText : '#F9FAFB'}
      />
    </View>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.statBox,
        {
          backgroundColor: theme.card,
          borderColor: color,
        },
      ]}>
      <Feather style={styles.statIcon} name={icon as never} size={40} color={color} />
      <ThemedText style={[styles.statValue, { color: theme.title }]}>{value}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 30,
    marginBottom: 15,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentArea: {
    flex: 1,
    width: '100%',
  },
  description: {
    marginBottom: 10,
    fontStyle: 'italic',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 20,
  },
  friendAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
    marginTop: 10,
  },
  friendBox: {
    borderRadius: 16,
    borderWidth: 1,
    width: '48%',
    alignItems: 'center',
    paddingBottom: 12,
  },
  friendRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  fullWidth: {
    width: '100%',
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  genreText: {
    fontWeight: '600',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    margin: 1,
    padding: 1,
    alignSelf: 'flex-start',
  },
  moviePoster: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 15,
    marginBottom: 10,
  },
  movieRow: {
    width: '48%',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  movieRowSingle: {
    width: '90%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  movieTitle: {
    fontWeight: '500',
  },
  multiMovieWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  settingsCard: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  singleMovieWrapper: {
    justifyContent: 'center',
    marginBottom: 15,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statBox: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  statIcon: {
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 20,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
  },
  tabText: {
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  title: {
    paddingHorizontal: 8,
    fontSize: 30,
    textAlign: 'left',
  },
});
