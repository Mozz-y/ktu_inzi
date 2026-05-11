import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 2. Sukuriame būseną, kuri valdys slaptažodžio matomumą
  const [showPassword, setShowPassword] = useState(false);
  
  const { t } = useTranslation();

  const colors = useTheme();

  const handleSubmit = () => {
    console.log("Bandoma prisijungti su:", { email, password });
    router.replace('/Home');
  };

  return (
    <SafeAreaView style={[styles.background, { backgroundColor: colors.backgroundElement }]}>
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
            
            {/* 3. Slaptažodžio laukelį apgaubiame View elementu, kad galėtume ant jo uždėti ikonėlę */}
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                    paddingRight: 40 // Paliekame vietos akytei, kad tekstas ant jos neužliptų
                  }
                ]}
                placeholder={t('login.password_placeholder')}
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                // secureTextEntry reaguoja į mūsų būseną: jei showPassword yra true, jis tampa false (tekstas matomas)
                secureTextEntry={!showPassword} 
              />
              
              {/* 4. Mygtukas, kuris perjungia būseną ir pakeičia ikonėlę */}
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
          >
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>
              {t('login.sign_in_button')}
            </Text>
          </TouchableOpacity>

          {/* 5. Forgot password perkeltas po mygtuku */}
          <TouchableOpacity style={[styles.forgotPasswordContainer, { marginTop: Spacing.three }]}
            onPress={() => router.push('./ForgotPassword')}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center' },
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
});