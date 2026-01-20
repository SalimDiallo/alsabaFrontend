// src/screens/wallet/FundWalletScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
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

type Props = NativeStackScreenProps<RootStackParamList, 'FundWallet'>;

const FundWalletScreen: React.FC<Props> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER'>('CARD');

  const paymentMethods = [
    { id: 'CARD', label: 'Carte Bancaire', icon: 'card-outline' },
    { id: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' },
    { id: 'BANK_TRANSFER', label: 'Virement Bancaire', icon: 'business-outline' },
  ];

  const handleFund = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    Alert.alert(
      'Confirmation',
      `Alimenter votre wallet de ${formatCurrency(parseFloat(amount), mockWallet.currency)} via ${
        paymentMethods.find(m => m.id === selectedMethod)?.label
      } ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            Alert.alert('Succès', 'Votre wallet a été alimenté avec succès !');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <Screen scrollable padding={false}>
      <Header
        title="Alimenter mon Wallet"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        {/* Solde actuel */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde Actuel</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(mockWallet.balance, mockWallet.currency)}
          </Text>
        </Card>

        {/* Montant */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant à ajouter</Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
            leftIcon={<Text style={styles.currencySymbol}>{mockWallet.currency}</Text>}
          />

          {/* Montants rapides */}
          <View style={styles.quickAmounts}>
            {[100, 500, 1000, 2000].map((value) => (
              <Button
                key={value}
                title={`${value}`}
                onPress={() => setAmount(value.toString())}
                variant="outline"
                size="small"
                style={styles.quickButton}
              />
            ))}
          </View>
        </View>

        {/* Méthode de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Méthode de paiement</Text>
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              onPress={() => setSelectedMethod(method.id as any)}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive,
              ]}
            >
              <Icon
                name={method.icon as any}
                size={24}
                color={selectedMethod === method.id ? COLORS.primary : COLORS.text.secondary}
              />
              <Text
                style={[
                  styles.methodLabel,
                  selectedMethod === method.id && styles.methodLabelActive,
                ]}
              >
                {method.label}
              </Text>
              {selectedMethod === method.id && (
                <Icon name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </Card>
          ))}
        </View>

        {/* Bouton confirmer */}
        <Button
          title="Continuer"
          onPress={handleFund}
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
  balanceCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.white,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  currencySymbol: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickButton: {
    flex: 1,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  methodLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
  },
  methodLabelActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  submitButton: {
    marginTop: 'auto',
  },
});

export default FundWalletScreen;