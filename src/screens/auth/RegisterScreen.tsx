import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { validatePhoneNumber } from '@/utils/validators';
import { authService } from '@/services/api/authService';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState('+212');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (!validatePhoneNumber(phoneNumber, countryCode)) {
      Alert.alert('Erreur', 'Numéro de téléphone invalide');
      return;
    }

    setIsLoading(true);
    try {
      // Appel API pour l'inscription
      const response = await authService.register({
        phone_number: phoneNumber,
        country_code: countryCode,
      });

      // Navigation vers l'écran OTP avec les données du backend
      navigation.navigate('OTPVerification', {
        phoneNumber,
        countryCode,
        fullPhoneNumber: response.phone_number,
        sessionKey: response.session_key,
        expiresIn: response.expires_in,
      });
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scrollable keyboardAvoiding>
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez ALSAX pour échanger facilement
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Sélecteur de pays */}
          <View style={styles.countrySelector}>
            <TouchableOpacity
              style={[
                styles.countryButton,
                countryCode === '+212' && styles.countryButtonActive,
              ]}
              onPress={() => setCountryCode('+212')}
            >
              <Text style={styles.flag}>🇲🇦</Text>
              <Text
                style={[
                  styles.countryText,
                  countryCode === '+212' && styles.countryTextActive,
                ]}
              >
                Maroc
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.countryButton,
                countryCode === '+224' && styles.countryButtonActive,
              ]}
              onPress={() => setCountryCode('+224')}
            >
              <Text style={styles.flag}>🇬🇳</Text>
              <Text
                style={[
                  styles.countryText,
                  countryCode === '+224' && styles.countryTextActive,
                ]}
              >
                Guinée
              </Text>
            </TouchableOpacity>
          </View>

          {/* Prénom (optionnel) */}
          <Input
            label="Prénom"
            placeholder="Votre prénom"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          {/* Nom (optionnel) */}
          <Input
            label="Nom"
            placeholder="Votre nom"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />

          {/* Numéro de téléphone */}
          <Text style={styles.label}>
            Numéro de téléphone <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
            </View>
            <Input
              placeholder="6XX XX XX XX"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={12}
              style={styles.phoneInput}
            />
          </View>

          {/* Bouton d'inscription */}
          <Button
            title="S'inscrire"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            size="large"
            style={styles.button}
          />

          {/* Note */}
          <Text style={styles.note}>
            En vous inscrivant, vous acceptez nos conditions d'utilisation et
            notre politique de confidentialité.
          </Text>
        </View>

        {/* Lien vers connexion */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous avez déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.text.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  countrySelector: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  countryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  countryButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  flag: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  countryText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  countryTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  countryCodeBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countryCodeText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  phoneInput: {
    flex: 1,
  },
  button: {
    marginTop: SPACING.md,
  },
  note: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: SPACING.lg,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },
  link: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default RegisterScreen;