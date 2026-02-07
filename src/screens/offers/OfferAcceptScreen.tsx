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

type Props = NativeStackScreenProps<OfferStackParamList, 'OfferAccept'>;

const OfferAcceptScreen: React.FC<Props> = ({ navigation, route }) => {
  const { offerId } = route.params;

  const offer = useMockDb((s) => s.getOfferById(offerId));
  const acceptOffer = useMockDb((s) => s.acceptOffer);

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!offer) {
    return (
      <Screen padding={false}>
        <Header
          title="Accepter"
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
    acceptOffer(offerId, phone.trim(), 'Acheteur');

    setLoading(false);
    Alert.alert('OK', 'Numéro buyer enregistré (mock).', [
      {
        text: 'Continuer',
        onPress: () => navigation.replace('OfferDetails', { offerId }),
      },
    ]);
  };

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Accepter l’offre"
        leftAction={{ icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />, onPress: () => navigation.goBack() }}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Numéro de destination (buyer)</Text>
          <Text style={styles.subtitle}>
            Saisis le numéro sur lequel tu veux recevoir {offer.receiveCurrency} (mock).
          </Text>

          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="ex: 06xxxxxxxx"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Button title={loading ? 'Enregistrement…' : 'Confirmer'} onPress={onSubmit} fullWidth />
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
