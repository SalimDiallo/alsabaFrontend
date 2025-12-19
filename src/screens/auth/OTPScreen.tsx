// 3. src/screens/auth/OTPScreen.tsx
// ==========================================
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { formatPhoneNumber } from '@/utils/formatters';
import { validateOTP } from '@/utils/validators';
import { authService } from '@/services/api/authService';
import { useAuthStore } from '@/store/useAuthStore';

type OTPScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
};

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { phoneNumber, countryCode } = route.params;
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(APP_CONFIG.OTP_RESEND_DELAY);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer pour le renvoi de l'OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quand tous les champs sont remplis
    if (index === 5 && value && newOtp.every((digit) => digit)) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpValue = otpCode || otp.join('');

    if (!validateOTP(otpValue)) {
      Alert.alert('Erreur', 'Code OTP invalide');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOTP({
        phoneNumber,
        countryCode,
        otp: otpValue,
      });

      // Sauvegarder l'authentification
      await setAuth(response.user, response.token);

      // La navigation sera gérée automatiquement par AppNavigator
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Code OTP invalide');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      await authService.resendOTP(phoneNumber, countryCode);
      setResendTimer(APP_CONFIG.OTP_RESEND_DELAY);
      Alert.alert('Succès', 'Un nouveau code a été envoyé');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de renvoyer le code');
    }
  };

  return (
    <Screen keyboardAvoiding>
      <View style={styles.container}>
        {/* En-tête */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Nous avons envoyé un code à 6 chiffres au{'\n'}
            <Text style={styles.phone}>
              {formatPhoneNumber(phoneNumber, countryCode)}
            </Text>
          </Text>
        </View>

        {/* Champs OTP */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Bouton de vérification */}
        <Button
          title="Vérifier"
          onPress={() => handleVerifyOTP()}
          loading={isLoading}
          disabled={otp.some((digit) => !digit)}
          fullWidth
          size="large"
          style={styles.button}
        />

        {/* Renvoyer le code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Vous n'avez pas reçu le code ? </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={resendTimer > 0}
          >
            <Text
              style={[
                styles.resendLink,
                resendTimer > 0 && styles.resendLinkDisabled,
              ]}
            >
              {resendTimer > 0
                ? `Renvoyer (${resendTimer}s)`
                : 'Renvoyer le code'}
            </Text>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.text.primary,
  },
  header: {
    marginBottom: SPACING.xxl,
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
  phone: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  otpInput: {
    width: 50,
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  button: {
    marginBottom: SPACING.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },
  resendLink: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  resendLinkDisabled: {
    color: COLORS.text.disabled,
  },
});

export default OTPScreen;
