import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as SystemUI from 'expo-system-ui';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { initDatabase } from '@/database/database';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { ThemePreferenceProvider } from '@/providers/theme-preference-provider';
import { UserService } from '@/services/user';
import { fetchGenres } from '@/api/tmdb';

export default function TabLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await UserService.init();
        await fetchGenres(); // Load genre mappings
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

  return (
    <ThemePreferenceProvider>
      <AppThemeContent />
    </ThemePreferenceProvider>
  );
}

function AppThemeContent() {
  const colorScheme = useAppColorScheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors[colorScheme].background).catch(() => {
      // Keep startup resilient if the platform does not support this update.
    });
  }, [colorScheme]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
