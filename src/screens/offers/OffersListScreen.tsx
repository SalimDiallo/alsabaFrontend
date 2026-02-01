import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { OfferCard } from '@/components/features/OfferCard';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';

import { useMockDb } from '@/store/useMockDb';

const OffersListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const offers = useMockDb((s) => s.offers);
  const acceptOffer = useMockDb((s) => s.acceptOffer);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return offers;

    return offers.filter((o) => o.userName.toLowerCase().includes(q));
  }, [offers, searchQuery]);

  const avgRate = useMemo(() => {
    if (offers.length === 0) return 0;
    const sum = offers.reduce((acc, o) => acc + (Number(o.exchangeRate) || 0), 0);
    return Math.round(sum / offers.length);
  }, [offers]);

  const handleAcceptOffer = (offerId: string) => {
    Alert.alert('Confirmer', "Accepter cette offre ? (mock)", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Accepter',
        onPress: () => {
          acceptOffer(offerId);
          Alert.alert('Succès', 'Offre acceptée (mock). Une transaction a été ajoutée.');
        },
      },
    ]);
  };

  const handleCreateOffer = () => navigation.navigate('CreateOffer');

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
            <Text style={styles.statValue}>{offers.filter(o => o.status === 'ACTIVE').length}</Text>
            <Text style={styles.statLabel}>Offres actives</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{avgRate ? avgRate.toLocaleString() : '—'}</Text>
            <Text style={styles.statLabel}>Taux moyen</Text>
          </View>
        </View>

        {filteredOffers.length === 0 ? (
          <EmptyState
            icon="file-tray-outline"
            title="Aucune offre trouvée"
            message={offers.length === 0 ? "Vous n'avez aucune offre pour l'instant." : "Aucune offre ne correspond à votre recherche"}
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
                onAccept={handleAcceptOffer}
                showAcceptButton
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
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
