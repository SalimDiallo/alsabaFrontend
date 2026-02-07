import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OfferStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { useMockDb } from '@/store/useMockDb';
import { formatCurrency } from '@/utils/formatters';

type Props = NativeStackScreenProps<OfferStackParamList, 'OfferDetails'>;

const statusLabel = (s: string) => {
  switch (s) {
    case 'ACTIVE': return 'Active';
    case 'ACCEPTED': return 'Acceptée (buyer OK)';
    case 'VALIDATED': return 'Validée (seller OK)';
    case 'COMPLETED': return 'Terminée';
    case 'CANCELLED': return 'Annulée';
    case 'DISPUTED': return 'Litige';
    default: return s;
  }
};

const OfferDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { offerId } = route.params;

  const offer = useMockDb((s) => s.getOfferById(offerId));
  const cancelOffer = useMockDb((s) => s.cancelOffer);
  const disputeOffer = useMockDb((s) => s.disputeOffer);
  const confirmOffer = useMockDb((s) => s.confirmOffer);

  const canAccept = offer?.status === 'ACTIVE';
  const canValidate = offer?.status === 'ACCEPTED';
  const canConfirm = offer?.status === 'VALIDATED';

  const badge = useMemo(() => {
    if (!offer) return { bg: COLORS.surface, fg: COLORS.text.secondary };
    if (offer.status === 'ACTIVE') return { bg: `${COLORS.primary}10`, fg: COLORS.primary };
    if (offer.status === 'COMPLETED') return { bg: `${COLORS.success}10`, fg: COLORS.success };
    if (offer.status === 'CANCELLED') return { bg: `${COLORS.error}10`, fg: COLORS.error };
    if (offer.status === 'DISPUTED') return { bg: `${COLORS.warning}10`, fg: COLORS.warning };
    return { bg: COLORS.surface, fg: COLORS.text.secondary };
  }, [offer]);

  if (!offer) {
    return (
      <Screen padding={false}>
        <Header
          title="Détails offre"
          leftAction={{ icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />, onPress: () => navigation.goBack() }}
        />
        <View style={{ padding: SPACING.md }}>
          <Text style={{ color: COLORS.error }}>Offre introuvable.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Détails offre"
        leftAction={{ icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />, onPress: () => navigation.goBack() }}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.rowTop}>
            <Text style={styles.title}>{offer.userName}</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.fg }]}>{statusLabel(offer.status)}</Text>
            </View>
          </View>

          <View style={styles.amounts}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Envoie</Text>
              <Text style={styles.amount}>{formatCurrency(offer.sendAmount, offer.sendCurrency)}</Text>
            </View>

            <Text style={styles.arrow}>→</Text>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.label}>Reçoit</Text>
              <Text style={styles.amount}>{formatCurrency(offer.receiveAmount, offer.receiveCurrency)}</Text>
            </View>
          </View>

          <View style={styles.rate}>
            <Text style={styles.rateText}>
              1 {offer.sendCurrency} = {offer.exchangeRate.toFixed(2)} {offer.receiveCurrency}
            </Text>
          </View>

          {/* infos flow */}
          <View style={styles.flowBlock}>
            <Text style={styles.flowTitle}>Suivi (mock)</Text>
            <Text style={styles.flowLine}>Buyer: {offer.buyer?.phone ? offer.buyer.phone : '—'}</Text>
            <Text style={styles.flowLine}>Seller: {offer.seller?.phone ? offer.seller.phone : '—'}</Text>
            {!!offer.disputeReason && <Text style={[styles.flowLine, { color: COLORS.warning }]}>Litige: {offer.disputeReason}</Text>}
          </View>
        </Card>

        {canAccept && (
          <Button title="Accepter l’offre" onPress={() => navigation.navigate('OfferAccept', { offerId })} fullWidth />
        )}

        {canValidate && (
          <Button title="Valider (vendeur)" onPress={() => navigation.navigate('OfferValidate', { offerId })} fullWidth />
        )}

        {canConfirm && (
          <Button
            title="Confirmer (terminer)"
            onPress={() =>
              Alert.alert('Confirmer', 'Marquer comme terminée ? (mock)', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Confirmer', onPress: () => confirmOffer(offerId) },
              ])
            }
            fullWidth
          />
        )}

        <View style={{ height: SPACING.md }} />

        <Button
          title="Ouvrir un litige"
          variant="outline"
          onPress={() =>
            Alert.alert('Litige', 'Simuler un litige ? (mock)', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Ouvrir', onPress: () => disputeOffer(offerId, 'Fonds non reçus (mock)') },
            ])
          }
          fullWidth
        />

        <View style={{ height: SPACING.sm }} />

        <Button
          title="Annuler l’offre"
          variant="outline"
          onPress={() =>
            Alert.alert('Annuler', 'Annuler cette offre ? (mock)', [
              { text: 'Retour', style: 'cancel' },
              { text: 'Annuler', style: 'destructive', onPress: () => cancelOffer(offerId, 'Annulation utilisateur (mock)') },
            ])
          }
          fullWidth
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },
  card: { padding: SPACING.md, marginBottom: SPACING.md },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },

  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  badgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },

  amounts: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
  label: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary, marginBottom: 2 },
  amount: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  arrow: { paddingHorizontal: SPACING.md, fontSize: TYPOGRAPHY.sizes.xl, color: COLORS.primary },

  rate: { marginTop: SPACING.md, backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
  rateText: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.semibold },

  flowBlock: { marginTop: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  flowTitle: { fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xs, color: COLORS.text.primary },
  flowLine: { color: COLORS.text.secondary, marginTop: 2 },
});

export default OfferDetailsScreen;
