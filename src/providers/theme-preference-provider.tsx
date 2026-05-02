import type { AppColorScheme, AppThemePreference } from '@/constants/theme';
import { resolveAppColorScheme } from '@/hooks/app-color-scheme';
import { UserService } from '@/services/user';
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemePreferenceContextValue = {
  effectiveColorScheme: AppColorScheme;
  isDarkMode: boolean;
  isSystemTheme: boolean;
  lastManualColorScheme: AppColorScheme;
  themePreference: AppThemePreference;
  setThemePreference: (preference: AppThemePreference) => Promise<void>;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const deviceColorScheme = useColorScheme();
  const initialPreference = UserService.getThemePreference();

  const [themePreference, setThemePreferenceState] = useState<AppThemePreference>(initialPreference);
  const [lastManualColorScheme, setLastManualColorScheme] = useState<AppColorScheme>(
    initialPreference === 'light' || initialPreference === 'dark' ? initialPreference : 'light'
  );

  const effectiveColorScheme = resolveAppColorScheme(themePreference, deviceColorScheme);

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({
      effectiveColorScheme,
      isDarkMode: effectiveColorScheme === 'dark',
      isSystemTheme: themePreference === 'system',
      lastManualColorScheme,
      themePreference,
      setThemePreference: async (preference) => {
        await UserService.updateThemePreference(preference);
        setThemePreferenceState(preference);

        if (preference === 'light' || preference === 'dark') {
          setLastManualColorScheme(preference);
        }
      },
    }),
    [effectiveColorScheme, lastManualColorScheme, themePreference]
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider.');
  }

  return context;
}
