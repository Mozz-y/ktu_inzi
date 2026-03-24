import * as Device from 'expo-device';
import { Switch, ScrollView, View, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { mockMovies } from '@/mocks/movies';
import { Feather } from '@expo/vector-icons';
import { useWatched } from '@/hooks/useWatched';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'; 

export default function ProfileScreen() {
    const [activeTab, setActiveTab] = useState<'AlreadySeen' | 'Friends' | 'Settings'>('AlreadySeen');

    const { movies, refreshMovies } = useWatched(); 

    useFocusEffect(
        useCallback(() => {
            refreshMovies();
        }, [])
    );

    const watchedCount = movies.length;
    const ratedMovies = movies.filter(m => (m.userRating || 0) > 0);
    const avgRating = ratedMovies.length > 0 
        ? (ratedMovies.reduce((acc, m) => acc + (m.userRating || 0), 0) / ratedMovies.length).toFixed(1) 
        : '0';

    //Temporary data
    const friends = [
        {id: 1, name: 'Alice', avatar: '@/assets/images/goat.jpg'},
        {id: 2, name: 'Bob', avatar: '@/assets/images/goat.jpg'},
        {id: 3, name: 'Charlie', avatar: '@/assets/images/goat.jpg'},
        {id: 4, name: 'Jeffrey', avatar: '@/assets/images/goat.jpg'},
        {id: 5, name: 'David', avatar: '@/assets/images/goat.jpg'},
    ]

  return (
    <ScrollView style={{flex: 1}}
        contentContainerStyle = {{alignItems: 'center', paddingHorizontal: 20, paddingBottom: 50}}
        showsVerticalScrollIndicator = {true}
        >

        <SafeAreaView style = {styles.container}>
            {/* Profilio nuotrauka */}
            <Image
                source = {require('@/assets/images/goat.jpg')}
                style={styles.avatar}
            />

            {/* Username */}
            <ThemedText type="title" style = {styles.name}>
                John Doe
            </ThemedText>

            {/* Stats */}
            <View style = {styles.grid}>
                <StatBox icon="eye" label="Movies Watched" value={watchedCount} color="#22c55e"/>
                <StatBox icon="star" label="Movies Rated" value={ratedMovies.length} color="#eab308"/>
                <StatBox icon="clock" label="Watch Later" value="0" color="#3b82f6"/> 
                <StatBox icon="star" label="Avg Rating" value={avgRating} color="#a855f7"/>
            </View>

            {/* Tabs tarp already seen, friends, settings */}
            <View style = {styles.tabRow}>
                {['AlreadySeen','Friends','Settings'].map(tab => (
                    <TouchableOpacity
                        key = {tab}
                        style = {[styles.tabButton,activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab as any)}>

                        <ThemedText style = {activeTab === tab ? styles.tabTextActive : styles.tabText}>
                            {tab === 'AlreadySeen' ? 'Already Seen' : tab}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab content */}
            <View style = {{flex: 1, width: '100%'}}>

                {/*Already seen tab*/}
                {activeTab === 'AlreadySeen' && (
                    <FlatList
                        scrollEnabled={false}
                        data={movies} 
                        numColumns={2}
                        columnWrapperStyle={{justifyContent: 'space-between', marginBottom: 15}}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.movieRow}>
                                <Image source={{ uri: item.posterUrl }} style={styles.moviePoster} />
                                <ThemedText style={styles.movieTitle}>{item.title}</ThemedText>
                                {/* Showing users rating if it exists */}
                                <ThemedText style={styles.movieRating}>
                                    {item.userRating ? `Your rating: ⭐ ${item.userRating}` : `System: ⭐ ${item.rating}`}
                                </ThemedText>
                            </View>
                        )}
                            ListEmptyComponent={() => (
                                <ThemedText style={{textAlign: 'center', marginTop: 20}}>
                                    You haven't watched any movies yet.
                                </ThemedText>
                            )}
                        />
                    )}

                {/*Friends tab*/}
                {activeTab === 'Friends' && (
                    <FlatList
                        scrollEnabled = {false}
                        data = {friends}
                        keyExtractor = {item => item.id.toString()}
                        numColumns = {2}
                        columnWrapperStyle = {{justifyContent: 'space-between', marginBottom: 15}}
                        renderItem = {({item}) =>(
                            <View style = {styles.friendBox}>
                                <Image source = {require('@/assets/images/goat.jpg')} style = {styles.friendAvatar}/>
                                <ThemedText>{item.name}</ThemedText>
                            </View>
                        )}
                    />
                )}

                {/*Settings tab*/}
                {activeTab === 'Settings' && (
                    <View style = {{padding: 10, backgroundColor: '#e0e0e0', borderRadius: 16,}}>
                        {/*Settings*/}
                        <ThemedText type = "title" style = {styles.title}>Settings</ThemedText>
                        <SettingRow label = "Night Mode"/>
                        <SettingRow label = "Notifications"/>
                        <SettingRow label = "Autoplay Trailers"/>

                        {/*Favorite genres*/}
                        <ThemedText type = "title" style = {styles.title}>Favorite genres</ThemedText>
                        <View style = {{flexDirection: 'row', flexWrap: 'nowrap', marginTop: 5}}>
                            {['Action','Drama','Comedy','Sci-Fi'].map(g => (
                                <View key = {g} style = {styles.genreChip}>
                                    <ThemedText style = {styles.genreText}>{g}</ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    </ScrollView>
  );
}

function SettingRow({label}: {label: string}){
    const [enabled, setEnabled] = useState(false);
    return(
        <View style = {styles.settingRow}>
            <ThemedText>{label}</ThemedText>
            <Switch value = {enabled} onValueChange = {setEnabled}/>
        </View>
    );
}

function StatBox({icon, label, value, color,} : {icon : string; label: string; value: number | string; color: string}){
    return(
        <View style = {[styles.statBox, {borderColor: color}]}>
            <Feather style = {styles.statIcon} name = {icon as any} size = {40} color = {color}/>
            <ThemedText style = {styles.statValue}>{value}</ThemedText>
            <ThemedText style = {styles.statLabel}>{label}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar:{
        width: 120,
        height: 120,
        borderRadius: 60,
        marginTop: 30,
        marginBottom: 15,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    friendAvatar:{
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 5,
        marginTop: 10,
    },
    friendBox:{
        borderRadius: 16,
        backgroundColor: '#e0e0e0',
        borderWidth: 1,
        borderColor: 'gray',
        width: '48%',
        alignItems: 'center',
    },
    genreChip:{
        backgroundColor: '#3a7bd5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    genreText:{
        color: 'white',
    },
    grid:{
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    moviePoster:{
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginBottom: 10,
    },
    movieRow:{
        width: '48%',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 5,
    },
    movieRating:{
        fontWeight: '400',
        fontSize: 12,
    },
    movieTitle:{
        fontWeight: 500,
    },
    name:{
        color: 'black',
        marginBottom: 30,
    },
    settingRow:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        borderRadius: 10,
        paddingHorizontal: 8,
    },
    tabActive:{
        backgroundColor: '#ffffff',
    },
    tabButton:{
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabRow:{
        flexDirection: 'row',
        marginBottom: 15,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
    },
    tabText:{
        fontWeight: '500',
    },
    tabTextActive:{
        fontWeight: 'bold',
        color: 'black',
    },
    title:{
        paddingHorizontal: 8,
        fontSize: 30,
        textAlign: 'left',
        color: 'black',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        alignItems: 'center',
        gap: Spacing.three,
        paddingBottom: BottomTabInset + Spacing.three,
        maxWidth: MaxContentWidth,
    },
    statBox:{
        width: '48%',
        backgroundColor: '#e0e0e0',
        borderRadius: 16,
        borderWidth: 2,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 15,
    },
    statIcon:{
        marginBottom: 15,
    },
    statValue:{
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statLabel:{
        color: 'gray',
        fontSize: 20,
        textAlign: 'center',
    },
});
