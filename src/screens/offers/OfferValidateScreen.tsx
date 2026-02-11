import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OfferStackParamList } from '@/types/navigation.types';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { offersService } from '@/services/api/offerService';
import { formatCurrency } from '@/utils/formatters';
import { Offer } from '@/types/offer.types';

type Props = NativeStackScreenProps<OfferStackParamList, 'OfferValidate'>;

// Indicatifs téléphoniques par pays
const COUNTRY_CODES = [
  { code: '+212', country: 'MA', flag: '🇲🇦', name: 'Maroc', currencies: ['MAD'] },
  { code: '+224', country: 'GN', flag: '🇬🇳', name: 'Guinée', currencies: ['GNF'] },
  { code: '+221', country: 'SN', flag: '🇸🇳', name: 'Sénégal', currencies: ['XOF'] },
  { code: '+225', country: 'CI', flag: '🇨🇮', name: 'Côte d\'Ivoire', currencies: ['XOF'] },
  { code: '+223', country: 'ML', flag: '🇲🇱', name: 'Mali', currencies: ['XOF'] },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France', currencies: ['EUR'] },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Espagne', currencies: ['EUR'] },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'États-Unis', currencies: ['USD'] },
];

// Trouver le pays correspondant à une devise
const getCountryByCurrency = (currency: string) => {
  return COUNTRY_CODES.find(c => c.currencies.includes(currency)) || COUNTRY_CODES[0];
};

const OfferValidateScreen: React.FC<Props> = ({ navigation, route }) => {
  const { offerId } = route.params;

  // États
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(true);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRY_CODES[0] | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Charger les détails de l'offre
  const fetchOffer = useCallback(async () => {
    try {
      const data = await offersService.detail(offerId);
      setOffer(data);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      // Auto-sélectionner le pays basé sur la devise de destination (ce que le vendeur reçoit = currency_buy)
      const destinationCurrency = data.currency_buy;
      const matchedCountry = getCountryByCurrency(destinationCurrency);
      setSelectedCountry(matchedCountry);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger l\'offre');
      navigation.goBack();
    } finally {
      setLoadingOffer(false);
    }
  }, [offerId, navigation, slideAnim, fadeAnim]);

  useEffect(() => {
    fetchOffer();
  }, [fetchOffer]);

  // Formatage du numéro de téléphone
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    return formatted.slice(0, 14);
  };

  // Validation du numéro
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 8) {
      setPhoneError('Le numéro doit contenir au moins 8 chiffres');
      return false;
    }
    if (cleaned.length > 12) {
      setPhoneError('Le numéro est trop long');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    if (phoneError && formatted.replace(/\s/g, '').length >= 8) {
      setPhoneError(null);
    }
  };

  const getFullPhoneNumber = (): string => {
    return `${selectedCountry?.code || '+212'}${phoneNumber.replace(/\s/g, '')}`;
  };

  const onSubmit = async () => {
    Keyboard.dismiss();
    
    if (!validatePhone(phoneNumber)) {
      return;
    }

    const fullPhone = getFullPhoneNumber();
    
    setLoading(true);
    try {
      await offersService.validate(offerId, {
        beneficiary_name: beneficiaryName.trim() || undefined,
        beneficiary_phone: fullPhone,
      });

      Alert.alert(
        '✅ Offre validée',
        'Les fonds sont maintenant verrouillés en escrow. Les bénéficiaires doivent confirmer pour finaliser l\'échange.',
        [
          { text: 'Voir les détails', onPress: () => navigation.replace('OfferDetails', { offerId }) },
        ]
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ??
        e?.response?.data?.message ??
        e?.message ??
        "Impossible de valider l'offre";
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loadingOffer) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de l'offre…</Text>
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.loadingScreen}>
        <Icon name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={[styles.loadingText, { color: COLORS.error }]}>Offre introuvable</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Validation vendeur</Text>
        <View style={[styles.statusBadge, { backgroundColor: COLORS.soft.warning }]}>
          <Text style={[styles.statusText, { color: COLORS.warning }]}>Acceptée</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Résumé de l'offre */}
        <Animated.View
          style={[
            styles.offerSummary,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View>
              <Text style={styles.summaryTitle}>Étape 2 : Validation</Text>
              <Text style={styles.summarySubtitle}>
                L'acheteur a accepté votre offre
              </Text>
            </View>
          </View>

          <View style={styles.amountsRow}>
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>VOUS VENDEZ</Text>
              <Text style={styles.amountValue}>{formatCurrency(offer.amount_sell, offer.currency_sell)}</Text>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyText}>{offer.currency_sell}</Text>
              </View>
            </View>

            <View style={styles.arrowCircle}>
              <Icon name="arrow-forward" size={18} color={COLORS.text.white} />
            </View>

            <View style={[styles.amountBlock, { alignItems: 'flex-end' }]}>
              <Text style={styles.amountLabel}>VOUS RECEVEZ (B2)</Text>
              <Text style={[styles.amountValue, { color: COLORS.primary }]}>{formatCurrency(offer.amount_buy, offer.currency_buy)}</Text>
              <View style={[styles.currencyBadge, { backgroundColor: COLORS.soft.primary }]}>
                <Text style={[styles.currencyText, { color: COLORS.primary }]}>{offer.currency_buy}</Text>
              </View>
            </View>
          </View>

          {/* Acheteur info */}
          {offer.accepted_by && (
            <View style={styles.buyerInfo}>
              <View style={styles.buyerAvatar}>
                <Text style={styles.buyerAvatarText}>
                  {(offer.accepted_by.first_name ?? 'A')[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.buyerLabel}>Acheteur (A2)</Text>
                <Text style={styles.buyerName}>
                  {offer.accepted_by.first_name} {offer.accepted_by.last_name}
                </Text>
              </View>
              <Icon name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
          )}
        </Animated.View>

        {/* Formulaire bénéficiaire */}
        <View style={styles.formSection}>
          <View style={styles.formHeader}>
            <View style={[styles.formIconCircle, { backgroundColor: COLORS.soft.secondary }]}>
              <Icon name="wallet-outline" size={18} color={COLORS.secondary} />
            </View>
            <View>
              <Text style={styles.formTitle}>Votre bénéficiaire (B2)</Text>
              <Text style={styles.formSubtitle}>
                Qui recevra les {formatCurrency(offer.amount_buy, offer.currency_buy)} ?
              </Text>
            </View>
          </View>

          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Nom complet <Text style={styles.optionalTag}>(optionnel)</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Icon name="person-outline" size={18} color={COLORS.text.disabled} />
              </View>
              <TextInput
                style={styles.textInput}
                value={beneficiaryName}
                onChangeText={setBeneficiaryName}
                placeholder="Ex: Mohamed Benali"
                placeholderTextColor={COLORS.text.disabled}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Numéro de téléphone <Text style={styles.requiredTag}>*</Text>
            </Text>
            <View style={[
              styles.phoneInputRow,
              phoneFocused && styles.phoneInputRowFocused,
              phoneError && styles.phoneInputRowError,
            ]}>
              <TouchableOpacity
                style={styles.countrySelector}
                onPress={() => setShowCountryPicker(!showCountryPicker)}
              >
                <Text style={styles.countryFlag}>{selectedCountry?.flag || '🌍'}</Text>
                <Text style={styles.countryCode}>{selectedCountry?.code || '+...'}</Text>
                <Icon name="chevron-down" size={14} color={COLORS.text.secondary} />
              </TouchableOpacity>

              <View style={styles.phoneDivider} />

              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                placeholder="6XX XXX XXX"
                placeholderTextColor={COLORS.text.disabled}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => {
                  setPhoneFocused(false);
                  if (phoneNumber) validatePhone(phoneNumber);
                }}
              />

              {phoneNumber.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setPhoneNumber('');
                    setPhoneError(null);
                  }}
                >
                  <Icon name="close-circle" size={18} color={COLORS.text.disabled} />
                </TouchableOpacity>
              )}
            </View>

            {phoneError && (
              <View style={styles.errorRow}>
                <Icon name="alert-circle" size={14} color={COLORS.error} />
                <Text style={styles.errorText}>{phoneError}</Text>
              </View>
            )}

            {phoneNumber.replace(/\s/g, '').length >= 6 && !phoneError && selectedCountry && (
              <View style={styles.phonePreview}>
                <Icon name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.phonePreviewText}>
                  Numéro complet: <Text style={{ fontWeight: '600' }}>{getFullPhoneNumber()}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Country picker dropdown */}
          {showCountryPicker && (
            <View style={styles.countryDropdown}>
              {(() => {
                const filteredCountries = COUNTRY_CODES.filter(c => c.currencies.includes(offer?.currency_buy || ''));
                const countriesToShow = filteredCountries.length > 0 ? filteredCountries : COUNTRY_CODES;
                return countriesToShow.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryOption,
                      selectedCountry?.code === country.code && styles.countryOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedCountry(country);
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text style={styles.countryFlagLarge}>{country.flag}</Text>
                    <Text style={styles.countryName}>{country.name}</Text>
                    <Text style={styles.countryCodeSmall}>{country.code}</Text>
                    {selectedCountry?.code === country.code && (
                      <Icon name="checkmark" size={16} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ));
              })()}
            </View>
          )}
        </View>

        {/* Flow explanation */}
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>Prochaines étapes</Text>
          <View style={styles.flowStep}>
            <View style={styles.flowDot} />
            <Text style={styles.flowText}>
              Votre bénéficiaire (B2) et celui de l'acheteur (B1) devront confirmer
            </Text>
          </View>
          <View style={styles.flowStep}>
            <View style={[styles.flowDot, { backgroundColor: COLORS.neutral[300] }]} />
            <Text style={[styles.flowText, { color: COLORS.text.disabled }]}>
              Une fois les deux confirmations reçues, l'échange sera exécuté automatiquement
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={loading ? 'Validation en cours…' : 'Valider l\'offre'}
          onPress={onSubmit}
          fullWidth
          disabled={loading || phoneNumber.replace(/\s/g, '').length < 8}
        />
        <Text style={styles.footerNote}>
          Les fonds seront bloqués en escrow après validation
        </Text>
      </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Offer summary
  offerSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow.color,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  summarySubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  amountBlock: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 9,
    color: COLORS.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  currencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 4,
  },
  currencyText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  buyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.soft.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  buyerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyerAvatarText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  buyerLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  buyerName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },

  // Form section
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  formIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  formSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  // Input group
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  optionalTag: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.disabled,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  requiredTag: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },

  // Phone input
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  phoneInputRowFocused: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
  },
  phoneInputRowError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.soft.error,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: 6,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  phoneDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
  clearBtn: {
    padding: SPACING.sm,
    marginRight: SPACING.xs,
  },

  // Errors & previews
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
  },
  phonePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.soft.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  phonePreviewText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
  },

  // Country dropdown
  countryDropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
    overflow: 'hidden',
    shadowColor: COLORS.shadow.color,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  countryOptionActive: {
    backgroundColor: COLORS.soft.secondary,
  },
  countryFlagLarge: {
    fontSize: 20,
  },
  countryName: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
  },
  countryCodeSmall: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Flow card
  flowCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flowTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  flowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  flowText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.disabled,
    marginTop: SPACING.sm,
  },
});

export default OfferValidateScreen;
