import * as Device from 'expo-device';
import { useState, useRef} from 'react';
import { ScrollView, Animated, Dimensions, View, TouchableOpacity, Platform,
    StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { mockMovies } from '@/data/movies';
import { Feather } from '@expo/vector-icons';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const numColumns = 2;
const cardWidth = (screenWidth - cardMargin * (numColumns+1)) / numColumns;

export default function HomeScreen() {
    const [selectedMovie, setSelectedMovie] = useState(null); //Kai paspaudi ant filmu
    const fadeAnim = useRef(new Animated.Value(0)).current; //Pradzioje invisible

    const drawerAnim = useRef(new Animated.Value(-screenWidth)).current; //Pradzia uz ekrano

    const [category, setCategory] = useState('Trending');

    const menuItems = [
        {name: 'Trending', icon: 'trending-up'},
        {name: 'Recommended', icon: 'star'},
        {name: 'New Releases', icon: 'film'},
        {name: 'Watch Later', icon: 'clock'},
        {name: 'Popular', icon: 'thumbs-up'},
    ];

    {/*Filmu card atidarymas/uzdarymas*/}
    const openMovie = (movie) => {
        setSelectedMovie(movie);
        Animated.timing(fadeAnim,{
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };
    const closeMovie = (movie) => {
        setSelectedMovie(movie);
        Animated.timing(fadeAnim,{
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedMovie(null)); //Passibaigus animacijai, paslepiam
    };

    {/*Menu atidarymas / uzdarymas*/}
  const openMenu = () => {
      Animated.timing(drawerAnim,{
          toValue: 0, //Visiskai matomas
          duration: 300,
          useNativeDriver: false,
      }).start();
  }
  const closeMenu = () => {
      Animated.timing(drawerAnim,{
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: false,
      }).start();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

      {/* KATEGORIJU PASIRINKIMO MENU */}
        <Header onMenuPress={openMenu}/>
        <Animated.View style={[styles.menu, {left: drawerAnim }]}>
            {menuItems.map(item => (
                <TouchableOpacity
                key = {item.name}
                style = {styles.menuText}
                onPress={() => {
                    setCategory(item.name);
                    closeMenu();
                    }}
                >
                    <Feather name = {item.icon} size = {20} color = "#000" style = {styles.menuIcon}/>
                    <ThemedText>{item.name}</ThemedText>
                </TouchableOpacity>
            ))}
        </Animated.View>

        {/* PAGRINDINIS HOME PAGE CONTENT */}
        <ThemedText type = "categoryTitle" style = {styles.categoryTitle}>
        {category}
        </ThemedText>

        {/* FILMU SARASAS */}
        <FlatList
            data = {mockMovies}
            numColumns = {2}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            keyExtractor = {(item) => item.id}
            renderItem={({item}) => (
                <TouchableOpacity onPress={() => openMovie(item)}>
                    <MovieCard movie = {item}/>
                </TouchableOpacity>
            )}
        />

        {/*Atidarome filmu info naujame langely paspaudus ant filmo*/}
        {selectedMovie && (
            <Animated.View
               style = {[styles.animatedModalBackground,{opacity: fadeAnim},]}
            >
                <TouchableOpacity style = {styles.modalBackground} activeOpacity = {1} onPress = {closeMovie}>
                    <Animated.View style = {styles.modalContent}>
                        <ScrollView>
                            <Image source = {{uri: selectedMovie.posterUrl}} style = {styles.modalPoster}/>
                            <ThemedText style={styles.cardTitle}>
                                {selectedMovie.title}
                            </ThemedText>
                            <ThemedText style = {{marginTop:5}}>
                                {selectedMovie.year} | {Array.isArray(selectedMovie.genre) ? selectedMovie.genre.join(', ') : selectedMovie.genre} | ⭐ {selectedMovie.rating}
                            </ThemedText>
                            <ThemedText style = {{marginTop:10}}>
                                {selectedMovie.description}
                            </ThemedText>
                        </ScrollView>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        )}
        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

function MovieCard({ movie }){
    return (
        <View style={styles.card}>
            <Image source = {{uri : movie.posterUrl }} style = {styles.poster} />

            <View style = {styles.rating}>
               <ThemedText>⭐ {movie.rating}</ThemedText>
            </View>

            <ThemedText>{movie.title}</ThemedText>
            <ThemedText>{movie.year}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    animatedModalBackground:{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    card:{
        width: cardWidth,
        marginBottom: 10,
        padding: 5,
    },
    cardTitle:{
        marginVertical: 15,
        fontSize: 25,
        color: 'black',
    },
    categoryTitle:{
        textAlign: 'right',
        alignSelf: 'flex-start',
        marginLeft: 16,
    },
    container: {
      flex: 1,
    },
    modalBackground:{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent:{
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
    },
    modalPoster:{
        width: '100%',
        height: 300,
        borderRadius: 15,
    },
    menu:{
        paddingVertical: 60,
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 250,
        backgroundColor: '#fff',
        padding: 20,
        zIndex: 10,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowOffset: {width: 2, height: 0},
        shadowRadius: 5,
        elevation: 5,
    },
    menuIcon:{
        marginRight: 10,
    },
    menuText:{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        fontSize: 30,
    },
    poster:{
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginBottom: 5,
    },
    safeArea: {
        flex: 1, //Flex = 1 reiskia kad uzpildo visa likusia erdve
        paddingHorizontal: Spacing.zero, //Prideda tarpa is kaires ir desines
        alignItems: 'center', //centruoja vaikus horizontaliai
        gap: Spacing.four,
        paddingBottom: -Spacing.four, //Jeigu 0 tai siek tiek bus tuscias tarpas tarp filmu ir navigation bar apacioj
        maxWidth: MaxContentWidth,
    },
});
