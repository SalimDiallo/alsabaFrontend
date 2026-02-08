import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { KycStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

type Props = NativeStackScreenProps<KycStackParamList, 'KycUpload'>;

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
      <Text style={stepStyles.labelActive}>Photos</Text>
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
  labelCompleted: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
    flex: 1,
  },
});

const KycUploadScreen: React.FC<Props> = ({ navigation, route }) => {
  const { documentType } = route.params;
  const needsBack = documentType !== 'passport';

  const docLabel = useMemo(() => {
    if (documentType === 'id_card') return "Carte d'identité";
    if (documentType === 'passport') return 'Passeport';
    return 'Permis de conduire';
  }, [documentType]);

  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const requestPermission = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const pickImage = async (
    kind: 'front' | 'back' | 'selfie',
    source: 'camera' | 'gallery'
  ) => {
    setUploading(kind);
    
    const granted = await requestPermission(source);
    if (!granted) {
      setUploading(null);
      Alert.alert(
        'Permission requise',
        source === 'camera'
          ? "L'accès à la caméra est nécessaire."
          : "L'accès à la galerie est nécessaire."
      );
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    };

    try {
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (kind === 'front') setFrontUri(uri);
        else if (kind === 'back') setBackUri(uri);
        else setSelfieUri(uri);
      }
    } finally {
      setUploading(null);
    }
  };

  const showPickerOptions = (kind: 'front' | 'back' | 'selfie') => {
    Alert.alert('Choisir la source', undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Prendre une photo', onPress: () => pickImage(kind, 'camera') },
      { text: 'Galerie', onPress: () => pickImage(kind, 'gallery') },
    ]);
  };

  const canContinue = !!frontUri && (needsBack ? !!backUri : true) && !!selfieUri;

  // Calculer la progression
  const completedSteps = [frontUri, needsBack ? backUri : true, selfieUri].filter(Boolean).length;
  const totalUploadSteps = needsBack ? 3 : 2;

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
        <Text style={styles.headerTitle}>Téléchargement</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      <StepIndicator currentStep={2} totalSteps={3} />

      {/* Content */}
      <View style={styles.content}>
        {/* Document Info */}
        <View style={styles.docInfoCard}>
          <Icon name="document-text-outline" size={20} color={COLORS.primary} />
          <Text style={styles.docInfoText}>{docLabel}</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{completedSteps}/{totalUploadSteps}</Text>
          </View>
        </View>

        {/* Upload Cards */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Photos requises</Text>

          {/* Front */}
          <TouchableOpacity
            style={[styles.uploadCard, frontUri && styles.uploadCardComplete]}
            onPress={() => showPickerOptions('front')}
            activeOpacity={0.7}
            disabled={uploading === 'front'}
          >
            {uploading === 'front' ? (
              <View style={styles.uploadIconContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : frontUri ? (
              <Image source={{ uri: frontUri }} style={styles.uploadThumb} />
            ) : (
              <View style={styles.uploadIconContainer}>
                <Icon name="camera-outline" size={24} color={COLORS.text.secondary} />
              </View>
            )}
            
            <View style={styles.uploadInfo}>
              <Text style={[styles.uploadLabel, frontUri && styles.uploadLabelComplete]}>
                {documentType === 'passport' ? 'Page principale' : 'Recto du document'}
              </Text>
              <Text style={styles.uploadHint}>
                {frontUri ? 'Appuyez pour modifier' : 'Prenez ou importez une photo'}
              </Text>
            </View>
            
            {frontUri ? (
              <View style={styles.checkCircle}>
                <Icon name="checkmark" size={14} color={COLORS.text.white} />
              </View>
            ) : (
              <Icon name="chevron-forward" size={20} color={COLORS.neutral[400]} />
            )}
          </TouchableOpacity>

          {/* Back (if needed) */}
          {needsBack && (
            <TouchableOpacity
              style={[styles.uploadCard, backUri && styles.uploadCardComplete]}
              onPress={() => showPickerOptions('back')}
              activeOpacity={0.7}
              disabled={uploading === 'back'}
            >
              {uploading === 'back' ? (
                <View style={styles.uploadIconContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : backUri ? (
                <Image source={{ uri: backUri }} style={styles.uploadThumb} />
              ) : (
                <View style={styles.uploadIconContainer}>
                  <Icon name="camera-outline" size={24} color={COLORS.text.secondary} />
                </View>
              )}
              
              <View style={styles.uploadInfo}>
                <Text style={[styles.uploadLabel, backUri && styles.uploadLabelComplete]}>
                  Verso du document
                </Text>
                <Text style={styles.uploadHint}>
                  {backUri ? 'Appuyez pour modifier' : 'Prenez ou importez une photo'}
                </Text>
              </View>
              
              {backUri ? (
                <View style={styles.checkCircle}>
                  <Icon name="checkmark" size={14} color={COLORS.text.white} />
                </View>
              ) : (
                <Icon name="chevron-forward" size={20} color={COLORS.neutral[400]} />
              )}
            </TouchableOpacity>
          )}

          {/* Selfie */}
          <TouchableOpacity
            style={[styles.uploadCard, selfieUri && styles.uploadCardComplete]}
            onPress={() => showPickerOptions('selfie')}
            activeOpacity={0.7}
            disabled={uploading === 'selfie'}
          >
            {uploading === 'selfie' ? (
              <View style={styles.uploadIconContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : selfieUri ? (
              <Image source={{ uri: selfieUri }} style={styles.uploadThumb} />
            ) : (
              <View style={[styles.uploadIconContainer, styles.selfieIcon]}>
                <Icon name="person-outline" size={24} color={COLORS.text.secondary} />
              </View>
            )}
            
            <View style={styles.uploadInfo}>
              <Text style={[styles.uploadLabel, selfieUri && styles.uploadLabelComplete]}>
                Photo selfie
              </Text>
              <Text style={styles.uploadHint}>
                {selfieUri ? 'Appuyez pour modifier' : 'Prenez un selfie clair'}
              </Text>
            </View>
            
            {selfieUri ? (
              <View style={styles.checkCircle}>
                <Icon name="checkmark" size={14} color={COLORS.text.white} />
              </View>
            ) : (
              <Icon name="chevron-forward" size={20} color={COLORS.neutral[400]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Conseils pour des photos de qualité</Text>
          <View style={styles.tipItem}>
            <Icon name="sunny-outline" size={16} color={COLORS.warning} />
            <Text style={styles.tipText}>Bonne luminosité, sans reflets</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="scan-outline" size={16} color={COLORS.info} />
            <Text style={styles.tipText}>Document entier visible et lisible</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="eye-outline" size={16} color={COLORS.success} />
            <Text style={styles.tipText}>Visage dégagé pour le selfie</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={canContinue ? 'Continuer' : `Téléchargez ${totalUploadSteps - completedSteps} photo(s)`}
          onPress={() =>
            navigation.navigate('KycConfirm', {
              documentType,
              frontUri: frontUri!,
              backUri: needsBack ? backUri ?? undefined : undefined,
              selfieUri: selfieUri!,
            })
          }
          fullWidth
          size="large"
          disabled={!canContinue}
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

  // Doc Info Card
  docInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.soft.primary,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  docInfoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.primary,
  },
  progressBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },

  // Upload Section
  uploadSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  uploadCardComplete: {
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}05`,
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfieIcon: {
    borderRadius: 28,
  },
  uploadThumb: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  uploadLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  uploadLabelComplete: {
    color: COLORS.success,
  },
  uploadHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tips
  tipsSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tipText: {
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

export default KycUploadScreen;
