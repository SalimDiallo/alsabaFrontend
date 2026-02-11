import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { validatePhoneNumber } from '@/utils/validators';
import { authService } from '@/services/api/authService';

const COUNTRIES = [
  { code: '+212', name: 'Maroc', flag: '🇲🇦' },
  { code: '+224', name: 'Guinée', flag: '🇬🇳' },
];

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (!validatePhoneNumber(phoneNumber, selectedCountry.code)) {
      Alert.alert('Erreur', 'Numéro de téléphone invalide');
      return;
    }

    console.log('🔵 Login attempt:', {
      phone_number: phoneNumber,
      country_code: selectedCountry.code,
    });

    setIsLoading(true);
    try {
      const response = await authService.login({
        phone_number: phoneNumber,
        country_code: selectedCountry.code,
      });

      console.log('✅ Login success:', response);

      // Navigation avec les données du backend
      // Construire le numéro complet en format E.164
      const fullPhoneNumber = `${selectedCountry.code}${phoneNumber}`;

      navigation.navigate('OTPVerification', {
        phoneNumber,
        countryCode: selectedCountry.code,
        fullPhoneNumber,
        sessionKey: response.session_key,
        expiresIn: response.expires_in,
      });
    } catch (error: any) {
      console.error('❌ Login error:', error);

      let errorMessage = 'Une erreur est survenue';

      if (error.response) {
        // Erreur HTTP du backend
        const data = error.response.data;
        errorMessage = data?.error || data?.message || data?.detail || 'Erreur de connexion au serveur';
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      } else {
        errorMessage = error.message || 'Une erreur inconnue est survenue';
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = phoneNumber.length >= 8;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ALSAX</Text>
          <Text style={styles.tagline}>Échange MAD ⇄ GNF</Text>
        </View>

        {/* Main */}
        <View style={styles.main}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Entrez votre numéro de téléphone pour recevoir un code de vérification
          </Text>

          {/* Phone Input Row */}
          <View style={styles.phoneRow}>
            {/* Country Selector */}
            <TouchableOpacity 
              style={styles.countrySelector}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {/* Phone Number Input */}
            <TextInput
              style={styles.phoneInput}
              placeholder="6XX XX XX XX"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={12}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading || !isValid}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Chargement...' : 'Continuer'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Nouveau ? Entrez votre numéro pour créer un compte
          </Text>
        </View>

        {/* Country Picker Modal */}
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sélectionnez un pays</Text>
              
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryOption,
                    selectedCountry.code === country.code && styles.countryOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.optionFlag}>{country.flag}</Text>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>{country.name}</Text>
                    <Text style={styles.optionCode}>{country.code}</Text>
                  </View>
                  {selectedCountry.code === country.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
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
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  main: {
    flex: 1,
    paddingTop: 32,
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
    marginBottom: 32,
  },
  phoneRow: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#F0F0F0',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    gap: 6,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#666',
  },
  footerLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    padding: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  countryOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  optionFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  optionCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
