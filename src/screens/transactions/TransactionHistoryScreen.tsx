import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { walletService, TransactionData } from '@/services/api/walletService';

// Types de transaction backend avec configuration visuelle
type TransactionType = 'deposit' | 'withdrawal' | 'refund' | 'p2p_debit' | 'p2p_credit';

interface TransactionConfig {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  isIncome: boolean;
}

const getTransactionConfig = (type: string): TransactionConfig => {
  switch (type) {
    case 'deposit':
    case 'refund':
      return {
        icon: 'arrow-down-circle',
        label: type === 'refund' ? 'Remboursement' : 'Dépôt',
        color: COLORS.success,
        bgColor: COLORS.soft.success,
        isIncome: true,
      };
    case 'withdrawal':
      return {
        icon: 'arrow-up-circle',
        label: 'Retrait',
        color: COLORS.error,
        bgColor: COLORS.soft.error,
        isIncome: false,
      };
    case 'p2p_debit':
      return {
        icon: 'swap-horizontal',
        label: 'Envoi P2P',
        color: COLORS.secondary,
        bgColor: COLORS.soft.secondary,
        isIncome: false,
      };
    case 'p2p_credit':
      return {
        icon: 'swap-horizontal',
        label: 'Réception P2P',
        color: COLORS.success,
        bgColor: COLORS.soft.success,
        isIncome: true,
      };
    default:
      return {
        icon: 'ellipsis-horizontal-circle',
        label: 'Transaction',
        color: COLORS.primary,
        bgColor: COLORS.soft.primary,
        isIncome: false,
      };
  }
};

// Configuration des filtres (clés = transaction_type backend)
const FILTER_OPTIONS = [
  { key: 'all', label: 'Tout', icon: 'list-outline' },
  { key: 'deposit', label: 'Dépôts', icon: 'arrow-down-circle-outline' },
  { key: 'withdrawal', label: 'Retraits', icon: 'arrow-up-circle-outline' },
  { key: 'p2p_debit', label: 'Envois', icon: 'swap-horizontal-outline' },
  { key: 'p2p_credit', label: 'Réceptions', icon: 'swap-horizontal-outline' },
] as const;

// Groupement des transactions par période
const getDateGroup = (date: string | Date): string => {
  const now = new Date();
  const txDate = new Date(date);
  const diffTime = now.getTime() - txDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return 'Cette semaine';
  if (diffDays < 30) return 'Ce mois';
  return 'Plus ancien';
};

// Composant Transaction Item
interface TransactionItemProps {
  transaction: any;
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const config = getTransactionConfig(transaction.transaction_type);

  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Icon name={config.icon as any} size={20} color={config.color} />
      </View>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDesc} numberOfLines={1}>
          {transaction.description || transaction.transaction_type_display || config.label}
        </Text>
        <Text style={styles.transactionMeta}>
          {formatDate(transaction.created_at)}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            { color: config.isIncome ? COLORS.success : COLORS.text.primary },
          ]}
        >
          {config.isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
        </Text>
        <Text style={styles.transactionType}>{config.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Composant principal
const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 20;

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Charger les transactions depuis l'API
  const fetchTransactions = useCallback(async (newOffset = 0, reset = false) => {
    try {
      const params: { limit: number; offset: number; transaction_type?: string } = {
        limit: PAGE_SIZE,
        offset: newOffset,
      };
      if (activeFilter !== 'all') {
        params.transaction_type = activeFilter;
      }
      const res = await walletService.listTransactions(params);
      if (reset || newOffset === 0) {
        setTransactions(res.transactions);
      } else {
        setTransactions((prev) => [...prev, ...res.transactions]);
      }
      setTotalCount(res.count ?? res.transactions.length);
      setOffset(newOffset + res.transactions.length);
    } catch (e: any) {
      console.error('[TransactionHistoryScreen] Erreur:', e);
    }
  }, [activeFilter]);

  // Chargement initial
  useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchTransactions(0, true).finally(() => setLoading(false));
  }, [fetchTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setOffset(0);
    await fetchTransactions(0, true);
    setRefreshing(false);
  }, [fetchTransactions]);

  const loadMore = useCallback(async () => {
    if (loadingMore || offset >= totalCount) return;
    setLoadingMore(true);
    await fetchTransactions(offset, false);
    setLoadingMore(false);
  }, [loadingMore, offset, totalCount, fetchTransactions]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalIn = transactions
      .filter((t) => ['deposit', 'refund', 'p2p_credit'].includes(t.transaction_type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalOut = transactions
      .filter((t) => ['withdrawal', 'p2p_debit'].includes(t.transaction_type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const currency = transactions[0]?.currency || 'MAD';

    return { totalIn, totalOut, count: transactions.length, currency };
  }, [transactions]);

  // Filtrage local par recherche (le filtre par type est envoyé à l'API)
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter((t) =>
      (t.description || t.transaction_type_display || '').toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  // Groupement par date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, TransactionData[]> = {};
    filteredTransactions.forEach((t) => {
      const group = getDateGroup(t.created_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const hasMore = offset < totalCount;

  if (loading) {
    return (
      <Screen padding={false}>
        <Header title="Historique" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      padding={false}
      scrollable
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      <Header
        title="Historique"
        rightAction={{
          icon: (
            <View style={styles.headerButton}>
              <Icon
                name={showSearch ? 'close' : 'search'}
                size={20}
                color={COLORS.text.primary}
              />
            </View>
          ),
          onPress: () => setShowSearch(!showSearch),
        }}
      />

      {/* Résumé statistique */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: COLORS.soft.success }]}>
            <Icon name="trending-up" size={16} color={COLORS.success} />
          </View>
          <View>
            <Text style={styles.statLabel}>Entrées</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              +{formatCurrency(stats.totalIn, stats.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCard}>
          <View style={[styles.statIconWrap, { backgroundColor: COLORS.soft.error }]}>
            <Icon name="trending-down" size={16} color={COLORS.error} />
          </View>
          <View>
            <Text style={styles.statLabel}>Sorties</Text>
            <Text style={[styles.statValue, { color: COLORS.error }]}>
              -{formatCurrency(stats.totalOut, stats.currency)}
            </Text>
          </View>
        </View>
      </View>

      {/* Barre de recherche */}
      {showSearch && (
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color={COLORS.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une transaction..."
              placeholderTextColor={COLORS.text.disabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={18} color={COLORS.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filtres */}
      <View style={styles.filtersSection}>
        <View style={styles.filtersScroll}>
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.7}
              >
                <Icon
                  name={filter.icon as any}
                  size={14}
                  color={isActive ? COLORS.text.white : COLORS.text.secondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Liste des transactions */}
      <View style={styles.content}>
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([group, items]) => (
            <View key={group} style={styles.dateGroup}>
              <Text style={styles.dateGroupLabel}>{group}</Text>
              <View style={styles.transactionsCard}>
                {(items as any[]).map((t, index) => (
                  <React.Fragment key={t.id}>
                    <TransactionItem transaction={t} />
                    {index < items.length - 1 && <View style={styles.separator} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Icon name="receipt-outline" size={48} color={COLORS.neutral[300]} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Aucun résultat' : 'Aucune transaction'}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? `Aucune transaction ne correspond à "${searchQuery}"`
                : 'Vos transactions apparaîtront ici une fois que vous aurez effectué des opérations.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={styles.emptyAction}>
                <Icon name="add-circle-outline" size={18} color={COLORS.primary} />
                <Text style={styles.emptyActionText}>Effectuer un dépôt</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Charger plus */}
        {hasMore && (
          <TouchableOpacity
            style={styles.loadMore}
            onPress={loadMore}
            activeOpacity={0.7}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Icon name="chevron-down" size={18} color={COLORS.primary} />
                <Text style={styles.loadMoreText}>Afficher plus</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Footer avec compte */}
        {filteredTransactions.length > 0 && (
          <Text style={styles.footer}>
            {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} affichée{filteredTransactions.length > 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  // Header
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
  },

  // Filters Section
  filtersSection: {
    paddingVertical: SPACING.sm,
  },
  filtersScroll: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    marginBottom: SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: COLORS.text.white,
  },

  // Content
  content: {
    padding: SPACING.md,
    paddingTop: 0,
  },

  // Date Groups
  dateGroup: {
    marginBottom: SPACING.md,
  },
  dateGroupLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  transactionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  transactionDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  transactionMeta: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  transactionType: {
    fontSize: 9,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 52,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  emptyDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.soft.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  emptyActionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },

  // Load More
  loadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  loadMoreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },

  // Footer
  footer: {
    fontSize: 10,
    color: COLORS.text.disabled,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});

export default TransactionHistoryScreen;
