import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/common/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import type { Currency } from '@/constants/currencies';

interface WalletBalanceProps {
  balance: number;
  currency: Currency;
  availableBalance: number;
  pendingBalance: number;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  balance,
  currency,
  availableBalance,
  pendingBalance,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Solde Total</Text>
      <Text style={styles.balance}>{formatCurrency(balance, currency)}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Disponible</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(availableBalance, currency)}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>En attente</Text>
          <Text style={[styles.detailValue, styles.pending]}>
            {formatCurrency(pendingBalance, currency)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.white,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  balance: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
    marginBottom: SPACING.md,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.white,
    opacity: 0.7,
    marginBottom: SPACING.xs / 2,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.white,
  },
  pending: {
    opacity: 0.8,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.text.white,
    opacity: 0.2,
    marginHorizontal: SPACING.md,
  },
});
