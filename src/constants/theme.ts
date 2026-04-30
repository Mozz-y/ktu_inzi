/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    title: '#111827',
    background: '#ffffff',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E5E7EB',
    textSecondary: '#60646C',
    border: '#D1D5DB',
    inputBackground: '#F3F4F6',
    inputBorder: '#D1D5DB',
    card: '#FFFFFF',
    modalBackground: '#FFFFFF',
    overlay: 'rgba(17, 24, 39, 0.45)',
    primary: '#2563EB',
    primaryText: '#FFFFFF',
    success: '#16A34A',
    warning: '#EAB308',
    danger: '#DC2626',
    tabInactive: '#6B7280',
    headerStart: '#7B2FF7',
    headerEnd: '#3A7BD5',
  },
  dark: {
    text: '#ffffff',
    title: '#F9FAFB',
    background: '#0F1115',
    backgroundElement: '#1B1E24',
    backgroundSelected: '#2A2F38',
    textSecondary: '#B0B4BA',
    border: '#3C4451',
    inputBackground: '#1B1E24',
    inputBorder: '#3C4451',
    card: '#171A20',
    modalBackground: '#171A20',
    overlay: 'rgba(0, 0, 0, 0.7)',
    primary: '#60A5FA',
    primaryText: '#0F1115',
    success: '#22C55E',
    warning: '#FACC15',
    danger: '#F87171',
    tabInactive: '#9CA3AF',
    headerStart: '#1D4ED8',
    headerEnd: '#0F766E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type AppThemePreference = 'light' | 'dark' | 'system';
export type AppColorScheme = 'light' | 'dark';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const TopTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 825;
