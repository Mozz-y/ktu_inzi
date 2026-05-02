
import { ThemedText } from '@/components/themed-text';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

export interface Actor {
  id: number;
  name: string;
  surname: string;
  imageUrl: string;
  character?: string;
  popularity?: number;
}

interface ActorCardProps {
  actor: Actor;
  onPress: (actor: Actor) => void;
}

export function ActorCard({ actor, onPress }: ActorCardProps) {
  return (
    <TouchableOpacity onPress={() => onPress(actor)} style={styles.container}>
      <Image source={{ uri: actor.imageUrl }} style={styles.image} />
      <ThemedText style={styles.name} numberOfLines={2}>
        {actor.name} {actor.surname}
      </ThemedText>
      {actor.character && (
        <ThemedText style={styles.character} numberOfLines={1}>
          as {actor.character}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130,
    marginRight: 12,
    alignItems: 'center',
  },
  image: {
    width: 130,
    height: 160,
    borderRadius: 8,
  },
  name: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  character: {
    marginTop: 2,
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
});