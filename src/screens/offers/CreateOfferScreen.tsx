// src/screens/offers/CreateOfferScreen.tsx
// ==========================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { mockWallet } from '@/utils/mockData';
import { formatCurrency } from '@/utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOffer'>;

const CreateOfferScreen: React.FC<Props> = ({ navigation }) => {
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState<'MAD' | 'GNF'>(mockWallet.currency);
  const [receiveCurrency, setReceiveCurrency] = useState<'MAD' | 'GNF'>(
    mockWallet.currency === 'MAD' ? 'GNF' : 'MAD'
  );

  const exchangeRate = sendCurrency === 'MAD' ? 1050 : 0.00095;
  const receiveAmount = sendAmount ? (parseFloat(sendAmount) * exchangeRate).toFixed(2) : '0';

  const switchCurrencies = () => {
    setSendCurrency(receiveCurrency);
    setReceiveCurrency(sendCurrency);
  };

  const handleCreateOffer = () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    Alert.alert(
      'Confirmation',
      `Créer une offre pour envoyer ${formatCurrency(parseFloat(sendAmount), sendCurrency)} et recevoir ${formatCurrency(parseFloat(receiveAmount), receiveCurrency)} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Créer',
          onPress: () => {
            Alert.alert('Succès', 'Votre offre a été créée avec succès !');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <Screen scrollable padding={false}>
      <Header
        title="Créer une Offre"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        {/* Info */}
        <Card style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color={COLORS.info} />
          <Text style={styles.infoText}>
            Créez une offre d'échange entre MAD et GNF. Votre offre sera visible par tous les utilisateurs.
          </Text>
        </Card>

        {/* Vous envoyez */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vous envoyez</Text>
          <View style={styles.currencyRow}>
            <View style={styles.currencyFlag}>
              <Text style={styles.flag}>{sendCurrency === 'MAD' ? '🇲🇦' : '🇬🇳'}</Text>
            </View>
            <Input
              value={sendAmount}
              onChangeText={setSendAmount}
              keyboardType="numeric"
              placeholder="0.00"
              style={styles.amountInput}
            />
            <Text style={styles.currencyCode}>{sendCurrency}</Text>
          </View>
          <Text style={styles.balanceText}>
            Disponible: {formatCurrency(mockWallet.availableBalance, mockWallet.currency)}
          </Text>
        </View>

        {/* Bouton d'échange */}
        <View style={styles.switchContainer}>
          <TouchableOpacity style={styles.switchButton} onPress={switchCurrencies}>
            <Icon name="swap-vertical" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Vous recevez */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vous recevez</Text>
          <View style={styles.currencyRow}>
            <View style={styles.currencyFlag}>
              <Text style={styles.flag}>{receiveCurrency === 'MAD' ? '🇲🇦' : '🇬🇳'}</Text>
            </View>
            <View style={styles.receiveAmountContainer}>
              <Text style={styles.receiveAmount}>{receiveAmount}</Text>
            </View>
            <Text style={styles.currencyCode}>{receiveCurrency}</Text>
          </View>
        </View>

        {/* Taux de change */}
        <Card style={styles.rateCard}>
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>Taux d'échange</Text>
            <Text style={styles.rateValue}>
              1 {sendCurrency} = {exchangeRate} {receiveCurrency}
            </Text>
          </View>
        </Card>

        {/* Bouton créer */}
        <Button
          title="Créer l'offre"
          onPress={handleCreateOffer}
          fullWidth
          size="large"
          style={styles.submitButton}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E1F5FE',
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.info,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  currencyFlag: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 24,
  },
  amountInput: {
    flex: 1,
  },
  receiveAmountContainer: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  receiveAmount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  currencyCode: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    minWidth: 50,
    textAlign: 'right',
  },
  balanceText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    marginLeft: 56,
  },
  switchContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  switchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.lg,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  rateValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  submitButton: {
    marginTop: 'auto',
  },
});

export default CreateOfferScreen;
