import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import { walletService, WalletData } from '@/services/api/walletService';

type Props = NativeStackScreenProps<RootStackParamList, 'FundWallet'>;

type PaymentMethodId = 'CARD' | 'MOBILE_MONEY';

// Mapping frontend → backend
const toBackendMethod = (m: PaymentMethodId): 'card' | 'orange_money' =>
    m === 'CARD' ? 'card' : 'orange_money';

interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: string;
  fee: string;
  delay: string;
}

const FundWalletScreen: React.FC<Props> = ({ navigation }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('CARD');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    walletService.getWallet().then(setWallet).finally(() => setLoadingWallet(false));
  }, []);

  const paymentMethods: PaymentMethod[] = useMemo(() => ([
    {
      id: 'CARD',
      label: 'Carte Bancaire',
      description: 'Visa, Mastercard',
      icon: 'card-outline',
      fee: '1.5%',
      delay: 'Instantané',
    },
    {
      id: 'MOBILE_MONEY',
      label: 'Orange Money',
      description: 'Mobile Money (Orange)',
      icon: 'phone-portrait-outline',
      fee: '1%',
      delay: 'Instantané',
    },
  ]), []);

  const parsedAmount = useMemo(() => Number(amount.replace(/[^\d.,]/g, '').replace(',', '.')), [amount]);
  const selectedMethodInfo = useMemo(() => paymentMethods.find((m) => m.id === selectedMethod), [selectedMethod, paymentMethods]);

  // Calcul des frais (correspondant au backend)
  const calculatedFee = useMemo(() => {
    if (!parsedAmount || parsedAmount <= 0) return 0;
    switch (selectedMethod) {
      case 'CARD': return parsedAmount * 0.015;
      case 'MOBILE_MONEY': return parsedAmount * 0.01;
      default: return 0;
    }
  }, [parsedAmount, selectedMethod]);

  const totalAmount = parsedAmount + calculatedFee;

  const quickAmounts = [5000, 10000, 25000, 50000];

  const currency = wallet?.currency ?? 'MAD';

  const handleFund = () => {
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Montant invalide', 'Veuillez entrer un montant supérieur à 0');
      return;
    }

    Alert.alert(
      'Confirmer le rechargement',
      `Montant: ${formatCurrency(parsedAmount, currency)}\nFrais: ${formatCurrency(calculatedFee, currency)}\nTotal: ${formatCurrency(totalAmount, currency)}\n\nVia ${selectedMethodInfo?.label}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setSubmitting(true);
            try {
              const result = await walletService.deposit({
                amount: parsedAmount,
                payment_method: toBackendMethod(selectedMethod),
              });

              if (result.payment_link) {
                // Redirige vers Flutterwave si lien de paiement disponible
                Alert.alert(
                  'Paiement',
                  'Vous allez être redirigé vers la page de paiement sécurisée.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Continuer',
                      onPress: () => {
                        Linking.openURL(result.payment_link!);
                        navigation.goBack();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Rechargement initié',
                  `${formatCurrency(result.amount, result.currency)} — Réf: ${result.transaction?.id?.slice(0, 8) ?? '—'}`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (e: any) {
              const msg = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Erreur lors du rechargement';
              Alert.alert('Erreur', msg);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const formatInputAmount = (text: string) => {
    // Permet uniquement les chiffres et un point/virgule
    const cleanedText = text.replace(/[^\d.,]/g, '');
    setAmount(cleanedText);
  };

  return (
    <Screen scrollable padding={false}>
      <Header
        title="Recharger le Wallet"
        leftAction={{
          icon: <Icon name="arrow-back" size={22} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        {/* Section Solde */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceHeader}>
            <Icon name="wallet-outline" size={20} color={COLORS.text.secondary} />
            <Text style={styles.balanceLabel}>Solde disponible</Text>
          </View>
          {loadingWallet ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.balanceAmount}>{formatCurrency(wallet?.balance ?? 0, currency)}</Text>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Montant à recharger */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant à recharger</Text>
          
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencyLabel}>{currency}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={formatInputAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.neutral[400]}
              maxLength={12}
            />
          </View>

          {/* Montants rapides */}
          <View style={styles.quickAmountsContainer}>
            {quickAmounts.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setAmount(value.toString())}
                style={[
                  styles.quickAmountChip,
                  amount === value.toString() && styles.quickAmountChipActive,
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === value.toString() && styles.quickAmountTextActive,
                ]}>
                  {value.toLocaleString('fr-FR')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Méthode de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          
          <View style={styles.methodsContainer}>
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedMethod(method.id)}
                  style={[
                    styles.methodCard,
                    isSelected && styles.methodCardSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.methodIconContainer,
                    isSelected && styles.methodIconContainerSelected,
                  ]}>
                    <Icon
                      name={method.icon as any}
                      size={20}
                      color={isSelected ? COLORS.primary : COLORS.text.secondary}
                    />
                  </View>
                  
                  <View style={styles.methodContent}>
                    <Text style={[
                      styles.methodTitle,
                      isSelected && styles.methodTitleSelected,
                    ]}>
                      {method.label}
                    </Text>
                    <Text style={styles.methodDescription}>{method.description}</Text>
                  </View>
                  
                  <View style={styles.methodMeta}>
                    <Text style={[
                      styles.methodFee,
                      method.fee === 'Gratuit' && styles.methodFeeGreen,
                    ]}>
                      {method.fee}
                    </Text>
                    <Text style={styles.methodDelay}>{method.delay}</Text>
                  </View>
                  
                  <View style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Résumé */}
        {parsedAmount > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Montant</Text>
              <Text style={styles.summaryValue}>{formatCurrency(parsedAmount, currency)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais ({selectedMethodInfo?.fee})</Text>
              <Text style={[
                styles.summaryValue,
                calculatedFee === 0 && styles.summaryValueGreen,
              ]}>
                {calculatedFee === 0 ? 'Gratuit' : formatCurrency(calculatedFee, currency)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatCurrency(totalAmount, currency)}</Text>
            </View>
          </View>
        )}

        {/* Bouton confirmer */}
        <View style={styles.footer}>
          <Button
            title={submitting ? 'Traitement…' : parsedAmount > 0 ? `Recharger ${formatCurrency(parsedAmount, currency)}` : 'Entrez un montant'}
            onPress={handleFund}
            fullWidth
            size="large"
            disabled={!parsedAmount || parsedAmount <= 0 || submitting}
          />
          <Text style={styles.securityNote}>
            <Icon name="shield-checkmark-outline" size={12} color={COLORS.text.secondary} /> Paiement sécurisé
          </Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { 
    flex: 1, 
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Balance Section
  balanceSection: {
    paddingVertical: SPACING.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  pendingBalance: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },

  // Sections
  section: { 
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },

  // Amount Input
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    padding: 0,
  },

  // Quick Amounts
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickAmountChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickAmountChipActive: {
    backgroundColor: COLORS.soft.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  quickAmountTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Payment Methods
  methodsContainer: {
    gap: SPACING.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  methodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconContainerSelected: {
    backgroundColor: COLORS.soft.primary,
  },
  methodContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  methodTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  methodTitleSelected: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  methodDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  methodMeta: {
    alignItems: 'flex-end',
    marginRight: SPACING.md,
  },
  methodFee: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  methodFeeGreen: {
    color: COLORS.success,
  },
  methodDelay: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  summaryValueGreen: {
    color: COLORS.success,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  summaryTotalLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  summaryTotalValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING.md,
  },
  securityNote: {
    textAlign: 'center',
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
});

export default FundWalletScreen;
