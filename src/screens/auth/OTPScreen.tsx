import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Vibration,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '@/types/navigation.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { authService } from '@/services/api/authService';
import { useAuthStore } from '@/store/useAuthStore';

type OTPScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
};

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { phoneNumber, countryCode, fullPhoneNumber, sessionKey, expiresIn } = route.params;
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(APP_CONFIG.OTP_RESEND_DELAY);
  const [currentSessionKey, setCurrentSessionKey] = useState(sessionKey);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer pour le renvoi de l'OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus sur le premier input au montage
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

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
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('');

    if (code.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 6 chiffres');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOTP({
        phone_number: fullPhoneNumber,
        code,
        session_key: currentSessionKey,
      });

      // Vibration de succès
      Vibration.vibrate(100);

      // Sauvegarder l'authentification
      await setAuth(
        response.user,
        response.auth.access_token,
        response.auth.refresh_token
      );

      // La navigation sera gérée automatiquement par AppNavigator
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);

      // Vibration d'erreur
      Vibration.vibrate([0, 50, 50, 50]);

      let errorMessage = 'Code incorrect';
      let remaining = remainingAttempts - 1;

      if (error.response) {
        const data = error.response.data;
        errorMessage = data?.error || data?.message || 'Code incorrect';
        remaining = data?.remaining_attempts ?? remaining;
      } else if (error.request) {
        errorMessage = 'Impossible de vérifier le code. Vérifiez votre connexion.';
      }

      setRemainingAttempts(remaining);

      if (remaining <= 0) {
        Alert.alert(
          'Trop de tentatives',
          'Veuillez demander un nouveau code',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Erreur',
          `${errorMessage}\nIl vous reste ${remaining} tentative${remaining > 1 ? 's' : ''}`
        );
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      const response = await authService.resendOTP(phoneNumber, countryCode);
      setCurrentSessionKey(response.session_key);
      setResendTimer(APP_CONFIG.OTP_RESEND_DELAY);
      setRemainingAttempts(3);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('Succès', 'Un nouveau code a été envoyé');
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error);

      let errorMessage = 'Impossible de renvoyer le code';
      if (error.response) {
        const data = error.response.data;
        errorMessage = data?.error || data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Pas de connexion au serveur';
      }

      Alert.alert('Erreur', errorMessage);
    }
  };

  const maskedPhone = `${countryCode} ${phoneNumber.slice(0, 2)}•••••${phoneNumber.slice(-2)}`;
  const isComplete = otp.every((digit) => digit);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Entrez le code à 6 chiffres envoyé au
          </Text>
          <Text style={styles.phone}>{maskedPhone}</Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  isLoading && styles.otpInputDisabled,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isLoading}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!isComplete || isLoading) && styles.buttonDisabled,
            ]}
            onPress={() => handleVerifyOTP()}
            disabled={!isComplete || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Vérification...' : 'Vérifier'}
            </Text>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Pas reçu ? </Text>
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
                  ? `Renvoyer dans ${resendTimer}s`
                  : 'Renvoyer le code'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Attempts indicator */}
          {remainingAttempts < 3 && (
            <Text style={styles.attemptsText}>
              {remainingAttempts} tentative{remainingAttempts > 1 ? 's' : ''} restante{remainingAttempts > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#1A1A1A',
  },
  main: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  phone: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 15,
    color: '#666',
  },
  resendLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#999',
  },
  attemptsText: {
    fontSize: 13,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default OTPScreen;
