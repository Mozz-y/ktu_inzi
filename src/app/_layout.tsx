import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import '../../i18n/i18n';

import { fetchGenres } from '@/api/tmdb';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ThemedText } from '@/components/themed-text';
import { initDatabase } from '@/database/database';
import { UserService } from '@/services/user';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await initDatabase();
        await UserService.init();

        try {
          await fetchGenres();
        } catch (genreError) {
          console.error('Genre initialization failed:', genreError);
        }

        if (isMounted) {
          setIsReady(true);
        }
      } catch (err) {
        console.error('Initialization failed:', err);

        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <ThemedText
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
          }}
        >
          {t('errors.initializationFailed')}
        </ThemedText>

        <ThemedText style={{ textAlign: 'center', color: 'red' }}>
          {error.message}
        </ThemedText>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}