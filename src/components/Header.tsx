import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export function Header({ onMenuPress }: { onMenuPress: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.outer}>
      <LinearGradient
        colors={[theme.headerStart, theme.headerEnd]}
        style={styles.header}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onMenuPress} activeOpacity={0.75}>
            <Feather name="menu" size={Platform.OS === 'web' ? 26 : 30} color="#fff" />
          </TouchableOpacity>

          <ThemedText type="title" style={[styles.title, styles.lightText]}>
            BingeLog
          </ThemedText>
        </View>

        <ThemedText type="subtitle" style={[styles.subtitle, styles.lightText]}>
          {t('header.subtitle')}
        </ThemedText>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
  },
  header: {
    width: Platform.OS === 'web' ? 820 : MaxContentWidth / 2,
    maxWidth: Platform.OS === 'web' ? '100%' : MaxContentWidth,
    paddingTop: Platform.OS === 'web' ? 26 : 30,
    paddingHorizontal: Platform.OS === 'web' ? 36 : 30,
    paddingBottom: Platform.OS === 'web' ? 22 : 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    marginLeft: 15,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 13 : 14,
    marginTop: 8,
  },
  lightText: {
    color: '#FFFFFF',
  },
});
