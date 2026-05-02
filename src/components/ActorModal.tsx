// ActorModal.tsx
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const { t } = useTranslation();

  if (!actor) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}> 
        <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}> 
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.modalBackground }]}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={26} color={theme.text} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <Image
              source={{ uri: actor.imageUrl }}
              style={styles.actorImage}
              resizeMode="cover"
            />

            <View style={styles.infoContainer}>
              <ThemedText style={[styles.actorName, { color: theme.title }]}> 
                {actor.name} {actor.surname}
              </ThemedText>

              {actor.character && (
                <ThemedText style={[styles.character, { color: theme.primary }]}> 
                  {t('actor.character')}: {actor.character}
                </ThemedText>
              )}

              <View style={styles.detailsContainer}>
                {actor.popularity !== undefined && actor.popularity !== null && (
                  <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}> 
                    🌟 {t('actor.popularity')}: {Math.round(actor.popularity)}
                  </ThemedText>
                )}

                {actor.birthday && (
                  <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}> 
                    🎂 {t('actor.born')}: {actor.birthday}
                  </ThemedText>
                )}

                {actor.placeOfBirth && (
                  <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}> 
                    📍 {t('actor.bornIn')}: {actor.placeOfBirth}
                  </ThemedText>
                )}
              </View>

              {actor.biography && (
                <View style={styles.biographyContainer}>
                  <ThemedText style={[styles.bioTitle, { color: theme.title }]}> 
                    {t('actor.biography')}
                  </ThemedText>
                  <ThemedText style={[styles.bioText, { color: theme.text }]}> 
                    {actor.biography}
                  </ThemedText>
                </View>
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
    paddingHorizontal: Platform.OS === 'web' ? 24 : 14,
    paddingVertical: Platform.OS === 'web' ? 24 : 18,
  },
  modalContent: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : 520,
    maxHeight: Platform.OS === 'web' ? '86%' : '88%',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  scrollContent: {
    padding: Platform.OS === 'web' ? 24 : 20,
    paddingBottom: Platform.OS === 'web' ? 28 : 36,
  },
  actorImage: {
    width: '100%',
    height: Platform.OS === 'web' ? 340 : 420,
    maxHeight: Platform.OS === 'web' ? 340 : 420,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  infoContainer: {
    paddingTop: 18,
  },
  actorName: {
    fontSize: Platform.OS === 'web' ? 26 : 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  character: {
    fontSize: Platform.OS === 'web' ? 16 : 20,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  detailsContainer: {
    marginTop: 4,
    marginBottom: 12,
    gap: Platform.OS === 'web' ? 6 : 10,
  },
  detailText: {
    fontSize: Platform.OS === 'web' ? 14 : 18,
    lineHeight: Platform.OS === 'web' ? 22 : 28,
  },
  biographyContainer: {
    marginTop: 16,
  },
  bioTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bioText: {
    fontSize: Platform.OS === 'web' ? 15 : 18,
    lineHeight: Platform.OS === 'web' ? 24 : 30,
  },
});
