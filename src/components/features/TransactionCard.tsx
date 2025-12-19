import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Badge } from '@/components/common/Badge';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { Transaction } from '@/types/transaction.types';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const getStatusBadge = () => {
    const statusMap = {
      PENDING: { label: 'En attente', variant: 'warning' as const },
      PROCESSING: { label: 'En cours', variant: 'info' as const },
      COMPLETED: { label: 'Complété', variant: 'success' as const },
      FAILED: { label: 'Échoué', variant: 'error' as const },
      CANCELLED: { label: 'Annulé', variant: 'default' as const },
    };
    return statusMap[transaction.status];
  };

  const getTypeIcon = () => {
    const iconMap = {
      DEPOSIT: 'arrow-down-circle',
      WITHDRAWAL: 'arrow-up-circle',
      EXCHANGE: 'swap-horizontal',
      REFUND: 'arrow-undo',
    } as const;
    return iconMap[transaction.type];
  };

  const getTypeLabel = () => {
    const labelMap = {
      DEPOSIT: 'Dépôt',
      WITHDRAWAL: 'Retrait',
      EXCHANGE: 'Échange',
      REFUND: 'Remboursement',
    };
    return labelMap[transaction.type];
  };

  const statusBadge = getStatusBadge();

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon 
            name={getTypeIcon()} 
            size={24} 
            color={COLORS.primary} 
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.type}>{getTypeLabel()}</Text>
          <Text style={styles.date}>
            {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
          </Text>
        </View>
        <Badge label={statusBadge.label} variant={statusBadge.variant} />
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Montant</Text>
          <Text style={styles.amount}>
            {formatCurrency(transaction.amount, transaction.currency)}
          </Text>
        </View>

        {transaction.fee > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frais</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(transaction.fee, transaction.currency)}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Référence</Text>
          <Text style={styles.reference}>{transaction.reference}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  type: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  details: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  amount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  reference: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
});
