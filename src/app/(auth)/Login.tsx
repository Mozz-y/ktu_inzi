import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 2. Sukuriame būseną, kuri valdys slaptažodžio matomumą
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { t } = useTranslation();

  const colors = useTheme();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert(t('login.error'), t('login.fill_all_fields'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert(t('login.error'), error.message);
      } else {
        console.log("Prisijungta sėkmingai:", data.user);
        router.replace('/Home');
      }
    } catch (error) {
      Alert.alert(t('login.error'), t('login.unexpected_error'));
    } finally {
      setLoading(false);
    }
  };

return (
  <SafeAreaView style={[styles.background, { backgroundColor: colors.backgroundElement }]}>
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>

            <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' }, href: null }} />
            
            <View style={[styles.header, { marginBottom: Spacing.five }]}>
              <View style={styles.brandContainer}>
                <Ionicons name="film" size={55} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.brandName, { color: colors.primary }]}>BingeLog</Text>
              </View>
              <Text style={[styles.title, { color: colors.title }]}>
                {t('login.welcome_back')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('login.sign_in_subtitle')}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              
              <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                <Text style={[styles.label, { color: colors.title }]}>
                  {t('login.email_label')}
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      color: colors.text
                    }
                  ]}
                  placeholder={t('login.email_placeholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                <Text style={[styles.label, { color: colors.title }]}>
                  {t('login.password_label')}
                </Text>
                
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                        paddingRight: 40
                      }
                    ]}
                    placeholder={t('login.password_placeholder')}
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword} 
                  />
                  
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary }]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                  {loading ? t('login.signing_in') : t('login.sign_in_button')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.forgotPasswordContainer, { marginTop: Spacing.three }]}
                onPress={() => router.push('./ForgotPassword')}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                  {t('login.forgot_password')}
                </Text>
              </TouchableOpacity>

            </View>

            <View style={[styles.footer, { marginTop: Spacing.four }]}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {t('login.no_account')} 
              </Text>
              <TouchableOpacity onPress={() => router.push('./Register')}>
                <Text style={[styles.linkTextBold, { color: colors.primary }]}>
                  {t('login.create_account')}
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
  container: { width: '100%',
  maxWidth: MaxContentWidth,
  alignSelf: 'center',
  paddingHorizontal: 20, },
  header: { alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16 },
  card: { borderRadius: 14, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputContainer: {},
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  input: { height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  
  // NAUJI STILIAI SLAPTAŽODŽIO AKYTEI
  passwordWrapper: { justifyContent: 'center' },
  eyeIcon: { position: 'absolute', right: 12, height: '100%', justifyContent: 'center' },
  
  // PAKEISTAS "FORGOT PASSWORD" STILIUS
  forgotPasswordContainer: { alignItems: 'center' }, // Pakeista iš 'flex-end' į 'center'
  
  button: { height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14 },
  linkTextBold: { fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Tarpas iki "Welcome back"
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900', // Labai storas šriftas, kad atrodytų kaip logo
    letterSpacing: -1, // Suartiname raides modernesniam vaizdui
    //textTransform: 'uppercase', // Galima padaryti didžiosiomis raidėmis
  },
  keyboardAvoidingView: {
  flex: 1,
},
scrollContent: {
  flexGrow: 1,
  justifyContent: 'center',
  paddingVertical: 24,
},
});