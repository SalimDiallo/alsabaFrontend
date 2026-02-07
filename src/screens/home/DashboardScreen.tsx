import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { WalletBalance } from '@/components/features/WalletBalance';
import { QuickAction } from '@/components/features/QuickAction';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { useDashboardData } from '@/hooks/useDashboardData';

const DashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, recentTransactions, loading, error, refresh } = useDashboardData();

  if (loading) {
    return (
      <Screen>
        <View style={[styles.container, { padding: SPACING.md }]}>
          <Text style={{ color: COLORS.text.secondary }}>Chargement du tableau de bord…</Text>
        </View>
      </Screen>
    );
  }

  // Gestion des cas où data est null
  if (!data) {
    return (
      <Screen>
        <View style={[styles.container, { padding: SPACING.md }]}>
          <Text style={{ color: COLORS.error, marginBottom: SPACING.sm }}>
            Les données ne sont pas disponibles. Veuillez vérifier votre connexion ou réessayer.
          </Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (error) {
    console.log(error, data);
    return (
      <Screen>
        <View style={[styles.container, { padding: SPACING.md }]}>
          <Text style={{ color: COLORS.error, marginBottom: SPACING.sm }}>
            {error}
          </Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const { user, wallet, fxRate } = data;

  return (
    <Screen scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>
              {(user.first_name ?? '')} {(user.last_name ?? '')}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={refresh}>
              <Icon name="refresh-outline" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="notifications-outline" size={24} color={COLORS.text.primary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Balance */}
        <View style={styles.walletSection}>
          <WalletBalance
            balance={wallet.balance}
            currency={wallet.currency}
            availableBalance={wallet.availableBalance}
            pendingBalance={wallet.pendingBalance}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle-outline"
              label="Alimenter"
              onPress={() => navigation.navigate('FundWallet')}
            />
            <View style={styles.actionSpace} />
            <QuickAction
              icon="swap-horizontal-outline"
              label="Créer une offre"
              onPress={() => navigation.navigate('CreateOffer')}
              variant="secondary"
            />
          </View>
        </View>

        {/* Taux de change */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taux du jour</Text>
          <Card style={styles.rateCard}>
            <View style={styles.rateRow}>
              <View style={styles.rateLeft}>
                <Text style={styles.rateFlag}>{fxRate.from.flag}</Text>
                <View>
                  <Text style={styles.rateCurrency}>{fxRate.from.amount} {fxRate.from.code}</Text>
                  <Text style={styles.rateLabel}>{fxRate.from.label}</Text>
                </View>
              </View>

              <Icon name="arrow-forward" size={20} color={COLORS.text.secondary} />

              <View style={styles.rateRight}>
                <Text style={styles.rateFlag}>{fxRate.to.flag}</Text>
                <View>
                  <Text style={styles.rateCurrency}>
                    {fxRate.to.amount.toLocaleString()} {fxRate.to.code}
                  </Text>
                  <Text style={styles.rateLabel}>{fxRate.to.label}</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Transactions récentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions Récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions' as never)}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <View style={styles.transactionIcon}>
                  <Icon
                    name={
                      transaction.type === 'DEPOSIT'
                        ? 'arrow-down-circle'
                        : transaction.type === 'WITHDRAWAL'
                        ? 'arrow-up-circle'
                        : 'swap-horizontal'
                    }
                    size={24}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
                </View>

                <Text style={styles.transactionAmount}>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.xs / 2,
  },

  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },

  iconButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },

  notificationButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error,
  },

  walletSection: { paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  section: { paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },

  seeAll: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  quickActions: { flexDirection: 'row' },
  actionSpace: { width: SPACING.md },

  rateCard: { padding: SPACING.md },
  rateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rateLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rateRight: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },

  rateFlag: { fontSize: 32, marginRight: SPACING.sm },
  rateCurrency: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  rateLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary },

  transactionCard: { marginBottom: SPACING.sm },
  transactionRow: { flexDirection: 'row', alignItems: 'center' },
  transactionIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: { flex: 1 },
  transactionDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  transactionDate: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary },
  transactionAmount: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primary },

  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  retryText: { color: 'white', fontWeight: '600' },
});

export default DashboardScreen;
