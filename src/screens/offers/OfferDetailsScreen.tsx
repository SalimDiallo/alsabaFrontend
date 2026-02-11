import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OfferStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { offersService } from '@/services/api/offerService';
import { Offer } from '@/types/offer.types';
import { formatCurrency } from '@/utils/formatters';
import { useAuthStore } from '@/store/useAuthStore';

type Props = NativeStackScreenProps<OfferStackParamList, 'OfferDetails'>;

// Étapes du flux d'une offre dans l'ordre
const STEPS = [
  { key: 'OPEN',      label: 'Publiée',   icon: 'megaphone-outline' },
  { key: 'ACCEPTED',  label: 'Acceptée',  icon: 'person-add-outline' },
  { key: 'LOCKED',    label: 'Escrow',    icon: 'lock-closed-outline' },
  { key: 'COMPLETED', label: 'Terminée',  icon: 'checkmark-circle-outline' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:      { label: 'Active',      color: COLORS.primary,   bg: COLORS.soft.primary },
  ACCEPTED:  { label: 'Acceptée',    color: COLORS.warning,   bg: COLORS.soft.warning },
  LOCKED:    { label: 'Verrouillée', color: COLORS.secondary, bg: COLORS.soft.secondary },
  COMPLETED: { label: 'Terminée',    color: COLORS.success,   bg: COLORS.soft.success },
  CANCELLED: { label: 'Annulée',     color: COLORS.error,     bg: COLORS.soft.error },
  EXPIRED:   { label: 'Expirée',     color: COLORS.neutral[400], bg: COLORS.neutral[100] },
  DISPUTE:   { label: 'Litige',      color: COLORS.error,     bg: COLORS.soft.error },
};

const stepIndex = (status: string) => STEPS.findIndex((s) => s.key === status);

const OfferDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { offerId } = route.params;
  const currentUser = useAuthStore((s) => s.user);

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

  const myId = String(currentUser?.id ?? currentUser?.pk ?? '');
  const isA1 = useMemo(() => offer ? String(offer.user?.id) === myId : false, [offer, myId]);
  const isA2 = useMemo(() => offer ? String(offer.accepted_by?.id) === myId : false, [offer, myId]);
  const isParticipant = isA1 || isA2;

  const canAccept  = !isParticipant && offer?.status === 'OPEN';
  const canValidate = isA1 && offer?.status === 'ACCEPTED';
  const canConfirm  = isA1 && offer?.status === 'LOCKED';
  const canCancel   = isParticipant && (offer?.status === 'OPEN' || offer?.status === 'ACCEPTED');
  const canDispute  = isParticipant && (offer?.status === 'ACCEPTED' || offer?.status === 'LOCKED');

  const cfg = offer ? (STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.OPEN) : STATUS_CONFIG.OPEN;

  const doAction = async (action: () => Promise<Offer | any>, successMsg: string) => {
    setActing(true);
    try {
      const updated = await action();
      if (updated?.status) setOffer(updated);
      else await fetchDetail();
      Alert.alert('Succès', successMsg);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Erreur');
    } finally {
      setActing(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  // ── Not found ──
  if (!offer) {
    return (
      <View style={styles.loadingScreen}>
        <Icon name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={[styles.loadingText, { color: COLORS.error }]}>Offre introuvable</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeStep = stepIndex(offer.status);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header custom */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'offre</Text>
        <View style={[styles.headerBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.headerBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Bloc montants */}
        <View style={styles.amountsCard}>
          {/* Rôle */}
          {isA1 && (
            <View style={styles.roleRow}>
              <Icon name="person-circle-outline" size={14} color={COLORS.primary} />
              <Text style={styles.roleText}>Vous êtes le vendeur (A1)</Text>
            </View>
          )}
          {isA2 && (
            <View style={styles.roleRow}>
              <Icon name="person-circle-outline" size={14} color={COLORS.secondary} />
              <Text style={[styles.roleText, { color: COLORS.secondary }]}>Vous êtes l'acheteur (A2)</Text>
            </View>
          )}

          <Text style={styles.cardOwner}>{offer.userName ?? 'Utilisateur'}</Text>

          <View style={styles.amountsRow}>
            <View style={styles.amountBlock}>
              <Text style={styles.amountLbl}>ENVOIE</Text>
              <Text style={styles.amountVal}>{formatCurrency(offer.amount_sell, offer.currency_sell)}</Text>
              <Text style={styles.amountCurrency}>{offer.currency_sell}</Text>
            </View>
            <View style={styles.arrowCircle}>
              <Icon name="swap-horizontal" size={20} color={COLORS.primary} />
            </View>
            <View style={[styles.amountBlock, { alignItems: 'flex-end' }]}>
              <Text style={styles.amountLbl}>REÇOIT</Text>
              <Text style={styles.amountVal}>{formatCurrency(offer.amount_buy, offer.currency_buy)}</Text>
              <Text style={styles.amountCurrency}>{offer.currency_buy}</Text>
            </View>
          </View>

          <View style={styles.rateRow}>
            <Icon name="trending-up" size={14} color={COLORS.primary} />
            <Text style={styles.rateText}>
              1 {offer.currency_sell} = {offer.rate != null ? Number(offer.rate).toFixed(2) : '—'} {offer.currency_buy}
            </Text>
          </View>
        </View>

        {/* Timeline progression (seulement pour les flux normaux) */}
        {['OPEN', 'ACCEPTED', 'LOCKED', 'COMPLETED'].includes(offer.status) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progression</Text>
            <View style={styles.timeline}>
              {STEPS.map((step, i) => {
                const done = i <= activeStep;
                const active = i === activeStep;
                return (
                  <View key={step.key} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        done && styles.timelineDotDone,
                        active && styles.timelineDotActive,
                      ]}>
                        <Icon
                          name={step.icon as any}
                          size={12}
                          color={done ? COLORS.text.white : COLORS.neutral[400]}
                        />
                      </View>
                      {i < STEPS.length - 1 && (
                        <View style={[styles.timelineLine, done && i < activeStep && styles.timelineLineDone]} />
                      )}
                    </View>
                    <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.participantsCard}>
            <View style={styles.participant}>
              <View style={[styles.participantAvatar, { backgroundColor: COLORS.soft.primary }]}>
                <Text style={[styles.participantAvatarText, { color: COLORS.primary }]}>
                  {(offer.user?.first_name ?? 'V')[0].toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.participantRole}>Vendeur (A1)</Text>
                <Text style={styles.participantName}>
                  {offer.user?.first_name} {offer.user?.last_name}
                </Text>
              </View>
            </View>

            {offer.accepted_by ? (
              <>
                <View style={styles.participantDivider} />
                <View style={styles.participant}>
                  <View style={[styles.participantAvatar, { backgroundColor: COLORS.soft.secondary }]}>
                    <Text style={[styles.participantAvatarText, { color: COLORS.secondary }]}>
                      {(offer.accepted_by?.first_name ?? 'A')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.participantRole}>Acheteur (A2)</Text>
                    <Text style={styles.participantName}>
                      {offer.accepted_by.first_name} {offer.accepted_by.last_name}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.participantDivider} />
                <View style={[styles.participant, { opacity: 0.5 }]}>
                  <View style={[styles.participantAvatar, { backgroundColor: COLORS.neutral[100] }]}>
                    <Icon name="person-outline" size={16} color={COLORS.neutral[400]} />
                  </View>
                  <View>
                    <Text style={styles.participantRole}>Acheteur (A2)</Text>
                    <Text style={styles.participantName}>En attente…</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Confirmations bénéficiaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmations</Text>
          <View style={styles.confirmCard}>
            <View style={styles.confirmItem}>
              <View style={[styles.confirmIcon, { backgroundColor: offer.b1_confirmed ? COLORS.soft.success : COLORS.neutral[100] }]}>
                <Icon
                  name={offer.b1_confirmed ? 'checkmark' : 'time-outline'}
                  size={14}
                  color={offer.b1_confirmed ? COLORS.success : COLORS.neutral[400]}
                />
              </View>
              <View>
                <Text style={styles.confirmLabel}>Bénéficiaire B1</Text>
                <Text style={[styles.confirmStatus, { color: offer.b1_confirmed ? COLORS.success : COLORS.neutral[400] }]}>
                  {offer.b1_confirmed ? 'Confirmé' : 'En attente'}
                </Text>
              </View>
            </View>
            <View style={styles.confirmDivider} />
            <View style={styles.confirmItem}>
              <View style={[styles.confirmIcon, { backgroundColor: offer.b2_confirmed ? COLORS.soft.success : COLORS.neutral[100] }]}>
                <Icon
                  name={offer.b2_confirmed ? 'checkmark' : 'time-outline'}
                  size={14}
                  color={offer.b2_confirmed ? COLORS.success : COLORS.neutral[400]}
                />
              </View>
              <View>
                <Text style={styles.confirmLabel}>Bénéficiaire B2</Text>
                <Text style={[styles.confirmStatus, { color: offer.b2_confirmed ? COLORS.success : COLORS.neutral[400] }]}>
                  {offer.b2_confirmed ? 'Confirmé' : 'En attente'}
                </Text>
              </View>
            </View>
          </View>
          {offer.expires_at && (
            <Text style={styles.expiryText}>
              Expire le {new Date(offer.expires_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Text>
          )}
        </View>

        {/* ═══ ACTIONS ═══ */}
        <View style={styles.actionsSection}>
          {/* Tiers → Accepter */}
          {canAccept && (
            <Button
              title="Accepter cette offre"
              onPress={() => navigation.navigate('OfferAccept', { offerId })}
              fullWidth
              disabled={acting}
            />
          )}

          {/* A1 → Valider */}
          {canValidate && (
            <Button
              title="Valider (fournir mes coordonnées)"
              onPress={() => navigation.navigate('OfferValidate', { offerId })}
              fullWidth
              disabled={acting}
            />
          )}

          {/* A1 → Confirmer swap */}
          {canConfirm && (
            <Button
              title="Confirmer l'exécution du swap"
              onPress={() =>
                Alert.alert(
                  'Confirmer le swap',
                  'Les fonds seront transférés aux bénéficiaires. Cette action est irréversible.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Confirmer', onPress: () => doAction(() => offersService.confirm(offerId), 'Transaction complétée !') },
                  ]
                )
              }
              fullWidth
              disabled={acting}
            />
          )}

          {/* Litige */}
          {canDispute && (
            <Button
              title="Ouvrir un litige"
              variant="outline"
              onPress={() =>
                Alert.alert('Ouvrir un litige', 'Décrivez le problème rencontré.', [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Confirmer',
                    onPress: () => doAction(
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

          {/* Annuler */}
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                Alert.alert('Annuler l\'offre', 'Êtes-vous sûr de vouloir annuler ?', [
                  { text: 'Retour', style: 'cancel' },
                  { text: 'Annuler l\'offre', style: 'destructive', onPress: () => doAction(() => offersService.cancel(offerId), 'Offre annulée') },
                ])
              }
              disabled={acting}
            >
              <Icon name="close-circle-outline" size={16} color={COLORS.error} />
              <Text style={styles.cancelBtnText}>Annuler l'offre</Text>
            </TouchableOpacity>
          )}

          {acting && (
            <View style={styles.actingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.actingText}>Traitement en cours…</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  backLink: { marginTop: SPACING.sm },
  backLinkText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primary },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  headerBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  scroll: { padding: SPACING.lg, paddingTop: 0 },

  // Carte montants
  amountsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow.color,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: SPACING.xs,
  },
  roleText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  cardOwner: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  amountBlock: { flex: 1 },
  amountLbl: {
    fontSize: 9,
    color: COLORS.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  amountVal: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  amountCurrency: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  rateText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },

  // Section
  section: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },

  // Timeline
  timeline: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineLeft: { alignItems: 'center' },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  timelineDotDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: `${COLORS.primary}40`,
    borderWidth: 3,
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    left: 28,
    width: '100%',
    height: 2,
    backgroundColor: COLORS.neutral[200],
  },
  timelineLineDone: { backgroundColor: COLORS.primary },
  timelineLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Participants
  participantsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  participantRole: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  participantName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  participantDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },

  // Confirmations
  confirmCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
  },
  confirmItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  confirmIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  confirmStatus: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 1,
  },
  confirmDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  expiryText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Actions
  actionsSection: {
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  actingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
});

export default OfferDetailsScreen;
