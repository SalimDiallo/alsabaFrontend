import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPhoneNumber } from '@/utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInfo'>;

const kycLabel = (status?: string) => {
  if (status === 'approved') return { text: 'Identité vérifiée', color: COLORS.success };
  if (status === 'pending') return { text: 'Vérification en cours', color: COLORS.warning };
  if (status === 'rejected') return { text: 'Vérification rejetée', color: COLORS.error };
  return { text: 'Non vérifié', color: COLORS.text.secondary };
};

const PersonalInfoScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  // ---- Champs existants
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  // ---- Nouveaux champs (mock)
  const [photoUri, setPhotoUri] = useState<string | null>((user as any)?.photoUri ?? null);
  const [address, setAddress] = useState<string>((user as any)?.address ?? '');
  const [city, setCity] = useState<string>((user as any)?.city ?? '');
  const [country, setCountry] = useState<string>((user as any)?.country ?? 'Maroc');

  // Date de naissance (format: YYYY-MM-DD)
  const [dob, setDob] = useState<string>((user as any)?.date_of_birth ?? '');

  const phone = user?.phone_number ?? '';
  const countryCode = user?.country_code ?? '+212';

  const initials = useMemo(() => {
    const a = (firstName?.[0] ?? '').toUpperCase();
    const b = (lastName?.[0] ?? '').toUpperCase();
    return (a + b) || 'U';
  }, [firstName, lastName]);

  const kyc = kycLabel(user?.kyc_status);

  const goToKyc = () => navigation.navigate('KYCFlow', { screen: 'KycDocument' });

  const mockPickPhoto = () => {
    Alert.alert('Photo de profil', 'Simulation : photo fictive', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Ajouter',
        onPress: () => {
          setPhotoUri('mock://profile-photo');
          Alert.alert('OK', 'Photo ajoutée (mock)');
        },
      },
    ]);
  };

  const validateDob = (value: string) => {
    if (!value) return true;
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (!ok) return false;
    const [y, m, d] = value.split('-').map((x) => parseInt(x, 10));
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    if (y < 1900 || y > new Date().getFullYear()) return false;
    return true;
  };

  const onSave = async () => {
    if (!validateDob(dob.trim())) {
      Alert.alert('Erreur', 'Date de naissance invalide. Format attendu : YYYY-MM-DD');
      return;
    }

    try {
      await updateUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        photoUri,
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        date_of_birth: dob.trim(),
      } as any);

      Alert.alert('Succès', 'Informations mises à jour (mock)');
      navigation.goBack();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Informations personnelles"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        <Card style={styles.topCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.nameLine}>
                {firstName || 'Utilisateur'} {lastName || ''}
              </Text>

              <Text style={styles.phoneLine}>
                {phone ? formatPhoneNumber(phone, countryCode) : 'Téléphone non renseigné'}
              </Text>

              <View style={[styles.kycBadge, { borderColor: kyc.color }]}>
                <Icon name="shield-checkmark-outline" size={16} color={kyc.color} />
                <Text style={[styles.kycText, { color: kyc.color }]}>{kyc.text}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.photoBtn} onPress={mockPickPhoto} activeOpacity={0.7}>
              <Icon name={photoUri ? 'checkmark-circle' : 'camera-outline'} size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {user?.kyc_status !== 'approved' && (
            <Button title="Vérifier mon identité" onPress={goToKyc} fullWidth style={{ marginTop: SPACING.md }} />
          )}
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Profil</Text>

          <Text style={styles.label}>Prénom</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Votre prénom" placeholderTextColor={COLORS.text.disabled} />

          <Text style={styles.label}>Nom</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Votre nom" placeholderTextColor={COLORS.text.disabled} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="ex: nom@gmail.com" placeholderTextColor={COLORS.text.disabled} keyboardType="email-address" autoCapitalize="none" />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Adresse</Text>

          <Text style={styles.label}>Adresse</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Rue, numéro, quartier…" placeholderTextColor={COLORS.text.disabled} />

          <Text style={styles.label}>Ville</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="ex: Casablanca" placeholderTextColor={COLORS.text.disabled} />

          <Text style={styles.label}>Pays</Text>
          <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="ex: Maroc" placeholderTextColor={COLORS.text.disabled} />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informations KYC</Text>

          <Text style={styles.label}>Date de naissance</Text>
          <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.text.disabled} />

          <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.8}>
            <Text style={styles.saveText}>Enregistrer</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.noteCard}>
          <Text style={styles.noteTitle}>Note</Text>
          <Text style={styles.noteText}>
            Champs en mode fictif. Plus tard : PATCH /api/accounts/profile/ et KYC via /api/accounts/kyc/verify/
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },

  topCard: { padding: SPACING.md, marginBottom: SPACING.md },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: { color: COLORS.text.white, fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold },

  nameLine: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  phoneLine: { color: COLORS.text.secondary, marginTop: 2 },

  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  kycText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium },

  photoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  formCard: { padding: SPACING.md, marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm, color: COLORS.text.primary },

  label: { color: COLORS.text.secondary, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text.primary,
  },

  saveBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  saveText: { color: COLORS.text.white, fontWeight: TYPOGRAPHY.weights.semibold },

  noteCard: { padding: SPACING.md },
  noteTitle: { fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xs, color: COLORS.text.primary },
  noteText: { color: COLORS.text.secondary, lineHeight: 20 },
});

export default PersonalInfoScreen;
