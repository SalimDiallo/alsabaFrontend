import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { WalletBalance } from '@/components/features/WalletBalance';
import { QuickAction } from '@/components/features/QuickAction';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useExchangeRates } from '@/hooks/useExchangeRates';

const DashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, recentTransactions, loading, error, refresh } = useDashboardData();
  const logout = useAuthStore((s) => s.logout);
  const currentUser = useAuthStore((s) => s.user);
  
  // Notifications
  const { unreadCount, refresh: refreshNotifications } = useNotifications();

  // Vérifier si l'utilisateur est chargé, sinon déconnecter
  useEffect(() => {
    if (!loading && !currentUser) {
      logout();
    }
  }, [currentUser, loading, logout]);

  // Initiales de l'utilisateur pour l'avatar
  const userInitials = useMemo(() => {
    if (!data?.user) return '?';
    const first = data.user.first_name?.[0] || '';
    const last = data.user.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  }, [data?.user]);

  // Taux de change dynamiques depuis le backend (basés sur la devise du pays de l'utilisateur)
  const { 
    rates: exchangeRates, 
    loading: ratesLoading, 
    refresh: refreshRates,
    baseCurrency 
  } = useExchangeRates(currentUser?.country_code);

  // Animation du ticker
  const [currentRateIndex, setCurrentRateIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const RATE_HEIGHT = 36; // Hauteur d'une ligne de taux

  const animateToNextRate = useCallback(() => {
    // Animation de sortie vers le haut
    Animated.timing(slideAnim, {
      toValue: -RATE_HEIGHT,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      // Passer au taux suivant
      setCurrentRateIndex((prev) => (prev + 1) % exchangeRates.length);
      // Reset position instantanément
      slideAnim.setValue(RATE_HEIGHT);
      // Animation d'entrée depuis le bas
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  }, [slideAnim, exchangeRates.length]);

  // Timer pour le défilement automatique
  useEffect(() => {
    if (!data) return;
    
    const interval = setInterval(() => {
      animateToNextRate();
    }, 10000); // 10 secondes

    return () => clearInterval(interval);
  }, [data, animateToNextRate]);

  // État de chargement amélioré
  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement…</Text>
        </View>
      </Screen>
    );
  }

  // État d'erreur amélioré
  if (!data || error) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Icon name="cloud-offline-outline" size={48} color={COLORS.neutral[400]} />
          </View>
          <Text style={styles.errorTitle}>Connexion impossible</Text>
          <Text style={styles.errorMessage}>
            {error || 'Les données ne sont pas disponibles. Veuillez vérifier votre connexion.'}
          </Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton} activeOpacity={0.7}>
            <Icon name="refresh-outline" size={18} color={COLORS.text.white} />
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const { user, wallet, fxRate } = data;

  // Fonction pour obtenir les infos de style selon le type de transaction
  const getTransactionStyle = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return {
          icon: 'arrow-down-circle-outline' as const,
          color: COLORS.success,
          bgColor: COLORS.soft.success,
          prefix: '+',
        };
      case 'WITHDRAWAL':
        return {
          icon: 'arrow-up-circle-outline' as const,
          color: COLORS.error,
          bgColor: COLORS.soft.error,
          prefix: '-',
        };
      default:
        return {
          icon: 'swap-horizontal-outline' as const,
          color: COLORS.primary,
          bgColor: COLORS.soft.primary,
          prefix: '',
        };
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {(user.first_name ?? '')} {(user.last_name ?? '')}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => {
                refresh();
                refreshNotifications();
                refreshRates();
              }}
              activeOpacity={0.7}
            >
              <Icon name="refresh-outline" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="notifications-outline" size={20} color={COLORS.text.secondary} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  {unreadCount <= 9 ? (
                    <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                  ) : (
                    <Text style={styles.notificationBadgeText}>9+</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Balance */}
        <View style={styles.walletSection}>
          <WalletBalance
            balance={wallet.balance}
            currency={baseCurrency}
            availableBalance={wallet.availableBalance}
            pendingBalance={wallet.pendingBalance}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('FundWallet')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.soft.primary }]}>
                <Icon name="add-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Recharger</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('CreateOffer')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.soft.secondary }]}>
                <Icon name="swap-horizontal-outline" size={22} color={COLORS.secondary} />
              </View>
              <Text style={styles.quickActionLabel}>Nouvelle offre</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Transactions' as never)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.neutral[100] }]}>
                <Icon name="receipt-outline" size={22} color={COLORS.text.secondary} />
              </View>
              <Text style={styles.quickActionLabel}>Historique</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Taux de change - Ticker animé */}
        <View style={styles.section}>
          <View style={styles.rateHeader}>
            <Text style={styles.sectionLabel}>Taux du jour</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          
          <View style={styles.rateCard}>
            <View style={styles.rateTickerContainer}>
              <Animated.View 
                style={[
                  styles.rateTickerItem,
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                <Text style={styles.rateFlag}>{exchangeRates[currentRateIndex].from.flag}</Text>
                <Text style={styles.rateCurrencyCode}>{exchangeRates[currentRateIndex].from.code}</Text>
                
                <View style={styles.rateCenter}>
                  <Icon name="arrow-forward" size={12} color={COLORS.neutral[400]} />
                </View>
                
                <Text style={styles.rateValue}>
                  {exchangeRates[currentRateIndex].to.amount.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.rateCurrencyCode}>{exchangeRates[currentRateIndex].to.code}</Text>
                <Text style={styles.rateFlag}>{exchangeRates[currentRateIndex].to.flag}</Text>
                
                <View style={[
                  styles.rateTrendBadge,
                  !exchangeRates[currentRateIndex].trendUp && styles.rateTrendBadgeDown
                ]}>
                  <Icon 
                    name={exchangeRates[currentRateIndex].trendUp ? 'trending-up' : 'trending-down'} 
                    size={10} 
                    color={exchangeRates[currentRateIndex].trendUp ? COLORS.success : COLORS.error} 
                  />
                  <Text style={[
                    styles.rateTrendText,
                    !exchangeRates[currentRateIndex].trendUp && styles.rateTrendTextDown
                  ]}>
                    {exchangeRates[currentRateIndex].trend}
                  </Text>
                </View>
              </Animated.View>
            </View>
            
            {/* Indicateur de pagination */}
            <View style={styles.rateDotsContainer}>
              {exchangeRates.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.rateDot,
                    index === currentRateIndex && styles.rateDotActive
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* Transactions récentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Transactions récentes</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Transactions' as never)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.seeAllLink}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Icon name="wallet-outline" size={32} color={COLORS.neutral[300]} />
              <Text style={styles.emptyText}>Aucune transaction récente</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction, index) => {
                const txStyle = getTransactionStyle(transaction.type);
                const isLast = index === recentTransactions.length - 1;
                
                return (
                  <View 
                    key={transaction.id} 
                    style={[
                      styles.transactionItem,
                      !isLast && styles.transactionItemBorder,
                    ]}
                  >
                    <View style={[styles.transactionIconContainer, { backgroundColor: txStyle.bgColor }]}>
                      <Icon name={txStyle.icon} size={20} color={txStyle.color} />
                    </View>

                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionTitle} numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                    </View>

                    <Text style={[styles.transactionAmount, { color: txStyle.color }]}>
                      {txStyle.prefix}{formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Spacer bottom */}
        <View style={{ height: SPACING.xl }} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  headerInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
    textAlign: 'center',
  },

  // Sections
  walletSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  seeAllLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.sm,
  },
  quickActionCard: {
    width: '30%',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Rate Card - Animated Ticker
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  rateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  rateTickerContainer: {
    height: 36,
    overflow: 'hidden',
  },
  rateTickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    gap: SPACING.xs,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rateFlag: {
    fontSize: 16,
  },
  rateCurrencyCode: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
  },
  rateCenter: {
    flex: 1,
    alignItems: 'center',
  },
  rateValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  rateTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.soft.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  rateTrendBadgeDown: {
    backgroundColor: COLORS.soft.error,
  },
  rateTrendText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.success,
  },
  rateTrendTextDown: {
    color: COLORS.error,
  },
  rateDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  rateDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.neutral[300],
  },
  rateDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
  },
  rateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  rateUpdateTime: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },

  // Transactions
  transactionsList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
});

export default DashboardScreen;
