import { ThemedText } from '@/components/themed-text';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const numColumns = 5;
const cardWidth = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

export type Actor = {
    imageUrl: string;
    name: string;
    surname: string;

}
interface ActorCardProps {
   actor: Actor;
}

export function ActorCard({ actor }: ActorCardProps) {
    

    return (
        <View style={styles.card}>
            <Image source={{ uri: actor.imageUrl }} style={styles.poster} />
            <ThemedText>{actor.name}</ThemedText>
            <ThemedText>{actor.surname}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        marginBottom: 10,
        padding: 5,
    },
    poster: {
        width: '100%',
        height: 50,
        borderRadius: 15,
        marginBottom: 5,
    },
    
});