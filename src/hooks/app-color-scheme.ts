import type { AppColorScheme, AppThemePreference } from '@/constants/theme';

export function resolveAppColorScheme(
  themePreference: AppThemePreference,
  deviceColorScheme: AppColorScheme | null | undefined
): AppColorScheme {
  if (themePreference === 'system') {
    return deviceColorScheme ?? 'light';
  }

  return themePreference;
}
