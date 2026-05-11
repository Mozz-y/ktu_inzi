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
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const { t } = useTranslation();
  const colors = useTheme();

  const handleSubmit = () => {
    if (!email) return;
    console.log("Forgot password užklausa:", { email });
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={[styles.background, { backgroundColor: colors.backgroundElement }]}>
      {/* Paslepiame iš meniu juostos */}
      <Tabs.Screen options={{ href: null, headerShown: false }} />

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
            {submitted ? t('forgot_password.success_title') : t('forgot_password.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {submitted ? "" : t('forgot_password.subtitle')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {!submitted ? (
            <View>
              <View style={[styles.inputContainer, { marginBottom: Spacing.four }]}>
                <Text style={[styles.label, { color: colors.title }]}>
                  {t('forgot_password.email_label')}
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
                  placeholder={t('forgot_password.email_placeholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary }]} 
                onPress={handleSubmit}
              >
                <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                  {t('forgot_password.send_button')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                {t('forgot_password.success_message')}
                <Text style={{ color: colors.text, fontWeight: '700' }}>{email}</Text>
                {t('forgot_password.success_instruction')}
              </Text>
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary, marginTop: Spacing.three }]} 
                onPress={() => router.replace('./Login')}
              >
                <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                  {t('forgot_password.back_to_login')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.footer, { marginTop: Spacing.four }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('forgot_password.remember_password')}
          </Text>
          <TouchableOpacity onPress={() => router.replace('./Login')}>
            <Text style={[styles.linkTextBold, { color: colors.primary }]}>
              {t('forgot_password.sign_in')}
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
  header: { alignItems: 'center', position: 'relative', width: '100%' },
  backArrow: { position: 'absolute', left: 0, top: 4, zIndex: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16 },
  card: { borderRadius: 14, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputContainer: {},
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  input: { height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  button: { width: '100%', height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: 'bold' },
  successContainer: { alignItems: 'center' },
  successText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 14 },
  linkTextBold: { fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
});