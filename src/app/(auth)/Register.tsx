import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Biblioteka galerijai
import { router, Tabs } from 'expo-router';
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const movieCategories = [
  "Action", "Comedy", "Drama", "Horror", 
  "Sci-Fi", "Romance", "Thriller", "Documentary",
];

export default function RegisterScreen() {
  // Būsenos
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // React Native nuotraukas saugo kaip URL (kelią telefone), o ne File objektą
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Slaptažodžių matomumo būsenos
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const colors = useTheme();

  // Funkcija kategorijų žymėjimui
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Telefono galerijos atidarymo funkcija
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Padaro, kad leistų apkirpti nuotrauką kvadratu
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleNextStep = () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('register.error'), t('register.fill_all_fields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('register.error'), t('register.passwords_not_match'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            description,
            selected_categories: selectedCategories,
          }
        }
      });

      if (error) {
        Alert.alert(t('register.error'), error.message);
      } else {
        Alert.alert(t('register.success'), t('register.check_email'));
        router.replace('./Login');
      }
    } catch (error) {
      Alert.alert(t('register.error'), t('register.unexpected_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.background, { backgroundColor: colors.backgroundElement }]}>
      {/* KeyboardAvoidingView neleidžia klaviatūrai paslėpti laukelių */}
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
        <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' }, href: null }} />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            
            <View style={[styles.header, { marginBottom: Spacing.five }]}>
            {/* Rodyklė atgal, kuri atsiranda tik 2-ame žingsnyje */}
            {step === 2 && (
                <TouchableOpacity 
                style={styles.backArrow} 
                onPress={() => setStep(1)}
                // hitSlop nematoma padidina paspaudimo plotą, kad būtų lengviau pataikyti pirštu
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} 
                >
                <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
            )}

            <Text style={[styles.title, { color: colors.title }]}>
                {t('register.create_account')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {step === 1 ? t('register.step_1') : t('register.step_2')}
            </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              
              {/* === ŽINGSNIS 1: Prisijungimo duomenys === */}
              {step === 1 ? (
                <View>
                  <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                    <Text style={[styles.label, { color: colors.title }]}>{t('register.email_label')}</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder={t('register.email_placeholder')}
                      placeholderTextColor={colors.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                    <Text style={[styles.label, { color: colors.title }]}>{t('register.password_label')}</Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text, paddingRight: 40 }]}
                        placeholder={t('register.password_placeholder')}
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { marginBottom: Spacing.four }]}>
                    <Text style={[styles.label, { color: colors.title }]}>{t('register.confirm_password_label')}</Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text, paddingRight: 40 }]}
                        placeholder={t('register.password_placeholder')}
                        placeholderTextColor={colors.textSecondary}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleNextStep}>
                    <Text style={[styles.buttonText, { color: colors.primaryText }]}>{t('register.next_button')}</Text>
                  </TouchableOpacity>
                </View>

              ) : (

                /* === ŽINGSNIS 2: Profilio informacija === */
                <View>
                  {/* Nuotraukos įkėlimas */}
                  <View style={styles.avatarSection}>
                    <TouchableOpacity 
                      onPress={pickImage}
                      style={[styles.avatarCircle, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
                    >
                      {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                      ) : (
                        <Ionicons name="camera" size={32} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage} style={[styles.avatarButton, { borderColor: colors.inputBorder }]}>
                      <Text style={{ color: colors.text, fontSize: 14 }}>
                        {profileImage ? t('register.change_photo') : t('register.add_photo')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                    <Text style={[styles.label, { color: colors.title }]}>{t('register.username_label')}</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder={t('register.username_placeholder')}
                      placeholderTextColor={colors.textSecondary}
                      value={username}
                      onChangeText={setUsername}
                    />
                  </View>

                  {/* Bio laukelis (Textarea) */}
                  <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                    <Text style={[styles.label, { color: colors.title }]}>{t('register.bio_label')}</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder={t('register.bio_placeholder')}
                      placeholderTextColor={colors.textSecondary}
                      value={description}
                      onChangeText={setDescription}
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Žymimieji laukeliai (Checkboxes) kategorijoms */}
                  <View style={[styles.inputContainer, { marginBottom: Spacing.four }]}>
                    <Text style={[styles.label, { color: colors.title, marginBottom: Spacing.two }]}>{t('register.categories_label')}</Text>
                    <View style={styles.categoriesContainer}>
                      {movieCategories.map((category) => {
                        const isSelected = selectedCategories.includes(category);
                        return (
                          <TouchableOpacity 
                            key={category} 
                            style={styles.checkboxRow}
                            onPress={() => handleCategoryToggle(category)}
                            activeOpacity={0.7}
                          >
                            <View style={[
                              styles.checkbox, 
                              { 
                                borderColor: isSelected ? colors.primary : colors.inputBorder,
                                backgroundColor: isSelected ? colors.primary : 'transparent'
                              }
                            ]}>
                              {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                            </View>
                            <Text style={[styles.checkboxLabel, { color: colors.text }]}>{category}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Button Create) */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: colors.primary, marginTop: Spacing.three }]} 
                        onPress={handleSubmit}
                        disabled={loading}
                        >
                        <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                            {loading ? t('register.creating_account') : t('register.submit_button')}
                        </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={[styles.footer, { marginTop: Spacing.four }]}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {t('register.already_have_account')} 
              </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.linkTextBold, { color: colors.primary }]}>
                  {t('register.sign_in')}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Stiliai, atsakingi tik už formą ir struktūrą
const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40, paddingBottom: 80 },
  container: { paddingHorizontal: 20, 
  maxWidth: MaxContentWidth, 
  width: '100%', 
  alignSelf: 'center'  },
  header: { alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' },
  backArrow: { position: 'absolute', left: 0, top: 0, zIndex: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  card: { borderRadius: 14, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputContainer: {},
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  input: { height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  
  // Slaptažodžio akytė
  passwordWrapper: { justifyContent: 'center' },
  eyeIcon: { position: 'absolute', right: 12, height: '100%', justifyContent: 'center' },
  
  // Profilio nuotraukos stiliai
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 10 },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarButton: { borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  
  // Textarea (Bio) stilius
  textArea: { minHeight: 80, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingTop: 12, fontSize: 14 },
  
  // Checkbox (Kategorijos) stiliai
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  checkboxLabel: { fontSize: 14 },

  // Mygtukų stiliai
  button: { width: '100%', height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 12 },
  halfButton: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 14, fontWeight: 'bold' },
  
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 14 },
  linkTextBold: { fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
});