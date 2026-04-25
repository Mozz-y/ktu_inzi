import { useThemePreference } from '@/providers/theme-preference-provider';

export function useAppColorScheme() {
  return useThemePreference().effectiveColorScheme;
}
