import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { useMockDb } from '@/store/useMockDb';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOffer'>;

const CreateOfferScreen: React.FC<Props> = ({ navigation }) => {
  const createOffer = useMockDb((s) => s.createOffer);

  const [amount, setAmount] = useState('500');
  const [rate, setRate] = useState('1050');
  const [loading, setLoading] = useState(false);

  const parsedAmount = useMemo(() => Number(amount.replace(',', '.')), [amount]);
  const parsedRate = useMemo(() => Number(rate.replace(',', '.')), [rate]);

  const handleCreate = async () => {
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide.');
      return;
    }
    if (!parsedRate || parsedRate <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un taux valide.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 450));

      createOffer({
        userName: 'Moi',          // plus tard: user du store auth
        sendAmount: parsedAmount,
        sendCurrency: 'MAD',
        receiveCurrency: 'GNF',
        exchangeRate: parsedRate,
      });

      Alert.alert('Succès', `Offre publiée (mock)`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', "Impossible de créer l'offre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padding={false} scrollable>
      <Header title="Créer une offre" />
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.label}>Montant (MAD)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="500"
            placeholderTextColor={COLORS.text.disabled}
          />

          <Text style={styles.label}>Taux (GNF pour 1 MAD)</Text>
          <TextInput
            style={styles.input}
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
            placeholder="1050"
            placeholderTextColor={COLORS.text.disabled}
          />

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleCreate} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Création…' : 'Publier'}</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Mode fictif : l’offre s’ajoute immédiatement à la liste + une transaction est créée.
          </Text>
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
    borderColor: COLORS.surface,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text.primary,
  },
  btn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  btnText: { color: COLORS.text.white, fontWeight: TYPOGRAPHY.weights.semibold },
  note: { marginTop: SPACING.md, color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.xs },
});

export default CreateOfferScreen;
