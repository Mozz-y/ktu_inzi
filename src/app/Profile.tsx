import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useWatched } from '@/hooks/useWatched';
import { useWishlist } from '@/hooks/useWishlist';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../i18n/i18n';

type ProfileTab = 'AlreadySeen' | 'Friends' | 'Settings';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProfileTab>('AlreadySeen');
  const { movies, refreshMovies } = useWatched();
  const { wishlist } = useWishlist();

  const [username, setUsername] = useState(t('profile.defaultName'));
  const [description, setDescription] = useState(t('profile.defaultBio'));

  const exampleImage = require('@/assets/images/defaultprofile.jpg');
  const [profileImage, setProfileImage] = useState(
    Image.resolveAssetSource(exampleImage).uri
  );

  useFocusEffect(
    useCallback(() => {
      refreshMovies();
    }, [refreshMovies])
  );

  const safeMovies = Array.isArray(movies) ? movies : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  const watchedCount = safeMovies.length;
  const ratedMovies = safeMovies.filter((m) => (m.userRating || 0) > 0);
  const avgRating =
    ratedMovies.length > 0
      ? (
          ratedMovies.reduce((acc, m) => acc + (m.userRating || 0), 0) /
          ratedMovies.length
        ).toFixed(1)
      : '0';

  const isSingleWatched = safeMovies.length === 1;

  const friends = useMemo(
    () => [
      { id: 1, name: 'Emma' },
      { id: 2, name: 'Lucas' },
      { id: 3, name: 'Sofia' },
      { id: 4, name: 'Noah' },
    ],
    []
  );

  const tabLabels: Record<ProfileTab, string> = {
    AlreadySeen: t('profile.tabs.alreadySeen'),
    Friends: t('profile.tabs.friends'),
    Settings: t('profile.tabs.settings'),
  };

  const favoriteGenreKeys = ['action', 'drama', 'comedy', 'sciFi'] as const;

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
      alert(t('profile.imagePickerCancelled'));
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator
    >
      <SafeAreaView style={styles.container}>
        <Pressable onPress={pickImageAsync}>
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        </Pressable>

        <TextInput
          style={styles.name}
          onChangeText={setUsername}
          value={username}
          placeholder={t('profile.defaultName')}
          placeholderTextColor="#777"
        />

        <View style={styles.fullWidth}>
          <ThemedText type="smallBold" style={styles.label}>
            {t('profile.aboutMe')}
          </ThemedText>
          <TextInput
            style={styles.description}
            onChangeText={setDescription}
            value={description}
            placeholder={t('profile.defaultBio')}
            placeholderTextColor="#777"
            multiline
          />
        </View>

        <View style={styles.grid}>
          <StatBox
            icon="eye"
            label={t('profile.stats.moviesWatched')}
            value={watchedCount}
            color="#22c55e"
          />
          <StatBox
            icon="star"
            label={t('profile.stats.moviesRated')}
            value={ratedMovies.length}
            color="#eab308"
          />
          <StatBox
            icon="clock"
            label={t('profile.stats.watchLater')}
            value={safeWishlist.length}
            color="#3b82f6"
          />
          <StatBox
            icon="star"
            label={t('profile.stats.avgRating')}
            value={avgRating}
            color="#a855f7"
          />
        </View>

        <View style={styles.tabRow}>
          {(['AlreadySeen', 'Friends', 'Settings'] as ProfileTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText
                style={activeTab === tab ? styles.tabTextActive : styles.tabText}
              >
                {tabLabels[tab]}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentArea}>
          {activeTab === 'AlreadySeen' && (
            <FlatList
              scrollEnabled={false}
              data={safeMovies}
              numColumns={2}
              columnWrapperStyle={
                isSingleWatched ? styles.singleMovieWrapper : styles.multiMovieWrapper
              }
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={[styles.movieRow, isSingleWatched && styles.movieRowSingle]}>
                  <Image source={{ uri: item.posterUrl }} style={styles.moviePoster} />
                  <ThemedText style={styles.movieTitle} numberOfLines={2}>
                    {item.title}
                  </ThemedText>

                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={(item.userRating || 0) >= star ? 'star' : 'star-outline'}
                        size={14}
                        color="#eab308"
                      />
                    ))}
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <ThemedText style={styles.emptyWatchedText}>
                  {t('profile.emptyWatched')}
                </ThemedText>
              )}
            />
          )}

          {activeTab === 'Friends' && (
            <FlatList
              scrollEnabled={false}
              data={friends}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              columnWrapperStyle={styles.friendsRow}
              renderItem={({ item }) => (
                <View style={styles.friendBox}>
                  <Image source={require('@/assets/images/defaultprofile.jpg')} style={styles.friendAvatar} />
                  <ThemedText>{item.name}</ThemedText>
                </View>
              )}
            />
          )}

          {activeTab === 'Settings' && (
            <View style={styles.settingsCard}>
              <ThemedText type="title" style={styles.sectionTitle}>
                {t('profile.settings.title')}
              </ThemedText>

              <SettingRow label={t('profile.settings.nightMode')} />
              <SettingRow label={t('profile.settings.notifications')} />
              <SettingRow label={t('profile.settings.autoplayTrailers')} />

              <ThemedText type="smallBold" style={styles.languageLabel}>
                {t('profile.settings.language')}
              </ThemedText>

              <View style={styles.languageRow}>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    i18n.language === 'lt' && styles.languageButtonActive,
                  ]}
                  onPress={() => i18n.changeLanguage('lt')}
                >
                  <ThemedText
                    style={[
                      styles.languageButtonText,
                      i18n.language === 'lt' && styles.languageButtonTextActive,
                    ]}
                  >
                    {t('profile.settings.lithuanian')}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    i18n.language === 'en' && styles.languageButtonActive,
                  ]}
                  onPress={() => i18n.changeLanguage('en')}
                >
                  <ThemedText
                    style={[
                      styles.languageButtonText,
                      i18n.language === 'en' && styles.languageButtonTextActive,
                    ]}
                  >
                    {t('profile.settings.english')}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText type="smallBold" style={styles.genreSectionLabel}>
                {t('profile.settings.favoriteGenres')}
              </ThemedText>

              <View style={styles.genreWrap}>
                {favoriteGenreKeys.map((genreKey) => (
                  <View key={genreKey} style={styles.genreChip}>
                    <ThemedText style={styles.genreText}>
                      {t(`profile.favoriteGenres.${genreKey}`)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

function SettingRow({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <View style={styles.settingRow}>
      <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      <Switch value={enabled} onValueChange={setEnabled} />
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
  return (
    <View style={[styles.statBox, { borderColor: color }]}>
      <Feather style={styles.statIcon} name={icon as any} size={36} color={color} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 20,
    marginBottom: 15,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  contentArea: {
    width: '100%',
  },
  description: {
    color: 'black',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  emptyWatchedText: {
    textAlign: 'center',
    marginTop: 20,
  },
  friendAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
    marginTop: 10,
  },
  friendBox: {
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  friendsRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  fullWidth: {
    width: '100%',
  },
  genreChip: {
    backgroundColor: '#3a7bd5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  genreSectionLabel: {
    marginTop: 8,
    marginBottom: 10,
    color: 'black',
  },
  genreText: {
    color: 'white',
  },
  genreWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  label: {
    color: 'black',
    fontSize: 14,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cfcfcf',
  },
  languageButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  languageButtonText: {
    color: 'black',
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  languageLabel: {
    marginTop: 12,
    marginBottom: 8,
    color: 'black',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  moviePoster: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 15,
    marginBottom: 10,
  },
  movieRow: {
    width: '48%',
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
    color: 'black',
    fontSize: 24,
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  sectionTitle: {
    fontSize: 28,
    color: 'black',
    marginBottom: 12,
  },
  settingLabel: {
    flex: 1,
    paddingRight: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    borderRadius: 10,
    paddingVertical: 6,
  },
  settingsCard: {
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    width: '100%',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  singleMovieWrapper: {
    justifyContent: 'center',
  },
  starRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 180,
    justifyContent: 'center',
  },
  statIcon: {
    marginBottom: 12,
  },
  statLabel: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  statValue: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tabActive: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  tabText: {
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: 'bold',
    color: 'black',
  },
});