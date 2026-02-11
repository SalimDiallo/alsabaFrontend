import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import { Offer } from '@/types/offer.types';

interface OfferCardProps {
  offer: Offer;
  onAccept: (offerId: string) => void;
  showAcceptButton?: boolean;
}

const statusDisplay: Record<string, string> = {
  OPEN: 'Active',
  ACCEPTED: 'Acceptée',
  LOCKED: 'Verrouillée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  EXPIRED: 'Expirée',
  DISPUTE: 'Litige',
};

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onAccept,
  showAcceptButton = true,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userName}>{offer.userName ?? 'Offre'}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{statusDisplay[offer.status] ?? offer.status}</Text>
        </View>
      </View>

      <View style={styles.amounts}>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Envoie</Text>
          <Text style={styles.amount}>
            {formatCurrency(offer.amount_sell, offer.currency_sell)}
          </Text>
        </View>

        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Reçoit</Text>
          <Text style={styles.amount}>
            {formatCurrency(offer.amount_buy, offer.currency_buy)}
          </Text>
        </View>
      </View>

      <View style={styles.rate}>
        <Text style={styles.rateLabel}>Taux:</Text>
        <Text style={styles.rateValue}>
          1 {offer.currency_sell} = {offer.rate != null ? Number(offer.rate).toFixed(2) : '—'} {offer.currency_buy}
        </Text>
      </View>

      {showAcceptButton && offer.status === 'OPEN' && (
        <Button
          title="Voir l'offre"
          onPress={() => onAccept(offer.id)}
          variant="primary"
          fullWidth
          size="medium"
          style={styles.button}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  amountSection: {
    flex: 1,
  },
  amountLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  amount: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  arrow: {
    paddingHorizontal: SPACING.md,
  },
  arrowText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: COLORS.primary,
  },
  rate: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  rateLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
  },
  rateValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  button: {
    marginTop: SPACING.xs,
  },
});
