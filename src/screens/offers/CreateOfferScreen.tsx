import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { offersService } from '@/services/api/offerService';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOffer'>;

const SUPPORTED_CURRENCIES = [
  { code: 'MAD', label: 'Dirham marocain', flag: '🇲🇦' },
  { code: 'GNF', label: 'Franc guinéen',   flag: '🇬🇳' },
  { code: 'EUR', label: 'Euro',             flag: '🇪🇺' },
  { code: 'USD', label: 'Dollar américain', flag: '🇺🇸' },
  { code: 'XOF', label: 'Franc CFA',        flag: '🌍' },
];

// ── Bottom-sheet picker de devise ──────────────────────────────────
const CurrencyPicker: React.FC<{
  value: string;
  exclude: string;
  onChange: (code: string) => void;
}> = ({ value, exclude, onChange }) => {
  const [open, setOpen] = useState(false);
  const translateY = useRef(new Animated.Value(400)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const show = () => {
    setOpen(true);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const hide = (code?: string) => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 400, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setOpen(false);
      if (code) onChange(code);
    });
  };

  const selected = SUPPORTED_CURRENCIES.find((c) => c.code === value);

  return (
    <>
      <TouchableOpacity style={styles.pickerBtn} onPress={show} activeOpacity={0.7}>
        <Text style={styles.pickerFlag}>{selected?.flag ?? '🏳️'}</Text>
        <Text style={styles.pickerCode}>{value}</Text>
        <Icon name="chevron-down" size={13} color={COLORS.neutral[400]} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => hide()}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => hide()} activeOpacity={1} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Devise de destination</Text>
            <FlatList
              data={SUPPORTED_CURRENCIES.filter((c) => c.code !== exclude)}
              keyExtractor={(item) => item.code}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const active = item.code === value;
                return (
                  <TouchableOpacity
                    style={[styles.sheetItem, active && styles.sheetItemActive]}
                    onPress={() => hide(item.code)}
                    activeOpacity={0.65}
                  >
                    <Text style={styles.sheetItemFlag}>{item.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sheetItemCode, active && { color: COLORS.primary }]}>
                        {item.code}
                      </Text>
                      <Text style={styles.sheetItemLabel}>{item.label}</Text>
                    </View>
                    {active && <Icon name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

// ── Écran ───────────────────────────────────────────────────────────
const CreateOfferScreen: React.FC<Props> = ({ navigation }) => {
  const currentUser = useAuthStore((s) => s.user);
  const baseCurrency: string = currentUser?.currency ?? 'MAD';

  const [currencySell] = useState<string>(baseCurrency);
  const [currencyBuy, setCurrencyBuy] = useState<string>(
    baseCurrency === 'MAD' ? 'GNF' : 'MAD'
  );

  const [amountSell, setAmountSell] = useState('');
  const [amountBuy, setAmountBuy] = useState('');
  const [lastEdited, setLastEdited] = useState<'sell' | 'buy'>('sell');

  const [marketRate, setMarketRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [loading, setLoading] = useState(false);

  // Pulse animation pour le taux quand il se charge
  const ratePulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (loadingRate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ratePulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(ratePulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      ratePulse.stopAnimation();
      ratePulse.setValue(1);
    }
  }, [loadingRate, ratePulse]);

  const fetchRate = useCallback(async () => {
    setLoadingRate(true);
    try {
      const rates = await offersService.exchangeRates(currencySell);
      const rate = rates[currencyBuy] ?? null;
      setMarketRate(rate ? Number(rate) : null);
    } catch {
      setMarketRate(null);
    } finally {
      setLoadingRate(false);
    }
  }, [currencySell, currencyBuy]);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  const handleChangeCurrencyBuy = (code: string) => {
    setCurrencyBuy(code);
    setAmountBuy('');
    setAmountSell('');
  };

  // Calcul auto bidirectionnel
  useEffect(() => {
    if (lastEdited !== 'sell') return;
    const s = parseFloat(amountSell);
    if (!isNaN(s) && s > 0 && marketRate) {
      setAmountBuy((s * marketRate).toFixed(currencyBuy === 'GNF' || currencyBuy === 'XOF' ? 0 : 2));
    } else if (!amountSell) setAmountBuy('');
  }, [amountSell, marketRate, lastEdited, currencyBuy]);

  useEffect(() => {
    if (lastEdited !== 'buy') return;
    const b = parseFloat(amountBuy);
    if (!isNaN(b) && b > 0 && marketRate) {
      setAmountSell((b / marketRate).toFixed(2));
    } else if (!amountBuy) setAmountSell('');
  }, [amountBuy, marketRate, lastEdited]);

  const sell = parseFloat(amountSell) || 0;
  const buy = parseFloat(amountBuy) || 0;
  const userRate = sell > 0 && buy > 0 ? buy / sell : 0;

  const deviation = marketRate && userRate > 0
    ? ((userRate - marketRate) / marketRate) * 100
    : null;
  const deviationAbs = deviation != null ? Math.abs(deviation) : null;
  const deviationOk = deviationAbs == null || deviationAbs <= 15;

  const deviationColor =
    deviationAbs == null ? COLORS.text.secondary
    : deviationAbs <= 5  ? COLORS.success
    : deviationAbs <= 15 ? COLORS.warning
    : COLORS.error;

  const canSubmit = sell > 0 && buy > 0 && deviationOk && !loading;

  const handleCreate = async () => {
    if (!sell || !buy) {
      Alert.alert('Erreur', 'Veuillez entrer des montants valides');
      return;
    }
    if (!deviationOk) {
      Alert.alert('Taux hors marché', 'Votre taux dépasse ±15% du taux marché. Ajustez le montant reçu.');
      return;
    }
    setLoading(true);
    try {
      await offersService.create({
        amount_sell: sell,
        currency_sell: currencySell,
        amount_buy: buy,
        currency_buy: currencyBuy,
      });
      Alert.alert(
        'Offre publiée',
        `1 ${currencySell} = ${userRate.toFixed(2)} ${currencyBuy}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert(
        'Erreur',
        e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? "Impossible de créer l'offre"
      );
    } finally {
      setLoading(false);
    }
  };

  const baseCurrencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === currencySell);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="close" size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle offre</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Taux de marché ── */}
        <Animated.View style={[styles.rateBar, { opacity: loadingRate ? ratePulse : 1 }]}>
          <View style={styles.rateBarLeft}>
            <Icon name="trending-up" size={15} color={COLORS.primary} />
            <Text style={styles.rateBarLabel}>Taux marché</Text>
            {loadingRate ? (
              <View style={styles.rateSkeletonLine} />
            ) : marketRate ? (
              <Text style={styles.rateBarValue}>
                1 {currencySell} = {marketRate.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {currencyBuy}
              </Text>
            ) : (
              <Text style={[styles.rateBarValue, { color: COLORS.warning }]}>Indisponible</Text>
            )}
          </View>
          <View style={styles.tolerancePill}>
            <Text style={styles.toleranceText}>±15%</Text>
          </View>
        </Animated.View>

        {/* ── Carte échange ── */}
        <View style={styles.card}>
          {/* Champ ENVOIE */}
          <View style={styles.row}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>J'envoie</Text>
              <TextInput
                style={styles.bigInput}
                value={amountSell}
                onChangeText={(v) => { setLastEdited('sell'); setAmountSell(v.replace(',', '.')); }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={COLORS.neutral[300]}
                returnKeyType="done"
              />
              {sell > 0 && <Text style={styles.subText}>{formatCurrency(sell, currencySell)}</Text>}
            </View>
            {/* Badge devise locked */}
            <View style={styles.badgeLocked}>
              <Text style={styles.badgeFlag}>{baseCurrencyInfo?.flag ?? '🏳️'}</Text>
              <Text style={styles.badgeCode}>{currencySell}</Text>
              <View style={styles.lockIcon}>
                <Icon name="lock-closed" size={9} color={COLORS.primary} />
              </View>
            </View>
          </View>

          {/* Divider avec icône swap */}
          <View style={styles.swapRow}>
            <View style={styles.swapLine} />
            <View style={styles.swapCircle}>
              <Icon name="swap-vertical" size={15} color={COLORS.primary} />
            </View>
            <View style={styles.swapLine} />
          </View>

          {/* Champ REÇOIT */}
          <View style={styles.row}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Je reçois</Text>
              <TextInput
                style={styles.bigInput}
                value={amountBuy}
                onChangeText={(v) => { setLastEdited('buy'); setAmountBuy(v.replace(',', '.')); }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={COLORS.neutral[300]}
                returnKeyType="done"
              />
              {buy > 0 && <Text style={styles.subText}>{formatCurrency(buy, currencyBuy)}</Text>}
            </View>
            {/* Picker devise */}
            <CurrencyPicker
              value={currencyBuy}
              exclude={currencySell}
              onChange={handleChangeCurrencyBuy}
            />
          </View>
        </View>

        {/* ── Indicateur déviation ── */}
        {sell > 0 && buy > 0 && (
          <View style={[
            styles.deviationRow,
            { backgroundColor: deviationColor + '14', borderColor: deviationColor + '35' },
          ]}>
            <Icon
              name={deviationOk ? (deviationAbs! <= 5 ? 'checkmark-circle' : 'information-circle') : 'warning'}
              size={16}
              color={deviationColor}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.deviationRate, { color: deviationColor }]}>
                Votre taux : 1 {currencySell} = {userRate.toFixed(2)} {currencyBuy}
              </Text>
              {deviation != null && (
                <Text style={[styles.deviationSub, { color: deviationColor }]}>
                  {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}% vs marché
                  {deviationAbs! > 15 ? ' · dépasse la limite !' : deviationAbs! > 5 ? ' · taux personnalisé' : ' · taux optimal'}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ── Bouton publier ── */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnOff]}
          onPress={handleCreate}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="megaphone-outline" size={17} color="#fff" />
              <Text style={styles.submitText}>Publier l'offre</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Votre offre sera visible par les utilisateurs ayant la devise correspondante.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  backBtn: {
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
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  scroll: { padding: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: 48 },

  // Barre taux marché
  rateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginBottom: SPACING.md,
  },
  rateBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rateBarLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  rateBarValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  rateSkeletonLine: {
    width: 120,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.neutral[200],
  },
  tolerancePill: {
    backgroundColor: COLORS.soft.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  toleranceText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },

  // Carte échange principale
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  fieldWrap: { flex: 1 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bigInput: {
    fontSize: 30,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    padding: 0,
    minHeight: 40,
  },
  subText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  // Badge devise locked
  badgeLocked: {
    alignItems: 'center',
    backgroundColor: COLORS.soft.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 68,
    gap: 2,
  },
  badgeFlag: { fontSize: 20 },
  badgeCode: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  lockIcon: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 2,
  },

  // Divider swap
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  swapLine: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  swapCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },

  // Picker bouton devise
  pickerBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 68,
    gap: 2,
  },
  pickerFlag: { fontSize: 20 },
  pickerCode: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  // Overlay + sheet
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 32,
    paddingTop: SPACING.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.neutral[200],
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 2,
  },
  sheetItemActive: { backgroundColor: COLORS.soft.primary },
  sheetItemFlag: { fontSize: 26 },
  sheetItemCode: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  sheetItemLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 1,
  },

  // Indicateur déviation
  deviationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },
  deviationRate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  deviationSub: {
    fontSize: 11,
    marginTop: 2,
  },

  // Bouton
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  submitBtnOff: { opacity: 0.4, shadowOpacity: 0 },
  submitText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#fff',
  },

  hint: {
    fontSize: 11,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 17,
  },
});

export default CreateOfferScreen;
