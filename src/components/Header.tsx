import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function Header({ onMenuPress }: { onMenuPress: () => void }) {
    const theme = useTheme();

    return(
        <LinearGradient
            colors={[theme.headerStart, theme.headerEnd]}
            style={styles.header}>
            {/*Pirmoji eilute: menu icon + bingelog */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={onMenuPress}>
                    <Feather name = "menu" size = {30} color = "#fff"/>
                </TouchableOpacity>
                <ThemedText type = "title" style={[styles.title, styles.lightText]}>
                    BingeLog
                </ThemedText>
            </View>
                <ThemedText type = "subtitle" style={[styles.subtitle, styles.lightText]}>
                    Discover, rate, and track your favorite movies
                </ThemedText>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
            width: MaxContentWidth/2,
          paddingTop: 30,
          paddingHorizontal: 30,
          paddingBottom: 20,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
    subtitle:{
        fontSize: 14,
        marginTop: 5,
    },
    lightText: {
        color: '#FFFFFF',
    },
    title:{
        marginLeft: 15,
    },
    topRow:{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 10
    }
    })
