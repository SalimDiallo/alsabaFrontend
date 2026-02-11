import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

import { useMockDb } from '@/store/useMockDb';
import { RootStackParamList } from '@/types/navigation.types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;

type PaymentMethodType = 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';

interface PaymentMethodField {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  maxLength?: number;
  type?: 'text' | 'select';
  options?: Array<{ value: string; label: string; icon?: string }>;
}

interface PaymentMethodConfig {
  type: PaymentMethodType;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  fields: PaymentMethodField[];
}

const PAYMENT_METHODS_CONFIG: PaymentMethodConfig[] = [
  {
    type: 'CARD',
    title: 'Carte bancaire',
    description: 'Visa, Mastercard, etc.',
    icon: 'card-outline',
    color: COLORS.primary,
    bgColor: COLORS.soft.primary,
    fields: [
      { key: 'cardNumber', label: 'Numéro de carte', placeholder: '•••• •••• •••• ••••', keyboardType: 'numeric', maxLength: 19 },
      { key: 'cardHolder', label: 'Titulaire de la carte', placeholder: 'NOM PRÉNOM' },
      { key: 'expiry', label: 'Date d\'expiration', placeholder: 'MM/AA', maxLength: 5 },
      { key: 'cvv', label: 'CVV', placeholder: '•••', keyboardType: 'numeric', maxLength: 4 },
    ],
  },
  {
    type: 'MOBILE_MONEY',
    title: 'Mobile Money',
    description: 'Orange Money, MTN, Wave',
    icon: 'phone-portrait-outline',
    color: COLORS.warning,
    bgColor: COLORS.soft.warning,
    fields: [
      { 
        key: 'provider', 
        label: 'Opérateur', 
        placeholder: 'Sélectionnez un opérateur',
        type: 'select',
        options: [
          { value: 'orange_money', label: 'Orange Money', icon: '🟠' },
          { value: 'mtn_money', label: 'MTN Mobile Money', icon: '🟡' },
        ]
      },
      { key: 'phoneNumber', label: 'Numéro de téléphone', placeholder: '+224 XXX XX XX XX', keyboardType: 'phone-pad' },
      { key: 'accountName', label: 'Nom du compte', placeholder: 'Nom associé au compte' },
    ],
  },
  {
    type: 'BANK_TRANSFER',
    title: 'Virement bancaire',
    description: 'Compte bancaire classique',
    icon: 'business-outline',
    color: COLORS.info,
    bgColor: COLORS.soft.secondary,
    fields: [
      { key: 'bankName', label: 'Nom de la banque', placeholder: 'Ex: BICIGUI' },
      { key: 'accountNumber', label: 'Numéro de compte', placeholder: 'IBAN ou numéro de compte' },
      { key: 'accountHolder', label: 'Titulaire du compte', placeholder: 'Nom du titulaire' },
      { key: 'swiftCode', label: 'Code SWIFT (optionnel)', placeholder: 'XXXXXXXX' },
    ],
  },
];

const PaymentMethodsScreen: React.FC<Props> = ({ navigation }) => {
  const methods = useMockDb((s) => s.paymentMethods);
  const addPaymentMethod = useMockDb((s) => s.addPaymentMethod);
  const removePaymentMethod = useMockDb((s) => s.removePaymentMethod);
  const setDefaultPaymentMethod = useMockDb((s) => s.setDefaultPaymentMethod);

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<PaymentMethodConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSelectType = (config: PaymentMethodConfig) => {
    setSelectedType(config);
    setFormData({});
    setShowTypeSelector(false);
    setShowAddForm(true);
  };

  const handleSave = async () => {
    if (!selectedType) return;

    // Vérifier les champs requis
    const requiredFields = selectedType.fields.filter(f => !f.label.includes('optionnel'));
    const missingFields = requiredFields.filter(f => !formData[f.key]?.trim());
    
    if (missingFields.length > 0) {
      Alert.alert('Champs manquants', `Veuillez remplir: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    
    // Créer un label basé sur les données
    let label = '';
    if (selectedType.type === 'CARD') {
      const lastFour = formData.cardNumber?.slice(-4) || '****';
      label = `Carte •••• ${lastFour}`;
    } else if (selectedType.type === 'MOBILE_MONEY') {
      // Trouver le label de l'opérateur sélectionné
      const providerField = selectedType.fields.find(f => f.key === 'provider');
      const providerOption = providerField?.options?.find(o => o.value === formData.provider);
      const providerLabel = providerOption?.label || 'Mobile Money';
      label = `${providerLabel} - ${formData.phoneNumber?.slice(-8) || ''}`;
    } else {
      label = `${formData.bankName || 'Banque'} - ${formData.accountNumber?.slice(-4) || '****'}`;
    }

    addPaymentMethod(selectedType.type, label);
    
    setSaving(false);
    setShowAddForm(false);
    setSelectedType(null);
    setFormData({});
  };

  const handleSetDefault = (id: string) => {
    setDefaultPaymentMethod(id);
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      'Supprimer ce moyen de paiement ?', 
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => removePaymentMethod(id),
        },
      ]
    );
  };

  const getMethodConfig = (type: PaymentMethodType) => {
    return PAYMENT_METHODS_CONFIG.find(c => c.type === type) || PAYMENT_METHODS_CONFIG[0];
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleFieldChange = (key: string, value: string) => {
    let formattedValue = value;
    
    if (key === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (key === 'expiry') {
      formattedValue = formatExpiry(value);
    }
    
    setFormData(prev => ({ ...prev, [key]: formattedValue }));
  };

  return (
    <Screen padding={false} scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moyens de paiement</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowTypeSelector(true)}
          activeOpacity={0.7}
        >
          <Icon name="add" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Liste des méthodes */}
        {methods.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="wallet-outline" size={48} color={COLORS.neutral[400]} />
            </View>
            <Text style={styles.emptyTitle}>Aucun moyen de paiement</Text>
            <Text style={styles.emptyText}>
              Ajoutez une carte, un compte Mobile Money ou un compte bancaire pour faciliter vos transactions.
            </Text>
            <Button
              title="Ajouter un moyen de paiement"
              onPress={() => setShowTypeSelector(true)}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Vos moyens de paiement</Text>
            
            {methods.map((method) => {
              const config = getMethodConfig(method.type as PaymentMethodType);
              
              return (
                <View key={method.id} style={styles.methodCard}>
                  <View style={styles.methodRow}>
                    <View style={[styles.methodIconContainer, { backgroundColor: config.bgColor }]}>
                      <Icon name={config.icon as any} size={22} color={config.color} />
                    </View>
                    
                    <View style={styles.methodInfo}>
                      <View style={styles.methodTitleRow}>
                        <Text style={styles.methodLabel}>{method.label}</Text>
                        {method.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Par défaut</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.methodType}>{config.title}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(method.id)}
                        style={styles.setDefaultButton}
                        activeOpacity={0.7}
                      >
                        <Icon name="star-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.setDefaultText}>Définir par défaut</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      onPress={() => handleRemove(method.id)}
                      style={styles.removeButton}
                      activeOpacity={0.7}
                    >
                      <Icon name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={styles.removeText}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Bouton ajouter en bas */}
            <TouchableOpacity
              style={styles.addMethodCard}
              onPress={() => setShowTypeSelector(true)}
              activeOpacity={0.7}
            >
              <View style={styles.addMethodIcon}>
                <Icon name="add" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.addMethodText}>Ajouter un nouveau moyen</Text>
              <Icon name="chevron-forward" size={20} color={COLORS.neutral[400]} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Modal de sélection du type */}
      <Modal
        visible={showTypeSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTypeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un type</Text>
              <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
                <Icon name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.typeList}>
              {PAYMENT_METHODS_CONFIG.map((config) => (
                <TouchableOpacity
                  key={config.type}
                  style={styles.typeCard}
                  onPress={() => handleSelectType(config)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.typeIcon, { backgroundColor: config.bgColor }]}>
                    <Icon name={config.icon as any} size={24} color={config.color} />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeTitle}>{config.title}</Text>
                    <Text style={styles.typeDesc}>{config.description}</Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de formulaire */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddForm(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.formModalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedType?.title}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              {/* Info du type sélectionné */}
              {selectedType && (
                <View style={[styles.selectedTypeInfo, { backgroundColor: selectedType.bgColor }]}>
                  <Icon name={selectedType.icon as any} size={20} color={selectedType.color} />
                  <Text style={[styles.selectedTypeText, { color: selectedType.color }]}>
                    {selectedType.description}
                  </Text>
                </View>
              )}

              {/* Champs du formulaire */}
              {selectedType?.fields.map((field) => (
                <View key={field.key} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  
                  {field.type === 'select' && field.options ? (
                    // Sélecteur d'options
                    <View style={styles.selectContainer}>
                      {field.options.map((option) => {
                        const isSelected = formData[field.key] === option.value;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.selectOption,
                              isSelected && styles.selectOptionSelected,
                            ]}
                            onPress={() => handleFieldChange(field.key, option.value)}
                            activeOpacity={0.7}
                          >
                            {option.icon && (
                              <Text style={styles.selectOptionIcon}>{option.icon}</Text>
                            )}
                            <Text style={[
                              styles.selectOptionText,
                              isSelected && styles.selectOptionTextSelected,
                            ]}>
                              {option.label}
                            </Text>
                            {isSelected && (
                              <Icon name="checkmark-circle" size={20} color={COLORS.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    // Champ texte standard
                    <TextInput
                      style={styles.textInput}
                      placeholder={field.placeholder}
                      placeholderTextColor={COLORS.neutral[400]}
                      value={formData[field.key] || ''}
                      onChangeText={(value) => handleFieldChange(field.key, value)}
                      keyboardType={field.keyboardType || 'default'}
                      maxLength={field.maxLength}
                      autoCapitalize={field.key === 'cardHolder' || field.key === 'accountHolder' ? 'characters' : 'none'}
                      secureTextEntry={field.key === 'cvv'}
                    />
                  )}
                </View>
              ))}

              {/* Note de sécurité */}
              <View style={styles.securityNote}>
                <Icon name="shield-checkmark-outline" size={16} color={COLORS.success} />
                <Text style={styles.securityText}>
                  Vos informations sont sécurisées et chiffrées.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.formFooter}>
              <Button
                title={saving ? 'Enregistrement...' : 'Enregistrer'}
                onPress={handleSave}
                fullWidth
                size="large"
                disabled={saving}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.lg,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Section
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },

  // Method Card
  methodCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  methodLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  defaultBadge: {
    backgroundColor: COLORS.soft.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.success,
  },
  methodType: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  setDefaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  setDefaultText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  removeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Add Method Card
  addMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginTop: SPACING.sm,
  },
  addMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMethodText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: SPACING.xl,
  },
  formModalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },

  // Type List
  typeList: {
    padding: SPACING.md,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  typeTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  typeDesc: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  // Form
  formScroll: {
    padding: SPACING.lg,
  },
  selectedTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  selectedTypeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  
  // Select Options
  selectContainer: {
    gap: SPACING.sm,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  selectOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.soft.primary,
  },
  selectOptionIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  selectOptionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  selectOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.soft.success,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  securityText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
  },
  formFooter: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
});

export default PaymentMethodsScreen;
