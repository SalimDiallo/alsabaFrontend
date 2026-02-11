import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { RootStackParamList } from '@/types/navigation.types';
import { Offer } from '@/types/offer.types';
import { offersService } from '@/services/api/offerService';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/utils/formatters';

type Tab = 'market' | 'mine';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:      { label: 'Active',      color: COLORS.primary,   bg: COLORS.soft.primary },
  ACCEPTED:  { label: 'Acceptée',    color: COLORS.warning,   bg: COLORS.soft.warning },
  LOCKED:    { label: 'Verrouillée', color: COLORS.secondary, bg: COLORS.soft.secondary },
  COMPLETED: { label: 'Terminée',    color: COLORS.success,   bg: COLORS.soft.success },
  CANCELLED: { label: 'Annulée',     color: COLORS.error,     bg: COLORS.soft.error },
  EXPIRED:   { label: 'Expirée',     color: COLORS.neutral[400], bg: COLORS.neutral[100] },
  DISPUTE:   { label: 'Litige',      color: COLORS.error,     bg: COLORS.soft.error },
};

// ── Composant carte marché ──────────────────────────────────────────
const MarketOfferCard: React.FC<{ offer: Offer; onPress: () => void }> = ({ offer, onPress }) => (
  <TouchableOpacity style={styles.marketCard} onPress={onPress} activeOpacity={0.75}>
    {/* En-tête : avatar + nom + statut */}
    <View style={styles.cardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(offer.userName ?? 'U')[0].toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardName}>{offer.userName ?? 'Anonyme'}</Text>
        <Text style={styles.cardDate}>
          {offer.created_at ? new Date(offer.created_at).toLocaleDateString('fr-FR') : ''}
        </Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: STATUS_CONFIG.OPEN.bg }]}>
        <Text style={[styles.statusText, { color: STATUS_CONFIG.OPEN.color }]}>
          {STATUS_CONFIG.OPEN.label}
        </Text>
      </View>
    </View>

    {/* Montants */}
    <View style={styles.amountsRow}>
      <View style={styles.amountBlock}>
        <Text style={styles.amountLabel}>Envoie</Text>
        <Text style={styles.amountValue}>
          {formatCurrency(offer.amount_sell, offer.currency_sell)}
        </Text>
      </View>
      <View style={styles.arrowWrap}>
        <Icon name="arrow-forward" size={18} color={COLORS.primary} />
      </View>
      <View style={[styles.amountBlock, { alignItems: 'flex-end' }]}>
        <Text style={styles.amountLabel}>Reçoit</Text>
        <Text style={styles.amountValue}>
          {formatCurrency(offer.amount_buy, offer.currency_buy)}
        </Text>
      </View>
    </View>

    {/* Pied : taux + CTA */}
    <View style={styles.cardFooter}>
      <View style={styles.rateChip}>
        <Icon name="trending-up" size={12} color={COLORS.primary} />
        <Text style={styles.rateChipText}>
          1 {offer.currency_sell} = {Number(offer.rate).toFixed(0)} {offer.currency_buy}
        </Text>
      </View>
      <View style={styles.ctaBtn}>
        <Text style={styles.ctaBtnText}>Voir →</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ── Composant carte "mes offres" ────────────────────────────────────
const MyOfferCard: React.FC<{ offer: Offer; onPress: () => void }> = ({ offer, onPress }) => {
  const cfg = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.OPEN;
  return (
    <TouchableOpacity style={styles.myCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.myCardLeft}>
        <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.myCardTop}>
          <Text style={styles.myCardAmounts}>
            {formatCurrency(offer.amount_sell, offer.currency_sell)}
            {'  →  '}
            {formatCurrency(offer.amount_buy, offer.currency_buy)}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={styles.myCardRate}>
          Taux : 1 {offer.currency_sell} = {Number(offer.rate).toFixed(2)} {offer.currency_buy}
        </Text>
        {offer.accepted_by && (
          <Text style={styles.myCardSub}>
            Acheteur : {offer.accepted_by.first_name} {offer.accepted_by.last_name}
          </Text>
        )}
        <View style={styles.confirmRow}>
          <View style={[styles.confirmDot, { backgroundColor: offer.b1_confirmed ? COLORS.success : COLORS.neutral[300] }]} />
          <Text style={styles.confirmLabel}>B1</Text>
          <View style={[styles.confirmDot, { backgroundColor: offer.b2_confirmed ? COLORS.success : COLORS.neutral[300] }]} />
          <Text style={styles.confirmLabel}>B2</Text>
        </View>
      </View>
      <Icon name="chevron-forward" size={16} color={COLORS.neutral[300]} />
    </TouchableOpacity>
  );
};

// ── Écran principal ─────────────────────────────────────────────────
const OffersListScreen = () => {
  const navigation = useNavigation<any>();
  const currentUser = useAuthStore((s) => s.user);

  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('market');

  const fetchOffers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await offersService.list();
      setAllOffers(data);
    } catch {
      // EmptyState s'affichera
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  // Refresh silencieux à chaque fois que l'écran reprend le focus
  // (ex: retour de CreateOffer, OfferDetails, etc.)
  useFocusEffect(
    useCallback(() => {
      fetchOffers(true);
    }, [fetchOffers])
  );

  const onRefresh = () => { setRefreshing(true); fetchOffers(); };

  const { marketOffers, myOffers } = useMemo(() => {
    const myId = String(currentUser?.id ?? currentUser?.pk ?? '');
    const myCurrency = currentUser?.currency;
    return {
      marketOffers: allOffers.filter((o) => {
        if (o.status !== 'OPEN') return false;
        if (String(o.user?.id) === myId) return false;
        // Afficher uniquement les offres qui concernent ma devise
        if (myCurrency && o.currency_sell !== myCurrency && o.currency_buy !== myCurrency) return false;
        return true;
      }),
      myOffers: allOffers.filter(
        (o) => String(o.user?.id) === myId || String(o.accepted_by?.id) === myId
      ),
    };
  }, [allOffers, currentUser]);

  const activeList = activeTab === 'market' ? marketOffers : myOffers;

  const filteredOffers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return activeList;
    return activeList.filter(
      (o) =>
        (o.userName ?? '').toLowerCase().includes(q) ||
        o.currency_sell.toLowerCase().includes(q) ||
        o.currency_buy.toLowerCase().includes(q)
    );
  }, [activeList, searchQuery]);

  const goStack = (name: keyof RootStackParamList, params?: any) => {
    const root = navigation.getParent?.('RootStack');
    if (root) return root.navigate(name as any, params);
    const parent = navigation.getParent?.();
    if (parent) return parent.navigate(name as any, params);
    navigation.navigate(name as any, params);
  };

  const openOffer = (offerId: string) =>
    goStack('OfferFlow', { screen: 'OfferDetails', params: { offerId } });

  const handleCreateOffer = () => goStack('CreateOffer');

  const avgRate =
    marketOffers.length > 0
      ? (marketOffers.reduce((s, o) => s + o.rate, 0) / marketOffers.length).toFixed(0)
      : '—';

  return (
    <Screen padding={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Offres</Text>
          <Text style={styles.headerSub}>Marché P2P MAD ↔ GNF</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateOffer} activeOpacity={0.8}>
          <Icon name="add" size={18} color={COLORS.text.white} />
          <Text style={styles.createBtnText}>Créer</Text>
        </TouchableOpacity>
      </View>

      {/* Onglets */}
      <View style={styles.tabs}>
        {(['market', 'mine'] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          const count = tab === 'market' ? marketOffers.length : myOffers.length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => { setActiveTab(tab); setSearchQuery(''); }}
              activeOpacity={0.7}
            >
              <Icon
                name={tab === 'market' ? 'swap-horizontal-outline' : 'person-outline'}
                size={15}
                color={isActive ? COLORS.primary : COLORS.text.secondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab === 'market' ? 'Marché' : 'Mes offres'}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stats (marché seulement) */}
      {activeTab === 'market' && !loading && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{marketOffers.length}</Text>
            <Text style={styles.statLbl}>Disponibles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{avgRate}</Text>
            <Text style={styles.statLbl}>Taux moyen</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>GNF</Text>
            <Text style={styles.statLbl}>Devise</Text>
          </View>
        </View>
      )}

      {/* Recherche */}
      <View style={styles.searchWrap}>
        <Icon name="search" size={16} color={COLORS.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={activeTab === 'market' ? 'Rechercher une offre…' : 'Filtrer mes offres…'}
          placeholderTextColor={COLORS.text.disabled}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={16} color={COLORS.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Liste */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des offres…</Text>
        </View>
      ) : filteredOffers.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconWrap}>
            <Icon
              name={activeTab === 'market' ? 'storefront-outline' : 'receipt-outline'}
              size={40}
              color={COLORS.neutral[300]}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === 'market' ? 'Aucune offre disponible' : 'Aucune offre'}
          </Text>
          <Text style={styles.emptyDesc}>
            {activeTab === 'market'
              ? "Soyez le premier à publier une offre !"
              : "Vous n'avez pas encore créé ou accepté d'offre."}
          </Text>
          <TouchableOpacity style={styles.emptyAction} onPress={handleCreateOffer}>
            <Icon name="add-circle-outline" size={16} color={COLORS.primary} />
            <Text style={styles.emptyActionText}>Créer une offre</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOffers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            activeTab === 'mine' ? (
              <MyOfferCard offer={item} onPress={() => openOffer(item.id)} />
            ) : (
              <MarketOfferCard offer={item} onPress={() => openOffer(item.id)} />
            )
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  headerSub: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  createBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.white,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.neutral[100],
    borderRadius: BORDER_RADIUS.full,
    padding: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.full,
  },
  tabActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: `${COLORS.primary}20` },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
  },
  tabBadgeTextActive: { color: COLORS.primary },

  // Stats bar
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  statLbl: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginTop: 1,
  },
  statDivider: { width: 1, backgroundColor: COLORS.divider },

  // Recherche
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
  },

  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },

  // Cartes marché
  marketCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow.color,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  cardName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  cardDate: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  statusPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  amountBlock: { flex: 1 },
  amountLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  arrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  rateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.soft.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  rateChipText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  ctaBtnText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },

  // Cartes "mes offres"
  myCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  myCardLeft: { justifyContent: 'center', alignItems: 'center', width: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  myCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  myCardAmounts: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  myCardRate: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  myCardSub: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  confirmDot: { width: 6, height: 6, borderRadius: 3 },
  confirmLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginRight: 6,
  },

  // États vides / chargement
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
});

export default OffersListScreen;
