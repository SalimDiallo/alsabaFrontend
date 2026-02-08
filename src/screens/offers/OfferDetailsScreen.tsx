import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OfferStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { offersService } from '@/services/api/offerService';
import { Offer } from '@/types/offer.types';
import { formatCurrency } from '@/utils/formatters';

type Props = NativeStackScreenProps<OfferStackParamList, 'OfferDetails'>;

const statusLabel = (s: string) => {
  switch (s) {
    case 'OPEN': return 'Active';
    case 'ACCEPTED': return 'Acceptée (escrow)';
    case 'LOCKED': return 'Verrouillée';
    case 'COMPLETED': return 'Terminée';
    case 'CANCELLED': return 'Annulée';
    case 'EXPIRED': return 'Expirée';
    case 'DISPUTE': return 'Litige';
    default: return s;
  }
};

const OfferDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { offerId } = route.params;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const data = await offersService.detail(offerId);
      setOffer(data);
    } catch {
      // affiche "introuvable"
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const canAccept = offer?.status === 'OPEN';
  const canValidate = offer?.status === 'ACCEPTED';
  const canConfirm = offer?.status === 'LOCKED';
  const canDispute = offer?.status === 'ACCEPTED' || offer?.status === 'LOCKED';

  const badge = useMemo(() => {
    if (!offer) return { bg: COLORS.surface, fg: COLORS.text.secondary };
    if (offer.status === 'OPEN') return { bg: `${COLORS.primary}10`, fg: COLORS.primary };
    if (offer.status === 'COMPLETED') return { bg: `${COLORS.success}10`, fg: COLORS.success };
    if (offer.status === 'CANCELLED' || offer.status === 'EXPIRED') return { bg: `${COLORS.error}10`, fg: COLORS.error };
    if (offer.status === 'DISPUTE') return { bg: `${COLORS.warning}10`, fg: COLORS.warning };
    return { bg: COLORS.surface, fg: COLORS.text.secondary };
  }, [offer]);

  const doAction = async (action: () => Promise<Offer | any>, successMsg: string) => {
    setActing(true);
    try {
      const updated = await action();
      if (updated?.status) setOffer(updated);
      else await fetchDetail();
      Alert.alert('Succès', successMsg);
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Erreur';
      Alert.alert('Erreur', msg);
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Screen padding={false}>
        <Header
          title="Détails offre"
          leftAction={{ icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />, onPress: () => navigation.goBack() }}
        />
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      </Screen>
    );
  }

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
            <Text style={styles.title}>{offer.userName ?? 'Offre'}</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.fg }]}>{statusLabel(offer.status)}</Text>
            </View>
          </View>

          <View style={styles.amounts}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Envoie</Text>
              <Text style={styles.amount}>{formatCurrency(offer.amount_sell, offer.currency_sell)}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.label}>Reçoit</Text>
              <Text style={styles.amount}>{formatCurrency(offer.amount_buy, offer.currency_buy)}</Text>
            </View>
          </View>

          <View style={styles.rate}>
            <Text style={styles.rateText}>
              1 {offer.currency_sell} = {offer.rate.toFixed(2)} {offer.currency_buy}
            </Text>
          </View>

          {/* Suivi */}
          <View style={styles.flowBlock}>
            <Text style={styles.flowTitle}>Suivi de la transaction</Text>
            <Text style={styles.flowLine}>
              Vendeur (A1): {offer.user?.first_name ?? ''} {offer.user?.last_name ?? ''}
            </Text>
            {offer.accepted_by && (
              <Text style={styles.flowLine}>
                Acheteur (A2): {offer.accepted_by?.first_name ?? ''} {offer.accepted_by?.last_name ?? ''}
              </Text>
            )}
            <Text style={styles.flowLine}>
              B1 confirmé: {offer.b1_confirmed ? '✓' : '—'} · B2 confirmé: {offer.b2_confirmed ? '✓' : '—'}
            </Text>
            {offer.expires_at && (
              <Text style={styles.flowLine}>
                Expire: {new Date(offer.expires_at).toLocaleDateString('fr-FR')}
              </Text>
            )}
          </View>
        </Card>

        {canAccept && (
          <Button
            title="Accepter l'offre"
            onPress={() => navigation.navigate('OfferAccept', { offerId })}
            fullWidth
            disabled={acting}
          />
        )}

        {canValidate && (
          <Button
            title="Valider (vendeur)"
            onPress={() => navigation.navigate('OfferValidate', { offerId })}
            fullWidth
            disabled={acting}
          />
        )}

        {canConfirm && (
          <Button
            title="Confirmer la transaction"
            onPress={() =>
              Alert.alert('Confirmer', 'Exécuter le swap ? Les fonds seront transférés.', [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Confirmer',
                  onPress: () => doAction(() => offersService.confirm(offerId), 'Transaction complétée !'),
                },
              ])
            }
            fullWidth
            disabled={acting}
          />
        )}

        <View style={{ height: SPACING.md }} />

        {canDispute && (
          <Button
            title="Ouvrir un litige"
            variant="outline"
            onPress={() =>
              Alert.alert('Litige', 'Décrire le problème', [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Confirmer',
                  onPress: () =>
                    doAction(
                      () => offersService.dispute(offerId, { reason: 'Fonds non reçus' }),
                      'Litige ouvert. Notre équipe va examiner.'
                    ),
                },
              ])
            }
            fullWidth
            disabled={acting}
          />
        )}

        {(offer.status === 'OPEN' || offer.status === 'ACCEPTED') && (
          <>
            <View style={{ height: SPACING.sm }} />
            <Button
              title="Annuler l'offre"
              variant="outline"
              onPress={() =>
                Alert.alert('Annuler', 'Annuler cette offre ?', [
                  { text: 'Retour', style: 'cancel' },
                  {
                    text: 'Annuler',
                    style: 'destructive',
                    onPress: () => doAction(() => offersService.cancel(offerId), 'Offre annulée'),
                  },
                ])
              }
              fullWidth
              disabled={acting}
            />
          </>
        )}

        {acting && <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.md }} />}
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
