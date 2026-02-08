import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { offersService } from '@/services/api/offerService';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOffer'>;

const CreateOfferScreen: React.FC<Props> = ({ navigation }) => {
  const [amountSell, setAmountSell] = useState('500');
  const [amountBuy, setAmountBuy] = useState('525000');
  const [loading, setLoading] = useState(false);

  // Taux calculé automatiquement
  const rate = Number(amountSell) > 0 ? (Number(amountBuy) / Number(amountSell)).toFixed(2) : '0';

  const handleCreate = async () => {
    const sell = Number(amountSell);
    const buy = Number(amountBuy);

    if (!sell || sell <= 0 || !buy || buy <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer des montants valides (supérieurs à 0)');
      return;
    }

    setLoading(true);
    try {
      const offer = await offersService.create({
        amount_sell: sell,
        currency_sell: 'MAD',
        amount_buy: buy,
        currency_buy: 'GNF',
      });

      Alert.alert('Succès', `Offre publiée ✅\nTaux: 1 MAD = ${rate} GNF`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ??
        e?.response?.data?.message ??
        e?.message ??
        "Impossible de créer l'offre";
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padding={false} scrollable>
      <Header title="Créer une offre" />
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.label}>Montant à envoyer (MAD)</Text>
          <TextInput
            style={styles.input}
            value={amountSell}
            onChangeText={setAmountSell}
            keyboardType="numeric"
            placeholder="500"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Text style={styles.label}>Montant à recevoir (GNF)</Text>
          <TextInput
            style={styles.input}
            value={amountBuy}
            onChangeText={setAmountBuy}
            keyboardType="numeric"
            placeholder="525000"
            placeholderTextColor={COLORS.text.disabled}
          />

          <View style={styles.rateBox}>
            <Text style={styles.rateText}>Taux calculé : 1 MAD = {rate} GNF</Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Publication…' : 'Publier l\'offre'}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },
  card: { padding: SPACING.md },
  label: { color: COLORS.text.secondary, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text.primary,
  },
  rateBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  rateText: {
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  btn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  btnText: { color: COLORS.text.white, fontWeight: TYPOGRAPHY.weights.semibold },
});

export default CreateOfferScreen;
