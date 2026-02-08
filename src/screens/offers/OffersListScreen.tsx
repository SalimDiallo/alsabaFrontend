import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { OfferCard } from '@/components/features/OfferCard';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { RootStackParamList } from '@/types/navigation.types';
import { Offer } from '@/types/offer.types';
import { offersService } from '@/services/api/offerService';

const OffersListScreen = () => {
  const navigation = useNavigation<any>();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOffers = useCallback(async () => {
    try {
      const data = await offersService.list();
      setOffers(data);
    } catch (e) {
      // silencieux — l'EmptyState s'affichera
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const filteredOffers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return offers;
    return offers.filter((o) =>
      (o.userName ?? '').toLowerCase().includes(q) ||
      o.currency_sell.toLowerCase().includes(q) ||
      o.currency_buy.toLowerCase().includes(q)
    );
  }, [offers, searchQuery]);

  // helper pour naviguer vers RootStack
  const goStack = (name: keyof RootStackParamList, params?: any) => {
    const root = navigation.getParent?.('RootStack');
    if (root) return root.navigate(name as any, params);
    const parent = navigation.getParent?.();
    if (parent) return parent.navigate(name as any, params);
    return navigation.navigate(name as any, params);
  };

  const openOffer = (offerId: string) => {
    goStack('OfferFlow', { screen: 'OfferDetails', params: { offerId } });
  };

  const handleCreateOffer = () => goStack('CreateOffer');

  return (
    <Screen>
      <Header
        title="Offres Disponibles"
        rightAction={{
          icon: <Icon name="add-circle-outline" size={28} color={COLORS.primary} />,
          onPress: handleCreateOffer,
        }}
      />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une offre..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{offers.length}</Text>
            <Text style={styles.statLabel}>Offres</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {offers.length > 0
                ? (offers.reduce((s, o) => s + o.rate, 0) / offers.length).toFixed(0)
                : '—'}
            </Text>
            <Text style={styles.statLabel}>Taux moyen</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : filteredOffers.length === 0 ? (
          <EmptyState
            icon="file-tray-outline"
            title="Aucune offre trouvée"
            message="Il n'y a pas d'offres correspondant à votre recherche"
            actionLabel="Créer une offre"
            onAction={handleCreateOffer}
          />
        ) : (
          <FlatList
            data={filteredOffers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OfferCard
                offer={item}
                onAccept={() => openOffer(item.id)}
                showAcceptButton
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: SPACING.md },
  searchContainer: { paddingVertical: SPACING.md },
  stats: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2,
  },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary },
  statDivider: { width: 1, backgroundColor: COLORS.divider, marginHorizontal: SPACING.md },
  list: { paddingBottom: SPACING.lg },
});

export default OffersListScreen;
