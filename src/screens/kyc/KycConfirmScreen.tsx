import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KycStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';

type Props = NativeStackScreenProps<KycStackParamList, 'KycConfirm'>;

const KycConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const { documentType, frontAdded, backAdded, selfieAdded } = route.params;

  const setKycStatus = useAuthStore((s: any) => s.setKycStatus); // ajoute l’action dans ton store

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'review' | 'pending' | 'approved'>('review');

  const submit = async () => {
    setSubmitting(true);
    try {
      // 1) On passe pending tout de suite
      setKycStatus?.('pending');
      setStatus('pending');

      // 2) On simule la revue
      await new Promise((r) => setTimeout(r, 1500));

      // 3) On approuve (mock)
      setKycStatus?.('approved');
      setStatus('approved');

      Alert.alert('Succès', 'Identité vérifiée (mock)', [
        {
          text: 'OK',
          onPress: () => {
            // revenir au profil
            navigation.getParent?.()?.goBack?.();
            navigation.popToTop();
          },
        },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de soumettre');
    } finally {
      setSubmitting(false);
    }
  };

  const docLabel =
    documentType === 'id_card' ? "Carte d'identité" : documentType === 'passport' ? 'Passeport' : 'Permis';

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Confirmation"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Récapitulatif</Text>
          <Text style={styles.subtitle}>Vérifie que tout est prêt avant d’envoyer (mock).</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Document</Text>
            <Text style={styles.value}>{docLabel}</Text>
          </View>

          <View style={styles.checkRow}>
            <Icon name={frontAdded ? 'checkmark-circle' : 'close-circle'} size={20} color={frontAdded ? COLORS.success : COLORS.error} />
            <Text style={styles.checkText}>Recto</Text>
          </View>

          <View style={styles.checkRow}>
            <Icon name={backAdded ? 'checkmark-circle' : 'close-circle'} size={20} color={backAdded ? COLORS.success : COLORS.error} />
            <Text style={styles.checkText}>Verso</Text>
          </View>

          <View style={styles.checkRow}>
            <Icon name={selfieAdded ? 'checkmark-circle' : 'close-circle'} size={20} color={selfieAdded ? COLORS.success : COLORS.error} />
            <Text style={styles.checkText}>Selfie / Liveness</Text>
          </View>

          <View style={styles.statusBox}>
            <Icon
              name={status === 'approved' ? 'checkmark-circle' : status === 'pending' ? 'time-outline' : 'information-circle-outline'}
              size={20}
              color={status === 'approved' ? COLORS.success : status === 'pending' ? COLORS.warning : COLORS.text.secondary}
            />
            <Text style={styles.statusText}>
              {status === 'review'
                ? 'Prêt à envoyer'
                : status === 'pending'
                ? 'Vérification en cours… (mock)'
                : 'Vérifié'}
            </Text>
          </View>

          <Button
            title={submitting ? 'Envoi…' : 'Envoyer pour vérification'}
            onPress={submit}
            fullWidth
            disabled={submitting}
            style={{ marginTop: SPACING.lg }}
          />
        </Card>

        <Card style={styles.note}>
          <Text style={styles.noteTitle}>Branchement backend</Text>
          <Text style={styles.noteText}>
            {/*En production : submit => backend => provider => webhook => profile kyc_status mis à jour.*/}
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },
  card: { padding: SPACING.md, marginBottom: SPACING.md },

  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  subtitle: { marginTop: 6, color: COLORS.text.secondary, lineHeight: 20 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md },
  label: { color: COLORS.text.secondary },
  value: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.semibold },

  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm },
  checkText: { marginLeft: SPACING.sm, color: COLORS.text.primary },

  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusText: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },

  note: { padding: SPACING.md },
  noteTitle: { fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: 6 },
  noteText: { color: COLORS.text.secondary, lineHeight: 20 },
});

export default KycConfirmScreen;
