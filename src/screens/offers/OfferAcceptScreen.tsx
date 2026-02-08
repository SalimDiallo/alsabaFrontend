import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OfferStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { offersService } from '@/services/api/offerService';

type Props = NativeStackScreenProps<OfferStackParamList, 'OfferAccept'>;

const OfferAcceptScreen: React.FC<Props> = ({ navigation, route }) => {
  const { offerId } = route.params;

  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!beneficiaryPhone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le numéro de destination.');
      return;
    }

    setLoading(true);
    try {
      await offersService.accept(offerId, {
        beneficiary_name: beneficiaryName.trim() || undefined,
        beneficiary_phone: beneficiaryPhone.trim(),
      });

      Alert.alert('Offre acceptée', 'Vos fonds ont été bloqués en escrow. Attendez la validation du vendeur.', [
        { text: 'Voir les détails', onPress: () => navigation.replace('OfferDetails', { offerId }) },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ??
        e?.response?.data?.message ??
        e?.message ??
        "Impossible d'accepter l'offre";
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Accepter l'offre"
        leftAction={{ icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />, onPress: () => navigation.goBack() }}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Bénéficiaire (acheteur)</Text>
          <Text style={styles.subtitle}>
            Saisis le nom et numéro sur lequel tu veux recevoir les fonds.
          </Text>

          <Text style={styles.label}>Nom (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={beneficiaryName}
            onChangeText={setBeneficiaryName}
            placeholder="Prénom Nom"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Text style={styles.label}>Téléphone (E.164)</Text>
          <TextInput
            style={styles.input}
            value={beneficiaryPhone}
            onChangeText={setBeneficiaryPhone}
            keyboardType="phone-pad"
            placeholder="+22200000000"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Button title={loading ? 'Acceptation…' : 'Confirmer'} onPress={onSubmit} fullWidth disabled={loading} />
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },
  card: { padding: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  subtitle: { marginTop: 6, color: COLORS.text.secondary, marginBottom: SPACING.md },
  label: { color: COLORS.text.secondary, marginBottom: SPACING.xs },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
});

export default OfferAcceptScreen;
