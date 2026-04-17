import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function Header({ onMenuPress }: { onMenuPress: () => void }) {
    const { t } = useTranslation();

    return (
        <LinearGradient
            colors={['#7b2ff7', '#3a7bd5']}
            style={styles.header}
        >
            {/* Pirmoji eilutė: menu icon + bingelog */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={onMenuPress}>
                    <Feather name="menu" size={30} color="#fff" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>
                    BingeLog
                </ThemedText>
            </View>

            <ThemedText type="subtitle" style={styles.subtitle}>
                {t('header.subtitle')}
            </ThemedText>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        width: MaxContentWidth / 2,
        paddingTop: 30,
        paddingHorizontal: 30,
        paddingBottom: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 5,
    },
    title: {
        marginLeft: 15,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 10,
    },
});