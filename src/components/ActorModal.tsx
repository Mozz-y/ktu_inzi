// ActorModal.tsx
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ActorDetails {
  id: number;
  name: string;
  surname: string;
  imageUrl: string;
  character?: string;
  popularity?: number;
  biography?: string;
  birthday?: string;
  placeOfBirth?: string;
}

interface ActorModalProps {
  visible: boolean;
  actor: ActorDetails | null;
  onClose: () => void;
}

export function ActorModal({ visible, actor, onClose }: ActorModalProps) {
  const theme = useTheme();

  if (!actor) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={{ uri: actor.imageUrl }} style={styles.actorImage} />
            
            <View style={styles.infoContainer}>
              <ThemedText style={[styles.actorName, { color: theme.title }]}>
                {actor.name} {actor.surname}
              </ThemedText>
              
              {actor.character && (
                <ThemedText style={[styles.character, { color: theme.primary }]}>
                  Character: {actor.character}
                </ThemedText>
              )}
              
              {actor.popularity && (
                <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
                  🌟 Popularity: {Math.round(actor.popularity)}
                </ThemedText>
              )}
              
              {actor.birthday && (
                <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
                  🎂 Born: {actor.birthday}
                </ThemedText>
              )}
              
              {actor.placeOfBirth && (
                <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
                  📍 Born in: {actor.placeOfBirth}
                </ThemedText>
              )}
              
              {actor.biography && (
                <>
                  <ThemedText style={[styles.bioTitle, { color: theme.title }]}>
                    Biography
                  </ThemedText>
                  <ThemedText style={[styles.bioText, { color: theme.text }]}>
                    {actor.biography}
                  </ThemedText>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 8,
  },
  actorImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginTop: 20,
  },
  infoContainer: {
    padding: 16,
  },
  actorName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  character: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 8,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
});