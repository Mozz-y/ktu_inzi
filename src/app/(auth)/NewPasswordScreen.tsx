// app/(auth)/NewPasswordScreen.tsx
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from '@/lib/supabase';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [canChangePassword, setCanChangePassword] = useState(false);
  
  const { t } = useTranslation();
  const colors = useTheme();
  
  // Naudojame useRef kad išvengtume infinite loop
  const hasChecked = useRef(false);

  useEffect(() => {
    // Jei jau patikrinome, nevykdome vėl
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    const handlePasswordReset = async () => {
      try {
        // TESTAVIMO REŽIMAS - development metu praleidžiame patikrinimą
        if (__DEV__) {
          console.log('🧪 Test mode: skipping session check');
          setCanChangePassword(true);
          setInitialLoading(false);
          return;
        }
        
        // Patikriname ar vartotojas turi sesiją
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Jau prisijungęs vartotojas
          setCanChangePassword(true);
          setInitialLoading(false);
          return;
        }
        
        // Klausome ar ateina PASSWORD_RECOVERY eventas
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
          console.log('Auth event:', event);
          if (event === 'PASSWORD_RECOVERY') {
            setCanChangePassword(true);
            setInitialLoading(false);
          }
        });
        
        // Timeout apsaugai
        const timeout = setTimeout(() => {
          if (!canChangePassword && initialLoading) {
            setInitialLoading(false);
            Alert.alert(
              'Klaida',
              'Netinkama arba pasibaigusi nuoroda. Prašome užsisakyti naują.',
              [{ text: 'OK', onPress: () => router.replace('/(auth)/ForgotPassword') }]
            );
          }
        }, 5000);
        
        return () => {
          listener?.subscription.unsubscribe();
          clearTimeout(timeout);
        };
        
      } catch (error) {
        console.error(error);
        setInitialLoading(false);
        Alert.alert('Klaida', 'Įvyko klaida. Bandykite dar kartą.');
      }
    };
    
    handlePasswordReset();
  }, []); // Tuščias priklausomybių masyvas - vykdoma tik 1 kartą

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Klaida', 'Užpildykite visus laukus');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Klaida', 'Slaptažodžiai nesutampa');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Klaida', 'Slaptažodis turi būti bent 6 simbolių');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        Alert.alert('Klaida', error.message);
      } else {
        Alert.alert(
          'Sėkmė!',
          'Slaptažodis sėkmingai pakeistas. Dabar galite prisijungti.',
          [
            {
              text: 'Prisijungti',
              onPress: () => router.replace('/(auth)/Login')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Klaida', 'Įvyko nenumatyta klaida');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundElement }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!canChangePassword) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.background, { backgroundColor: colors.backgroundElement }]}>
      <Tabs.Screen options={{ href: null, headerShown: false }} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <View style={[styles.header, { marginBottom: Spacing.five }]}>
                <TouchableOpacity 
                  style={styles.backArrow} 
                  onPress={() => router.back()}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.title, { color: colors.title }]}>
                  Naujas slaptažodis
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Sukurkite naują slaptažodį
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                  <Text style={[styles.label, { color: colors.title }]}>
                    Naujas slaptažodis
                  </Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textSecondary}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNew}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNew(!showNew)}>
                      <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.inputContainer, { marginBottom: Spacing.four }]}>
                  <Text style={[styles.label, { color: colors.title }]}>
                    Pakartokite slaptažodį
                  </Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textSecondary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirm}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
                      <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} 
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                    {loading ? 'Keičiama...' : 'Keisti slaptažodį'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center',
    paddingVertical: 40,
    paddingBottom: 80 
  },
  container: { 
    paddingHorizontal: 20, 
    maxWidth: MaxContentWidth, 
    width: '100%', 
    alignSelf: 'center' 
  },
  header: { 
    alignItems: 'center', 
    position: 'relative', 
    width: '100%',
    marginBottom: 20
  },
  backArrow: { 
    position: 'absolute', 
    left: 0, 
    top: 4, 
    zIndex: 10 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 14,
    textAlign: 'center'
  },
  card: { 
    borderRadius: 14, 
    padding: 18, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 2 
  },
  inputContainer: {},
  label: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 6 
  },
  input: { 
    height: 42, 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    fontSize: 14,
    paddingRight: 40
  },
  passwordWrapper: { 
    justifyContent: 'center' 
  },
  eyeIcon: { 
    position: 'absolute', 
    right: 12, 
    height: '100%', 
    justifyContent: 'center' 
  },
  button: { 
    width: '100%', 
    height: 42, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 8 
  },
  buttonText: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
});