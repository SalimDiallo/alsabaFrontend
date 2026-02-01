import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Divider } from '@/components/common/Divider';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

import { useProfileMock, KycDocumentType } from '@/store/useProfileMock';

const chipColor = (status: string) => {
  if (status === 'approved') return { bg: '#E8F5E9', fg: COLORS.success };
  if (status === 'pending') return { bg: '#FFF8E1', fg: '#B26A00' };
  if (status === 'rejected') return { bg: '#FDECEA', fg: COLORS.error };
  return { bg: COLORS.surface, fg: COLORS.text.secondary };
};

const prettyStatus = (status: string) => {
  if (status === 'approved') return 'Vérifié';
  if (status === 'pending') return 'En cours';
  if (status === 'rejected') return 'Refusé';
  return 'Non vérifié';
};

const PersonalInfoScreen = () => {
  const profile = useProfileMock((s) => s.profile);
  const updateProfile = useProfileMock((s) => s.updateProfile);
  const setAvatar = useProfileMock((s) => s.setAvatar);
  const submitKyc = useProfileMock((s) => s.submitKyc);
  const setKycStatus = useProfileMock((s) => s.setKycStatus);

  // Local form state (édition)
  const [firstName, setFirstName] = useState(profile.first_name ?? '');
  const [lastName, setLastName] = useState(profile.last_name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [nationality, setNationality] = useState(profile.kyc_nationality ?? '');
  const [dob, setDob] = useState(profile.kyc_date_of_birth ?? '');
  const [docType, setDocType] = useState<KycDocumentType>((profile.kyc_document_type ?? 'id_card') as KycDocumentType);

  const initials = useMemo(() => {
    const a = (firstName?.[0] ?? '').toUpperCase();
    const b = (lastName?.[0] ?? '').toUpperCase();
    return `${a}${b}` || 'U';
  }, [firstName, lastName]);

  const statusColors = chipColor(profile.kyc_status);

  const onSaveProfile = () => {
    updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
    });
    Alert.alert('Succès', 'Informations enregistrées (mock).');
  };

  const onChangePhoto = () => {
    // Mock: on alterne photo "set" / "remove"
    Alert.alert('Photo de profil (mock)', 'Simuler une photo ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: profile.avatarUri ? 'Retirer' : 'Simuler',
        style: profile.avatarUri ? 'destructive' : 'default',
        onPress: () => {
          if (profile.avatarUri) {
            setAvatar(null);
          } else {
            // Une URI fictive. Tu peux mettre une image locale si tu veux.
            setAvatar('https://picsum.photos/200');
          }
        },
      },
    ]);
  };

  const onSubmitKyc = () => {
    if (!nationality.trim() || !dob.trim()) {
      Alert.alert('Erreur', 'Nationalité et date de naissance sont requis.');
      return;
    }

    // Très simple: on attend YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      Alert.alert('Erreur', 'Format date attendu : YYYY-MM-DD');
      return;
    }

    submitKyc({
      documentType: docType,
      dateOfBirth: dob.trim(),
      nationality: nationality.trim(),
    });

    Alert.alert('KYC envoyé', 'Votre demande KYC est en cours (mock).');
  };

  const debugKyc = () => {
    // Pour tester ton UI sans backend
    Alert.alert('Debug KYC (mock)', 'Changer le statut :', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Unverified', onPress: () => setKycStatus('unverified') },
      { text: 'Pending', onPress: () => setKycStatus('pending') },
      { text: 'Approved', onPress: () => setKycStatus('approved') },
      { text: 'Rejected', onPress: () => setKycStatus('rejected') },
    ]);
  };

  return (
    <Screen padding={false} scrollable>
      <Header title="Informations personnelles" />

      <View style={styles.content}>
        {/* Avatar */}
        <Card style={styles.avatarCard}>
          <TouchableOpacity style={styles.avatarWrap} onPress={onChangePhoto} activeOpacity={0.8}>
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Icon name="camera-outline" size={16} color={COLORS.text.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.bigName}>
            {(firstName || 'Utilisateur') + (lastName ? ` ${lastName}` : '')}
          </Text>

          <View style={[styles.statusChip, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusChipText, { color: statusColors.fg }]}>
              KYC : {prettyStatus(profile.kyc_status)}
            </Text>
          </View>

          <TouchableOpacity onPress={debugKyc} style={styles.debugBtn}>
            <Text style={styles.debugText}>Changer statut (mock)</Text>
          </TouchableOpacity>
        </Card>

        {/* Infos de base */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Profil</Text>

          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Votre prénom"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Votre nom"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.text.disabled}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Code pays</Text>
              <View style={[styles.readOnlyBox]}>
                <Text style={styles.readOnlyText}>{profile.country_code}</Text>
              </View>
            </View>
            <View style={{ width: SPACING.md }} />
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>Téléphone</Text>
              <View style={[styles.readOnlyBox]}>
                <Text style={styles.readOnlyText}>{profile.phone_number}</Text>
              </View>
            </View>
          </View>

          <Button
            title="Enregistrer"
            onPress={onSaveProfile}
            fullWidth
            size="large"
            style={{ marginTop: SPACING.lg }}
          />
        </Card>

        {/* KYC */}
        <Card style={styles.card}>
          <View style={styles.kycHeader}>
            <Text style={styles.sectionTitle}>Vérification (KYC)</Text>
            <Icon name="shield-checkmark-outline" size={20} color={COLORS.text.secondary} />
          </View>

          <Text style={styles.kycHint}>
            Mode fictif : remplis ces champs pour tester le parcours. Plus tard, tu brancheras l’API.
          </Text>

          <Divider />

          <Text style={styles.label}>Type de document</Text>
          <View style={styles.docRow}>
            {[
              { id: 'id_card', label: 'Carte ID' },
              { id: 'passport', label: 'Passeport' },
              { id: 'driver_license', label: 'Permis' },
            ].map((d) => {
              const active = docType === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDocType(d.id as KycDocumentType)}
                  activeOpacity={0.8}
                  style={[
                    styles.docChip,
                    active && { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
                  ]}
                >
                  <Text style={[styles.docChipText, active && { color: COLORS.primary }]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Date de naissance (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="1999-01-30"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Text style={styles.label}>Nationalité</Text>
          <TextInput
            style={styles.input}
            value={nationality}
            onChangeText={setNationality}
            placeholder="Marocaine / Guinéenne / …"
            placeholderTextColor={COLORS.text.disabled}
          />

          <View style={styles.kycMeta}>
            <Text style={styles.metaLine}>
              Soumis : {profile.kyc_submitted_at ? profile.kyc_submitted_at.slice(0, 10) : '—'}
            </Text>
            <Text style={styles.metaLine}>
              Vérifié : {profile.kyc_verified_at ? profile.kyc_verified_at.slice(0, 10) : '—'}
            </Text>
            <Text style={styles.metaLine}>
              Tentatives : {profile.kyc_retry_count ?? 0}
            </Text>
          </View>

          <Button
            title={profile.kyc_status === 'rejected' ? 'Re-soumettre KYC' : 'Soumettre KYC'}
            onPress={onSubmitKyc}
            fullWidth
            size="large"
            style={{ marginTop: SPACING.md }}
          />
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },

  avatarCard: {
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  avatarWrap: { position: 'relative' },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.text.white, fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },

  bigName: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  statusChip: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
  },
  statusChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  debugBtn: { marginTop: SPACING.sm },
  debugText: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.xs, textDecorationLine: 'underline' },

  card: { padding: SPACING.md, marginBottom: SPACING.md },

  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },

  label: { color: COLORS.text.secondary, marginTop: SPACING.sm, marginBottom: SPACING.xs },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text.primary,
  },

  row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: SPACING.sm },

  readOnlyBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  readOnlyText: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },

  kycHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  kycHint: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.md },

  docRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },

  docChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  docChipText: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },

  kycMeta: { marginTop: SPACING.md },
  metaLine: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 4 },
});

export default PersonalInfoScreen;
