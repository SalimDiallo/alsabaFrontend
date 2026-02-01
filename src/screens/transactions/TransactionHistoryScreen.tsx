import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { formatCurrency, formatDate } from '@/utils/formatters';

import { useMockDb } from '@/store/useMockDb';

const TransactionHistoryScreen = () => {
  const transactions = useMockDb((s) => s.transactions);
  const [limit, setLimit] = useState(10);

  const items = useMemo(() => transactions.slice(0, limit), [transactions, limit]);

  return (
    <Screen padding={false} scrollable>
      <Header title="Historique" />

      <View style={styles.content}>
        {items.map((t) => (
          <Card key={t.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Icon
                  name={
                    t.type === 'DEPOSIT'
                      ? 'arrow-down-circle'
                      : t.type === 'WITHDRAWAL'
                      ? 'arrow-up-circle'
                      : t.type === 'OFFER_CREATED'
                      ? 'add-circle'
                      : t.type === 'OFFER_ACCEPTED'
                      ? 'checkmark-circle'
                      : 'swap-horizontal'
                  }
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.info}>
                <Text style={styles.desc}>{t.description}</Text>
                <Text style={styles.date}>{formatDate(t.createdAt)}</Text>
              </View>

              <Text style={styles.amount}>
                {formatCurrency(t.amount, t.currency)}
              </Text>
            </View>
          </Card>
        ))}

        {limit < transactions.length && (
          <TouchableOpacity style={styles.loadMore} onPress={() => setLimit((x) => x + 10)}>
            <Text style={styles.loadMoreText}>Charger plus</Text>
          </TouchableOpacity>
        )}

        {transactions.length === 0 && (
          <Card style={{ padding: SPACING.lg, alignItems: 'center' }}>
            <Text style={{ color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.semibold }}>
              Aucune transaction
            </Text>
            <Text style={{ color: COLORS.text.secondary, marginTop: SPACING.xs, textAlign: 'center' }}>
              Les actions mock (wallet, offre, etc.) créeront des transactions ici.
            </Text>
          </Card>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },

  card: { padding: SPACING.md, marginBottom: SPACING.sm },

  row: { flexDirection: 'row', alignItems: 'center' },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  info: { flex: 1 },

  desc: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },

  date: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },

  amount: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },

  loadMore: { padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },

  loadMoreText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },
});

export default TransactionHistoryScreen;
