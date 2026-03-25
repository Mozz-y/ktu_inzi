import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { initDatabase } from '@/database/database';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isDBReady, setIsDBReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => {
        setIsDBReady(true);
      })
      .catch((error) => {
        console.error('Failed to initialize database:', error);
        setDbError(error);
      });
  }, []);

  // Show loading indicator while initializing
  if (!isDBReady && !dbError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Optionally show an error screen if dbError is not null
  // For now, simply render the app
  if (dbError) {
    // TODO: render a fallback UI or retry button
    console.warn('Database error, app may not work offline');
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}