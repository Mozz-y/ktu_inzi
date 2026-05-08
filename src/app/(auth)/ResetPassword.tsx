import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
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

export default function ResetPasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Nauja būsena
  const [submitted, setSubmitted] = useState(false);
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Nauja būsena akytei

  const { t } = useTranslation();
  const colors = useTheme();

  const handleSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) return;

    // Patikriname, ar nauji slaptažodžiai sutampa
    if (newPassword !== confirmPassword) {
      Alert.alert(
        t('reset_password.error_title') || "Error", 
        t('register.passwords_dont_match') || "Passwords do not match"
      );
      return;
    }

    console.log("Slaptažodis keičiamas sėkmingai");
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={[styles.background, { backgroundColor: colors.backgroundElement }]}>
      <Tabs.Screen options={{ href: null, headerShown: false }} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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
                {submitted ? t('reset_password.success_title') : t('reset_password.title')}
              </Text>
              {!submitted && (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {t('reset_password.subtitle')}
                </Text>
              )}
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {!submitted ? (
                <View>
                  {/* Dabartinis slaptažodis */}
                  <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                    <Text style={[styles.label, { color: colors.title }]}>
                      {t('reset_password.old_password_label')}
                    </Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text, paddingRight: 40 }]}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textSecondary}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry={!showOld}
                      />
                      <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowOld(!showOld)}>
                        <Ionicons name={showOld ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Naujas slaptažodis */}
                  <View style={[styles.inputContainer, { marginBottom: Spacing.three }]}>
                    <Text style={[styles.label, { color: colors.title }]}>
                      {t('reset_password.new_password_label')}
                    </Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text, paddingRight: 40 }]}
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

                  {/* Pakartoti naują slaptažodį */}
                  <View style={[styles.inputContainer, { marginBottom: Spacing.four }]}>
                    <Text style={[styles.label, { color: colors.title }]}>
                      {t('register.confirm_password_label') /* Naudojame tą patį vertimą kaip registracijoje */}
                    </Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text, paddingRight: 40 }]}
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
                    style={[styles.button, { backgroundColor: colors.primary }]} 
                    onPress={handleSubmit}
                  >
                    <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                      {t('reset_password.button')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={60} color={colors.success} style={{ marginBottom: 16 }} />
                  <Text style={[styles.successText, { color: colors.textSecondary }]}>
                    {t('reset_password.success_message')}
                  </Text>
                  
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: colors.primary, marginTop: Spacing.three }]} 
                    onPress={() => router.replace('/Login')}
                  >
                    <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                      {t('reset_password.go_to_login')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  container: { paddingHorizontal: 20, maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center', paddingVertical: 20 },
  header: { alignItems: 'center', position: 'relative', width: '100%' },
  backArrow: { position: 'absolute', left: 0, top: 4, zIndex: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16 },
  card: { borderRadius: 14, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputContainer: {},
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  input: { height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  passwordWrapper: { justifyContent: 'center' },
  eyeIcon: { position: 'absolute', right: 12, height: '100%', justifyContent: 'center' },
  button: { width: '100%', height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: 'bold' },
  successContainer: { alignItems: 'center' },
  successText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});