import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import type { Currency } from '@/constants/currencies';

interface WalletBalanceProps {
  balance: number;
  currency: Currency;
  availableBalance: number;
  pendingBalance: number;
}

const HIDDEN_BALANCE = '••••••';

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  balance,
  currency,
  availableBalance,
  pendingBalance,
}) => {
  // Solde masqué par défaut
  const [isBalanceHidden, setIsBalanceHidden] = useState(true);

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  const displayBalance = isBalanceHidden ? HIDDEN_BALANCE : formatCurrency(balance, currency);
  const displayAvailable = isBalanceHidden ? HIDDEN_BALANCE : formatCurrency(availableBalance, currency);
  const displayPending = isBalanceHidden ? HIDDEN_BALANCE : formatCurrency(pendingBalance, currency);

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Solde Total</Text>
        <TouchableOpacity 
          onPress={toggleBalanceVisibility}
          style={styles.eyeButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color="rgba(255,255,255,0.8)" 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.balance}>{displayBalance}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Disponible</Text>
          <Text style={styles.detailValue}>
            {displayAvailable}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>En attente</Text>
          <Text style={[styles.detailValue, styles.pending]}>
            {displayPending}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.white,
    opacity: 0.8,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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

