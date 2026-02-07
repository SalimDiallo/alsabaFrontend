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
import { useMockDb } from '@/store/useMockDb';

type Props = NativeStackScreenProps<OfferStackParamList, 'OfferValidate'>;

const OfferValidateScreen: React.FC<Props> = ({ navigation, route }) => {
  const { offerId } = route.params;

  const offer = useMockDb((s) => s.getOfferById(offerId));
  const validateOffer = useMockDb((s) => s.validateOffer);

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!offer) {
    return (
      <Screen padding={false}>
        <Header
          title="Valider"
          leftAction={{ icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />, onPress: () => navigation.goBack() }}
        />
        <View style={{ padding: SPACING.md }}>
          <Text style={{ color: COLORS.error }}>Offre introuvable.</Text>
        </View>
      </Screen>
    );
  }

  const onSubmit = async () => {
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    validateOffer(offerId, phone.trim(), offer.userName);

    setLoading(false);
    Alert.alert('OK', 'Numéro seller enregistré (mock).', [
      {
        text: 'Retour détails',
        onPress: () => navigation.replace('OfferDetails', { offerId }),
      },
    ]);
  };

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Validation vendeur"
        leftAction={{ icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />, onPress: () => navigation.goBack() }}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Numéro de paiement (seller)</Text>
          <Text style={styles.subtitle}>
            Saisis le numéro sur lequel tu veux recevoir {offer.sendCurrency} (mock).
          </Text>

          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="ex: 07xxxxxxxx"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Button title={loading ? 'Validation…' : 'Valider'} onPress={onSubmit} fullWidth />
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

export default OfferValidateScreen;
