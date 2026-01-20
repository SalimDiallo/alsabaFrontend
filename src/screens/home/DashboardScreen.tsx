import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { WalletBalance } from '@/components/features/WalletBalance';
import { QuickAction } from '@/components/features/QuickAction';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { mockWallet, mockUser, mockTransactions } from '@/utils/mockData';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
const DashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const recentTransactions = mockTransactions.slice(0, 3);

  return (
    <Screen scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>
              {mockUser.firstName} {mockUser.lastName}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-outline" size={24} color={COLORS.text.primary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Wallet Balance */}
        <View style={styles.walletSection}>
          <WalletBalance
            balance={mockWallet.balance}
            currency={mockWallet.currency}
            availableBalance={mockWallet.availableBalance}
            pendingBalance={mockWallet.pendingBalance}
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
                <Text style={styles.rateFlag}>🇲🇦</Text>
                <View>
                  <Text style={styles.rateCurrency}>1 MAD</Text>
                  <Text style={styles.rateLabel}>Dirham Marocain</Text>
                </View>
              </View>
              <Icon name="arrow-forward" size={20} color={COLORS.text.secondary} />
              <View style={styles.rateRight}>
                <Text style={styles.rateFlag}>🇬🇳</Text>
                <View>
                  <Text style={styles.rateCurrency}>1,050 GNF</Text>
                  <Text style={styles.rateLabel}>Franc Guinéen</Text>
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
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.createdAt)}
                  </Text>
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.xs / 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  walletSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  quickActions: {
    flexDirection: 'row',
  },
  actionSpace: {
    width: SPACING.md,
  },
  rateCard: {
    padding: SPACING.md,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rateRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  rateFlag: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  rateCurrency: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  rateLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  transactionCard: {
    marginBottom: SPACING.sm,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
});

export default DashboardScreen;
