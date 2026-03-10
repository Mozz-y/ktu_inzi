import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText} from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

export function Header({ onMenuPress }){
    return(
        <LinearGradient
            colors={['#7b2ff7', '#3a7bd5']}
            style={styles.header}>
            {/*Pirmoji eilute: menu icon + bingelog */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={onMenuPress}>
                    <Feather name = "menu" size = {30} color = "#fff"/>
                </TouchableOpacity>
                <ThemedText type = "title" style={styles.title}>
                    BingeLog
                </ThemedText>
            </View>
                <ThemedText type = "subtitle" style={styles.subtitle}>
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