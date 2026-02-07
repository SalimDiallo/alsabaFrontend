import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KycStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

type Props = NativeStackScreenProps<KycStackParamList, 'KycUpload'>;

const KycUploadScreen: React.FC<Props> = ({ navigation, route }) => {
  const { documentType } = route.params;

  const needsBack = documentType !== 'passport';

  const docLabel = useMemo(() => {
    if (documentType === 'id_card') return "Carte d'identité";
    if (documentType === 'passport') return 'Passeport';
    return 'Permis';
  }, [documentType]);

  const [cameraGranted, setCameraGranted] = useState(false);

  const [frontAdded, setFrontAdded] = useState(false);
  const [backAdded, setBackAdded] = useState(false);
  const [selfieAdded, setSelfieAdded] = useState(false);

  const askCameraPermission = () => {
    Alert.alert(
      'Permission caméra (mock)',
      'Autoriser la caméra pour scanner les documents ?',
      [
        { text: 'Refuser', style: 'cancel' },
        { text: 'Autoriser', onPress: () => setCameraGranted(true) },
      ]
    );
  };

  const mockCapture = (kind: 'front' | 'back' | 'selfie') => {
    if (!cameraGranted) {
      Alert.alert('Caméra', "Autorise d'abord la caméra.");
      return;
    }

    const label =
      kind === 'front' ? 'Recto' : kind === 'back' ? 'Verso' : 'Selfie / Liveness';

    Alert.alert('Capture (mock)', `Simuler la capture : ${label}`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => {
          if (kind === 'front') setFrontAdded(true);
          if (kind === 'back') setBackAdded(true);
          if (kind === 'selfie') setSelfieAdded(true);
        },
      },
    ]);
  };

  const canContinue = frontAdded && (needsBack ? backAdded : true) && selfieAdded;

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Vérification"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>{docLabel}</Text>
          <Text style={styles.subtitle}>
            On va scanner ton document puis faire un selfie de sécurité (mock).
          </Text>

          <TouchableOpacity
            style={[styles.permissionRow, cameraGranted && styles.permissionRowOk]}
            onPress={askCameraPermission}
            activeOpacity={0.8}
          >
            <Icon name="camera-outline" size={22} color={cameraGranted ? COLORS.success : COLORS.text.secondary} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={styles.permissionTitle}>Accès caméra</Text>
              <Text style={styles.permissionDesc}>
                {cameraGranted ? 'Autorisé' : 'Requis pour scanner'}
              </Text>
            </View>
            {cameraGranted ? <Icon name="checkmark-circle" size={22} color={COLORS.success} /> : null}
          </TouchableOpacity>

          <View style={{ height: SPACING.md }} />

          <Card style={styles.stepCard} onPress={() => mockCapture('front')}>
            <View style={styles.stepRow}>
              <Icon name="scan-outline" size={22} color={frontAdded ? COLORS.success : COLORS.primary} />
              <Text style={styles.stepText}>Scanner le recto</Text>
              {frontAdded ? <Icon name="checkmark-circle" size={22} color={COLORS.success} /> : null}
            </View>
          </Card>

          {needsBack && (
            <Card style={styles.stepCard} onPress={() => mockCapture('back')}>
              <View style={styles.stepRow}>
                <Icon name="scan-outline" size={22} color={backAdded ? COLORS.success : COLORS.primary} />
                <Text style={styles.stepText}>Scanner le verso</Text>
                {backAdded ? <Icon name="checkmark-circle" size={22} color={COLORS.success} /> : null}
              </View>
            </Card>
          )}

          <Card style={styles.stepCard} onPress={() => mockCapture('selfie')}>
            <View style={styles.stepRow}>
              <Icon name="person-outline" size={22} color={selfieAdded ? COLORS.success : COLORS.primary} />
              <Text style={styles.stepText}>Selfie / Liveness</Text>
              {selfieAdded ? <Icon name="checkmark-circle" size={22} color={COLORS.success} /> : null}
            </View>
          </Card>

          <Button
            title="Continuer"
            onPress={() =>
              navigation.navigate('KycConfirm', {
                documentType,
                frontAdded,
                backAdded: needsBack ? backAdded : true,
                selfieAdded,
              })
            }
            fullWidth
            disabled={!canContinue}
            style={{ marginTop: SPACING.lg }}
          />
        </Card>

        <Card style={styles.note}>
          <Text style={styles.noteTitle}>Plus tard (backend)</Text>
          <Text style={styles.noteText}>
            Cet écran deviendra un WebView “hosted KYC session”. Ici on simule upload + caméra.
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },
  card: { padding: SPACING.md, marginBottom: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  subtitle: { marginTop: 6, color: COLORS.text.secondary, lineHeight: 20 },

  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  permissionRowOk: {
    borderColor: COLORS.success,
    backgroundColor: '#E8F5E9',
  },
  permissionTitle: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.semibold },
  permissionDesc: { color: COLORS.text.secondary, marginTop: 2, fontSize: TYPOGRAPHY.sizes.xs },

  stepCard: { padding: SPACING.md, marginTop: SPACING.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepText: { flex: 1, marginLeft: SPACING.md, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },

  note: { padding: SPACING.md },
  noteTitle: { fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: 6 },
  noteText: { color: COLORS.text.secondary, lineHeight: 20 },
});

export default KycUploadScreen;
