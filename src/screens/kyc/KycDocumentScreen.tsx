import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KycStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

type Props = NativeStackScreenProps<KycStackParamList, 'KycDocument'>;

type DocType = 'id_card' | 'passport' | 'drivers_license';

// Composant Step Indicator réutilisable
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <View style={stepStyles.container}>
    <View style={stepStyles.stepsRow}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <React.Fragment key={index}>
            <View style={[
              stepStyles.stepCircle,
              isCompleted && stepStyles.stepCompleted,
              isCurrent && stepStyles.stepCurrent,
            ]}>
              {isCompleted ? (
                <Icon name="checkmark" size={14} color={COLORS.text.white} />
              ) : (
                <Text style={[
                  stepStyles.stepNumber,
                  isCurrent && stepStyles.stepNumberCurrent,
                ]}>
                  {stepNumber}
                </Text>
              )}
            </View>
            {index < totalSteps - 1 && (
              <View style={[
                stepStyles.stepLine,
                isCompleted && stepStyles.stepLineCompleted,
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
    <View style={stepStyles.labelsRow}>
      <Text style={stepStyles.labelActive}>Document</Text>
      <Text style={stepStyles.label}>Photos</Text>
      <Text style={stepStyles.label}>Confirmation</Text>
    </View>
  </View>
);

const stepStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: COLORS.success,
  },
  stepCurrent: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
  },
  stepNumberCurrent: {
    color: COLORS.text.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.neutral[200],
    marginHorizontal: SPACING.xs,
  },
  stepLineCompleted: {
    backgroundColor: COLORS.success,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    flex: 1,
  },
  labelActive: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
    flex: 1,
  },
});

const KycDocumentScreen: React.FC<Props> = ({ navigation }) => {
  const [docType, setDocType] = useState<DocType>('id_card');

  const documents: Array<{ id: DocType; label: string; desc: string; icon: any }> = [
    { id: 'id_card', label: "Carte d'identité nationale", desc: 'Recto et verso requis', icon: 'card-outline' },
    { id: 'passport', label: 'Passeport', desc: 'Page avec photo uniquement', icon: 'document-text-outline' },
    { id: 'drivers_license', label: 'Permis de conduire', desc: 'Recto et verso requis', icon: 'car-outline' },
  ];

  return (
    <Screen padding={false} scrollable>
      {/* Header minimaliste */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification d'identité</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Indicateur d'étapes */}
      <StepIndicator currentStep={1} totalSteps={3} />

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Icône principale */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Icon name="shield-checkmark-outline" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>Choisissez votre document</Text>
          <Text style={styles.heroSubtitle}>
            Sélectionnez le type de document officiel que vous souhaitez utiliser pour vérifier votre identité.
          </Text>
        </View>

        {/* Liste des documents */}
        <View style={styles.documentList}>
          {documents.map((doc) => {
            const isSelected = docType === doc.id;
            return (
              <TouchableOpacity
                key={doc.id}
                style={[styles.documentCard, isSelected && styles.documentCardSelected]}
                onPress={() => setDocType(doc.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.documentIconContainer, isSelected && styles.documentIconSelected]}>
                  <Icon 
                    name={doc.icon} 
                    size={24} 
                    color={isSelected ? COLORS.primary : COLORS.text.secondary} 
                  />
                </View>
                
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentLabel, isSelected && styles.documentLabelSelected]}>
                    {doc.label}
                  </Text>
                  <Text style={styles.documentDesc}>{doc.desc}</Text>
                </View>
                
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Assurez-vous que votre document est valide et lisible. Le processus prend environ 2 minutes.
          </Text>
        </View>
      </View>

      {/* Footer fixe */}
      <View style={styles.footer}>
        <Button
          title="Continuer"
          onPress={() => navigation.navigate('KycUpload', { documentType: docType })}
          fullWidth
          size="large"
        />
      </View>
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
  headerSpacer: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.lg,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.soft.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },

  // Document List
  documentList: {
    gap: SPACING.sm,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  documentCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentIconSelected: {
    backgroundColor: COLORS.soft.primary,
  },
  documentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  documentLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  documentLabelSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  documentDesc: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.soft.secondary,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },

  // Footer
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
});

export default KycDocumentScreen;
