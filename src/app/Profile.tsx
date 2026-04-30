import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useWatched } from '@/hooks/useWatched';
import { useWishlist } from '@/hooks/useWishlist';
import { useThemePreference } from '@/providers/theme-preference-provider';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ProfileTab = 'alreadySeen' | 'friends' | 'settings';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { isDarkMode, setThemePreference } = useThemePreference();

  const {
    movies: watchedMovies,
    refreshMovies,
  } = useWatched();

  const {
    wishlist,
    refreshWishlist,
  } = useWishlist();

  const [name, setName] = useState(t('profile.defaultName'));
  const [bio, setBio] = useState(t('profile.defaultBio'));
  const [activeTab, setActiveTab] = useState<ProfileTab>('settings');

  useFocusEffect(
    useCallback(() => {
      refreshMovies?.();
      refreshWishlist?.();
    }, [refreshMovies, refreshWishlist])
  );

  const safeWatched = Array.isArray(watchedMovies) ? watchedMovies : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  const ratedMoviesCount = safeWatched.filter(
    (movie) => Number(movie.userRating ?? 0) > 0
  ).length;

  const averageRating = useMemo(() => {
    const ratings = safeWatched
      .map((movie) => Number(movie.userRating ?? 0))
      .filter((rating) => rating > 0);

    if (ratings.length === 0) return '0';

    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return (sum / ratings.length).toFixed(1);
  }, [safeWatched]);

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'alreadySeen', label: t('profile.tabs.alreadySeen') },
    { key: 'friends', label: t('profile.tabs.friends') },
    { key: 'settings', label: t('profile.tabs.settings') },
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
            <View style={styles.avatar} />

            <TextInput
              value={name}
              onChangeText={setName}
              style={[styles.name, { color: theme.title }]}
              placeholder={t('profile.defaultName')}
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText style={[styles.label, { color: theme.text }]}>
              {t('profile.aboutMe')}
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
              placeholder={t('profile.defaultBio')}
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.statsContainer}>
            <StatBox
              value={safeWatched.length}
              label={t('profile.stats.moviesWatched')}
              color="#22c55e"
              theme={theme}
            />
            <StatBox
              value={ratedMoviesCount}
              label={t('profile.stats.moviesRated')}
              color="#f59e0b"
              theme={theme}
            />
            <StatBox
              value={safeWishlist.length}
              label={t('profile.stats.watchLater')}
              color="#3b82f6"
              theme={theme}
            />
            <StatBox
              value={averageRating}
              label={t('profile.stats.avgRating')}
              color="#a855f7"
              theme={theme}
            />
          </View>

          <View style={[styles.tabRow, { backgroundColor: theme.backgroundElement }]}>
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
                    color: activeTab === tab.key ? theme.title : theme.textSecondary,
                    fontWeight: activeTab === tab.key ? '700' : '400',
                  }}
                >
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'alreadySeen' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              {safeWatched.length === 0 ? (
                <ThemedText style={{ color: theme.textSecondary }}>
                  {t('profile.emptyWatched')}
                </ThemedText>
              ) : (
                safeWatched.map((movie) => (
                  <ThemedText key={movie.id} style={[styles.listItem, { color: theme.text }]}>
                    {movie.title} {movie.userRating ? `⭐ ${movie.userRating}` : ''}
                  </ThemedText>
                ))
              )}
            </View>
          )}

          {activeTab === 'friends' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={{ color: theme.textSecondary }}>
                {t('profile.tabs.friends')}
              </ThemedText>
            </View>
          )}

          {activeTab === 'settings' && (
            <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="title" style={[styles.settingsTitle, { color: theme.title }]}>
                {t('profile.settings.title')}
              </ThemedText>

              <SettingRow
                label={t('profile.settings.nightMode')}
                value={isDarkMode}
                onValueChange={(value) => setThemePreference(value ? 'dark' : 'light')}
              />

              <SettingRow label={t('profile.settings.notifications')} />
              <SettingRow label={t('profile.settings.autoplayTrailers')} />

              <ThemedText style={[styles.sectionLabel, { color: theme.text }]}>
                {t('profile.settings.language')}
              </ThemedText>

              <View style={styles.languageRow}>
                <LanguageButton
                  label={t('profile.settings.lithuanian')}
                  active={i18n.language === 'lt'}
                  onPress={() => i18n.changeLanguage('lt')}
                  theme={theme}
                />
                <LanguageButton
                  label={t('profile.settings.english')}
                  active={i18n.language === 'en'}
                  onPress={() => i18n.changeLanguage('en')}
                  theme={theme}
                />
              </View>

              <ThemedText style={[styles.sectionLabel, { color: theme.text }]}>
                {t('profile.settings.favoriteGenres')}
              </ThemedText>

              <View style={styles.genreRow}>
                <GenreChip label={t('profile.favoriteGenres.action')} theme={theme} />
                <GenreChip label={t('profile.favoriteGenres.drama')} theme={theme} />
                <GenreChip label={t('profile.favoriteGenres.comedy')} theme={theme} />
                <GenreChip label={t('profile.favoriteGenres.sciFi')} theme={theme} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#cfd3d8',
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    width: '100%',
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    textAlignVertical: 'top',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    width: '48%',
    minHeight: 110,
    borderWidth: 2,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  card: {
    borderRadius: 14,
    padding: 18,
  },
  listItem: {
    marginBottom: 8,
  },
  settingsTitle: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 42,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '700',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  languageButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
});