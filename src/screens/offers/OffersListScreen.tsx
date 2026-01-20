import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { OfferCard } from '@/components/features/OfferCard';
import { Button } from '@/components/common/Button';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { mockOffers } from '@/utils/mockData';

const OffersListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOffers = mockOffers.filter((offer) =>
    offer.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptOffer = (offerId: string) => {
    console.log('Accepter offre:', offerId);
    // Navigation vers confirmation
  };

  
  const handleCreateOffer = () => {
    console.log('Créer une nouvelle offre');
    navigation.navigate('CreateOffer');
  };

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
        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher une offre..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockOffers.length}</Text>
            <Text style={styles.statLabel}>Offres actives</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1,050</Text>
            <Text style={styles.statLabel}>Taux moyen</Text>
          </View>
        </View>

        {/* Liste des offres */}
        {filteredOffers.length === 0 ? (
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchContainer: {
    paddingVertical: SPACING.md,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },
  list: {
    paddingBottom: SPACING.lg,
  },
});

export default OffersListScreen;
