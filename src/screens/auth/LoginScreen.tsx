import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { validatePhoneNumber } from '@/utils/validators';
import { authService } from '@/services/api/authService';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState('+212');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCountrySwitch = () => {
    setCountryCode(countryCode === '+212' ? '+224' : '+212');
  };

  const handleLogin = async () => {
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
      // Appel API pour envoyer l'OTP
      await authService.login({
        phoneNumber,
        countryCode,
      });

      // Navigation vers l'écran OTP
      navigation.navigate('OTPVerification', {
        phoneNumber,
        countryCode,
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>ALSAX</Text>
          </View>
          <Text style={styles.tagline}>Échange P2P MAD ⇄ GNF</Text>
        </View>

        {/* Titre */}
        <View style={styles.header}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Entrez votre numéro pour recevoir un code de vérification
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

          {/* Numéro de téléphone */}
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

          {/* Bouton de connexion */}
          <Button
            title="Continuer"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="large"
            style={styles.button}
          />
        </View>

        {/* Lien vers inscription */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous n'avez pas de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  header: {
    marginBottom: SPACING.xl,
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

export default LoginScreen;
