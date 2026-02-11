import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { profileService } from '@/services/api/profileService';
import { formatPhoneNumber } from '@/utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInfo'>;

// Configuration du statut KYC
const getKycConfig = (status?: string) => {
  switch (status) {
    case 'verified':
      return { 
        text: 'Vérifié', 
        color: COLORS.success, 
        bgColor: COLORS.soft.success,
        icon: 'checkmark-circle' as const
      };
    case 'pending':
      return { 
        text: 'En cours', 
        color: COLORS.warning, 
        bgColor: COLORS.soft.warning,
        icon: 'time-outline' as const
      };
    case 'rejected':
      return { 
        text: 'Rejeté', 
        color: COLORS.error, 
        bgColor: COLORS.soft.error,
        icon: 'close-circle' as const
      };
    default:
      return { 
        text: 'Non vérifié', 
        color: COLORS.text.secondary, 
        bgColor: COLORS.neutral[100],
        icon: 'shield-outline' as const
      };
  }
};

// Composant Input personnalisé
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
}) => (
  <View style={inputStyles.container}>
    <Text style={inputStyles.label}>{label}</Text>
    <View style={[inputStyles.inputWrapper, !editable && inputStyles.inputDisabled]}>
      <Icon name={icon as any} size={16} color={COLORS.text.secondary} />
      <TextInput
        style={inputStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.neutral[400]}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
  </View>
);

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
  },
  inputDisabled: {
    backgroundColor: COLORS.neutral[100],
  },
});

const PersonalInfoScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [postalCode, setPostalCode] = useState(user?.postal_code ?? '');
  const [state, setState] = useState(user?.state ?? '');

  const [saving, setSaving] = useState(false);

  const phone = user?.phone_number ?? '';
  const countryCode = user?.country_code ?? '+212';

  const initials = useMemo(() => {
    const a = (firstName?.[0] ?? '').toUpperCase();
    const b = (lastName?.[0] ?? '').toUpperCase();
    return (a + b) || 'U';
  }, [firstName, lastName]);

  const kyc = getKycConfig(user?.kyc_status);

  // Vérifier si des modifications ont été faites
  const hasChanges = useMemo(() => {
    return (
      firstName.trim() !== (user?.first_name ?? '') ||
      lastName.trim() !== (user?.last_name ?? '') ||
      email.trim() !== (user?.email ?? '') ||
      city.trim() !== (user?.city ?? '') ||
      postalCode.trim() !== (user?.postal_code ?? '') ||
      state.trim() !== (user?.state ?? '')
    );
  }, [firstName, lastName, email, city, postalCode, state, user]);

  const goToKyc = () => navigation.navigate('KYCFlow', { screen: 'KycDocument' });

  const onSave = async () => {
    if (!hasChanges) {
      Alert.alert('Info', 'Aucune modification détectée.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {};

      if (firstName.trim() !== (user?.first_name ?? '')) payload.first_name = firstName.trim();
      if (lastName.trim() !== (user?.last_name ?? '')) payload.last_name = lastName.trim();
      if (email.trim() !== (user?.email ?? '')) payload.email = email.trim();
      if (city.trim() !== (user?.city ?? '')) payload.city = city.trim();
      if (postalCode.trim() !== (user?.postal_code ?? '')) payload.postal_code = postalCode.trim();
      if (state.trim() !== (user?.state ?? '')) payload.state = state.trim();

      const res = await profileService.updateProfile(payload as any);

      if (res.profile) {
        await updateUser(res.profile as any);
      }

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      navigation.goBack();
    } catch (error: any) {
      const msg =
        error?.response?.data?.details?.email?.[0] ??
        error?.response?.data?.error ??
        error?.response?.data?.message ??
        'Impossible de sauvegarder. Vérifiez votre connexion.';
      Alert.alert('Erreur', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padding={false} scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informations personnelles</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Carte de profil */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.7}>
                <Icon name="camera-outline" size={16} color={COLORS.text.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {firstName || 'Utilisateur'} {lastName || ''}
              </Text>
              <Text style={styles.profilePhone}>
                {phone ? formatPhoneNumber(phone, countryCode) : 'Téléphone non renseigné'}
              </Text>
              
              <View style={[styles.kycBadge, { backgroundColor: kyc.bgColor }]}>
                <Icon name={kyc.icon} size={14} color={kyc.color} />
                <Text style={[styles.kycText, { color: kyc.color }]}>{kyc.text}</Text>
              </View>
            </View>
          </View>

          {/* Bouton KYC si non vérifié */}
          {user?.kyc_status !== 'verified' && user?.kyc_status !== 'pending' && (
            <TouchableOpacity 
              style={styles.kycButton}
              onPress={goToKyc}
              activeOpacity={0.7}
            >
              <View style={styles.kycButtonIcon}>
                <Icon name="shield-checkmark-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.kycButtonContent}>
                <Text style={styles.kycButtonTitle}>Vérifier mon identité</Text>
                <Text style={styles.kycButtonDesc}>Débloquez toutes les fonctionnalités</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.neutral[400]} />
            </TouchableOpacity>
          )}

          {/* Section Profil */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Informations de base</Text>
            
            <View style={styles.formCard}>
              <InputField
                label="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Votre prénom"
                icon="person-outline"
                autoCapitalize="words"
              />
              
              <InputField
                label="Nom"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Votre nom"
                icon="person-outline"
                autoCapitalize="words"
              />
              
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="exemple@email.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Section Adresse */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Adresse</Text>
            
            <View style={styles.formCard}>
              <InputField
                label="Ville"
                value={city}
                onChangeText={setCity}
                placeholder="Ex: Casablanca"
                icon="location-outline"
                autoCapitalize="words"
              />
              
              <InputField
                label="Code postal"
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="Ex: 20000"
                icon="map-outline"
                keyboardType="number-pad"
              />
              
              <InputField
                label="Région / Province"
                value={state}
                onChangeText={setState}
                placeholder="Ex: Grand Casablanca"
                icon="business-outline"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Section téléphone (lecture seule) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Numéro de téléphone</Text>
            
            <View style={styles.phoneInfoCard}>
              <View style={styles.phoneIconContainer}>
                <Icon name="call-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.phoneInfo}>
                <Text style={styles.phoneNumber}>
                  {phone ? formatPhoneNumber(phone, countryCode) : 'Non renseigné'}
                </Text>
                <Text style={styles.phoneHint}>
                  Le numéro ne peut pas être modifié
                </Text>
              </View>
              <Icon name="lock-closed-outline" size={18} color={COLORS.neutral[400]} />
            </View>
          </View>
        </View>

        {/* Footer avec bouton de sauvegarde */}
        <View style={styles.footer}>
          <Button
            title={saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            onPress={onSave}
            fullWidth
            size="large"
            disabled={saving || !hasChanges}
          />
          
          {hasChanges && (
            <Text style={styles.changesHint}>
              Des modifications non sauvegardées sont en attente
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.md,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.text.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  kycText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // KYC Button
  kycButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.soft.primary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginBottom: SPACING.md,
  },
  kycButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kycButtonContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  kycButtonTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  kycButtonDesc: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginTop: 1,
  },

  // Sections
  section: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowInputs: {
    flexDirection: 'row',
  },

  // Phone Info
  phoneInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phoneIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  phoneNumber: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  phoneHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  // Footer
  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  changesHint: {
    fontSize: 10,
    color: COLORS.warning,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default PersonalInfoScreen;
