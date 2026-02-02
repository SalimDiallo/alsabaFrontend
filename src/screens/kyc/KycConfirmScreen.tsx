import React, { useMemo, useState } from 'react';
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

const labelOf = (t: 'id_card' | 'passport' | 'driver_license') => {
  if (t === 'passport') return 'Passeport';
  if (t === 'driver_license') return 'Permis de conduire';
  return "Carte d'identité";
};

const KycConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const { documentType, frontAdded, backAdded, selfieAdded } = route.params;

  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = useState(false);

  const title = useMemo(() => labelOf(documentType), [documentType]);

  const submitMock = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));

      // MOCK: on met le statut en pending
      await updateUser({
        kyc_status: 'pending',
        kyc_submitted_at: new Date().toISOString(),
      } as any);

      Alert.alert('Envoyé', 'KYC soumis (mock). Statut: en cours de vérification.');
      navigation.popToTop(); // retour à KycDocument
    } catch {
      Alert.alert('Erreur', 'Impossible de soumettre le KYC (mock)');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Vérifie avant d’envoyer</Text>
          <Text style={styles.sub}>Document: {title}</Text>

          <View style={styles.checkRow}>
            <Icon name={frontAdded ? 'checkmark-circle' : 'close-circle'} size={20} color={frontAdded ? COLORS.success : COLORS.error} />
            <Text style={styles.checkText}>Recto ajouté</Text>
          </View>

          <View style={styles.checkRow}>
            <Icon name={backAdded ? 'checkmark-circle' : 'close-circle'} size={20} color={backAdded ? COLORS.success : COLORS.error} />
            <Text style={styles.checkText}>Verso ajouté</Text>
          </View>

          <View style={styles.checkRow}>
            <Icon name={selfieAdded ? 'checkmark-circle' : 'close-circle'} size={20} color={selfieAdded ? COLORS.success : COLORS.error} />
            <Text style={styles.checkText}>Selfie ajouté</Text>
          </View>

          <View style={styles.banner}>
            <Icon name="information-circle-outline" size={18} color={COLORS.text.secondary} />
            <Text style={styles.bannerText}>
              En mode fictif, on envoie juste une “demande” et le statut passe à “pending”.
            </Text>
          </View>

          <Button
            title={loading ? 'Envoi…' : 'Soumettre le KYC'}
            onPress={submitMock}
            fullWidth
            disabled={loading}
            style={{ marginTop: SPACING.md }}
          />

          <Button
            title="Revenir au choix du document"
            onPress={() => navigation.popToTop()}
            fullWidth
            variant="outline"
            style={{ marginTop: SPACING.sm }}
          />
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },

  card: { padding: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  sub: { marginTop: SPACING.xs, color: COLORS.text.secondary },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  checkText: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },

  banner: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  bannerText: { flex: 1, color: COLORS.text.secondary, lineHeight: 18, fontSize: TYPOGRAPHY.sizes.sm },
});

export default KycConfirmScreen;
