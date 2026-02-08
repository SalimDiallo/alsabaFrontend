import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KycStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { profileService } from '@/services/api/profileService';
import { TouchableOpacity } from 'react-native';

type Props = NativeStackScreenProps<KycStackParamList, 'KycConfirm'>;

type KycStatus = 'review' | 'pending' | 'verified' | 'rejected';

// Composant Step Indicator
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
      <Text style={stepStyles.labelCompleted}>Document</Text>
      <Text style={stepStyles.labelCompleted}>Photos</Text>
      <Text style={stepStyles.labelActive}>Confirmation</Text>
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
  labelCompleted: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
    flex: 1,
  },
});

// Status Config
const getStatusConfig = (status: KycStatus) => {
  switch (status) {
    case 'verified':
      return {
        icon: 'checkmark-circle' as const,
        color: COLORS.success,
        bgColor: COLORS.soft.success,
        title: 'Identité vérifiée',
        subtitle: 'Votre compte est maintenant vérifié.',
      };
    case 'pending':
      return {
        icon: 'time-outline' as const,
        color: COLORS.warning,
        bgColor: COLORS.soft.warning,
        title: 'Vérification en cours',
        subtitle: 'Nous examinons votre dossier. Vous serez notifié du résultat.',
      };
    case 'rejected':
      return {
        icon: 'close-circle' as const,
        color: COLORS.error,
        bgColor: COLORS.soft.error,
        title: 'Vérification échouée',
        subtitle: 'Votre document n\'a pas pu être vérifié. Veuillez réessayer.',
      };
    default:
      return {
        icon: 'shield-checkmark-outline' as const,
        color: COLORS.primary,
        bgColor: COLORS.soft.primary,
        title: 'Prêt à soumettre',
        subtitle: 'Vérifiez vos documents avant de les envoyer.',
      };
  }
};

const KycConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const { documentType, frontUri, backUri, selfieUri } = route.params;

  const { setKycStatus } = useAuthStore();

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<KycStatus>('review');

  const docLabel =
    documentType === 'id_card'
      ? "Carte d'identité"
      : documentType === 'passport'
      ? 'Passeport'
      : 'Permis de conduire';

  const statusConfig = getStatusConfig(status);

  const submit = async () => {
    setSubmitting(true);
    try {
      setStatus('pending');
      await setKycStatus('pending');

      const result = await profileService.submitKyc({
        document_type: documentType,
        front_image: { uri: frontUri, name: 'front.jpg', type: 'image/jpeg' },
        back_image: backUri
          ? { uri: backUri, name: 'back.jpg', type: 'image/jpeg' }
          : undefined,
      });

      if (result.success && result.kyc_status === 'verified') {
        await setKycStatus('verified');
        setStatus('verified');
      } else if (result.success === false) {
        await setKycStatus('rejected');
        setStatus('rejected');
      } else {
        setStatus('pending');
      }
    } catch (error: any) {
      await setKycStatus('unverified');
      setStatus('review');

      // Gestion spécifique de l'erreur 429 (Too Many Requests)
      const statusCode = error?.response?.status;
      const errorCode = error?.response?.data?.code;
      const retryAfter = error?.response?.data?.retry_after;

      if (statusCode === 429 || errorCode === 'kyc_rate_limited' || errorCode === 'kyc_global_rate_limited') {
        const retryMinutes = retryAfter ? Math.ceil(retryAfter / 60) : 60;
        Alert.alert(
          'Limite atteinte',
          `Vous avez effectué trop de tentatives de vérification. Veuillez réessayer dans ${retryMinutes} minute(s).`,
          [{ text: 'Compris', style: 'default' }]
        );
      } else {
        const msg =
          error?.response?.data?.error ??
          error?.response?.data?.message ??
          'Impossible de soumettre le document. Vérifiez votre connexion.';
        Alert.alert('Erreur', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    navigation.getParent?.()?.goBack?.();
    navigation.popToTop();
  };

  const handleRetry = () => {
    setStatus('review');
  };

  return (
    <Screen padding={false} scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          disabled={submitting || status === 'pending'}
        >
          <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      <StepIndicator currentStep={3} totalSteps={3} />

      {/* Content */}
      <View style={styles.content}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusConfig.bgColor }]}>
          <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.color }]}>
            <Icon name={statusConfig.icon} size={32} color={COLORS.text.white} />
          </View>
          <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
            {statusConfig.title}
          </Text>
          <Text style={styles.statusSubtitle}>{statusConfig.subtitle}</Text>
          
          {submitting && (
            <ActivityIndicator 
              size="small" 
              color={statusConfig.color} 
              style={{ marginTop: SPACING.md }} 
            />
          )}
        </View>

        {/* Document Summary */}
        {status === 'review' && (
          <>
            <Text style={styles.sectionTitle}>Récapitulatif</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Type de document</Text>
                <Text style={styles.summaryValue}>{docLabel}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.imagesPreview}>
                <View style={styles.imageItem}>
                  <Image source={{ uri: frontUri }} style={styles.docThumb} />
                  <Text style={styles.imageLabel}>
                    {documentType === 'passport' ? 'Page ID' : 'Recto'}
                  </Text>
                </View>
                
                {backUri && (
                  <View style={styles.imageItem}>
                    <Image source={{ uri: backUri }} style={styles.docThumb} />
                    <Text style={styles.imageLabel}>Verso</Text>
                  </View>
                )}
                
                <View style={styles.imageItem}>
                  <Image source={{ uri: selfieUri }} style={[styles.docThumb, styles.selfieThumb]} />
                  <Text style={styles.imageLabel}>Selfie</Text>
                </View>
              </View>
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Icon name="lock-closed-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.securityText}>
                Vos documents sont chiffrés et traités de manière sécurisée.
              </Text>
            </View>
          </>
        )}

        {/* Success Message */}
        {status === 'verified' && (
          <View style={styles.successMessage}>
            <Icon name="shield-checkmark" size={48} color={COLORS.success} />
            <Text style={styles.successTitle}>Félicitations !</Text>
            <Text style={styles.successText}>
              Votre identité a été vérifiée avec succès. Vous avez maintenant accès à toutes les fonctionnalités.
            </Text>
          </View>
        )}

        {/* Pending Message */}
        {status === 'pending' && !submitting && (
          <View style={styles.pendingMessage}>
            <Text style={styles.pendingTitle}>Que se passe-t-il ensuite ?</Text>
            <View style={styles.pendingStep}>
              <View style={styles.pendingStepNumber}>
                <Text style={styles.pendingStepNumberText}>1</Text>
              </View>
              <Text style={styles.pendingStepText}>Notre équipe examine votre dossier</Text>
            </View>
            <View style={styles.pendingStep}>
              <View style={styles.pendingStepNumber}>
                <Text style={styles.pendingStepNumberText}>2</Text>
              </View>
              <Text style={styles.pendingStepText}>Vous recevrez une notification</Text>
            </View>
            <View style={styles.pendingStep}>
              <View style={styles.pendingStepNumber}>
                <Text style={styles.pendingStepNumberText}>3</Text>
              </View>
              <Text style={styles.pendingStepText}>Délai estimé : 24-48 heures</Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {status === 'review' && (
          <Button
            title={submitting ? 'Envoi en cours...' : 'Soumettre pour vérification'}
            onPress={submit}
            fullWidth
            size="large"
            disabled={submitting}
          />
        )}
        
        {status === 'verified' && (
          <Button
            title="Terminer"
            onPress={handleFinish}
            fullWidth
            size="large"
          />
        )}
        
        {status === 'pending' && !submitting && (
          <Button
            title="Retour à l'accueil"
            onPress={handleFinish}
            fullWidth
            size="large"
            variant="outline"
          />
        )}
        
        {status === 'rejected' && (
          <Button
            title="Réessayer"
            onPress={handleRetry}
            fullWidth
            size="large"
          />
        )}
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

  // Status Card
  statusCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  statusSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Section Title
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  imagesPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  imageItem: {
    alignItems: 'center',
  },
  docThumb: {
    width: 72,
    height: 54,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.neutral[100],
  },
  selfieThumb: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  imageLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },

  // Security Note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
  },
  securityText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },

  // Success Message
  successMessage: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  successText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Pending Message
  pendingMessage: {
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.lg,
  },
  pendingTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  pendingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pendingStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  pendingStepNumberText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  pendingStepText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
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

export default KycConfirmScreen;
