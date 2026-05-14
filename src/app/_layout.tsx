import { fetchGenres } from '@/api/tmdb';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { initDatabase } from '@/database/database';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { ThemePreferenceProvider } from '@/providers/theme-preference-provider';
import { SyncService } from '@/services/sync';
import { UserService } from '@/services/user';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import '../../i18n/i18n';

export default function TabLayout() {
  return (
    <ThemePreferenceProvider>
      <AppRoot />
    </ThemePreferenceProvider>
  );
}

function AppRoot() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await UserService.init();
        await fetchGenres();
        await SyncService.initialize();
        setIsReady(true);
      } catch (err) {
        console.error('Initialization failed:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initialize();
  }, []);

  if (!isReady && !error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Initialization Failed
        </ThemedText>
        <ThemedText style={{ textAlign: 'center', color: 'red' }}>
          {error.message}
        </ThemedText>
      </View>
    );
  }

  return <AppThemeContent />;
}

function AppThemeContent() {
  const colorScheme = useAppColorScheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors[colorScheme].background).catch(() => {});
  }, [colorScheme]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
