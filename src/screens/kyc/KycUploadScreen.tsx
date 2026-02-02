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

const labelOf = (t: 'id_card' | 'passport' | 'driver_license') => {
  if (t === 'passport') return 'Passeport';
  if (t === 'driver_license') return 'Permis de conduire';
  return "Carte d'identité";
};

const KycUploadScreen: React.FC<Props> = ({ navigation, route }) => {
  const { documentType } = route.params;

  const [frontAdded, setFrontAdded] = useState(false);
  const [backAdded, setBackAdded] = useState(false);
  const [selfieAdded, setSelfieAdded] = useState(false);

  const needsBack = documentType !== 'passport';

  const title = useMemo(() => labelOf(documentType), [documentType]);

  const pickMock = (type: 'front' | 'back' | 'selfie') => {
    if (type === 'front') setFrontAdded(true);
    if (type === 'back') setBackAdded(true);
    if (type === 'selfie') setSelfieAdded(true);

    Alert.alert('Mock', `Fichier ajouté : ${type}`);
  };

  const canContinue = frontAdded && (needsBack ? backAdded : true) && selfieAdded;

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Upload document"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        <Card style={styles.topCard}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>
            Ajoute les pièces demandées. (simulation) — on branchera l’upload API plus tard.
          </Text>
        </Card>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>1) Photo recto</Text>
          <TouchableOpacity style={styles.uploadRow} onPress={() => pickMock('front')} activeOpacity={0.8}>
            <View style={styles.uploadLeft}>
              <View style={[styles.badge, frontAdded && styles.badgeOk]}>
                <Icon
                  name={frontAdded ? 'checkmark' : 'add'}
                  size={18}
                  color={frontAdded ? COLORS.text.white : COLORS.primary}
                />
              </View>
              <Text style={styles.uploadText}>{frontAdded ? 'Ajouté' : 'Ajouter le recto'}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.text.disabled} />
          </TouchableOpacity>
        </Card>

        {needsBack && (
          <Card style={styles.block}>
            <Text style={styles.blockTitle}>2) Photo verso</Text>
            <TouchableOpacity style={styles.uploadRow} onPress={() => pickMock('back')} activeOpacity={0.8}>
              <View style={styles.uploadLeft}>
                <View style={[styles.badge, backAdded && styles.badgeOk]}>
                  <Icon
                    name={backAdded ? 'checkmark' : 'add'}
                    size={18}
                    color={backAdded ? COLORS.text.white : COLORS.primary}
                  />
                </View>
                <Text style={styles.uploadText}>{backAdded ? 'Ajouté' : 'Ajouter le verso'}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.text.disabled} />
            </TouchableOpacity>
          </Card>
        )}

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>{needsBack ? '3) Selfie' : '2) Selfie'}</Text>
          <TouchableOpacity style={styles.uploadRow} onPress={() => pickMock('selfie')} activeOpacity={0.8}>
            <View style={styles.uploadLeft}>
              <View style={[styles.badge, selfieAdded && styles.badgeOk]}>
                <Icon
                  name={selfieAdded ? 'checkmark' : 'add'}
                  size={18}
                  color={selfieAdded ? COLORS.text.white : COLORS.primary}
                />
              </View>
              <Text style={styles.uploadText}>{selfieAdded ? 'Ajouté' : 'Ajouter un selfie'}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.text.disabled} />
          </TouchableOpacity>
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

        <Text style={styles.tip}>
          Astuce: évite les reflets, mets ton document sur une surface neutre. (mock)
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },

  topCard: { padding: SPACING.md, marginBottom: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  sub: { marginTop: SPACING.xs, color: COLORS.text.secondary, lineHeight: 20 },

  block: { padding: SPACING.md, marginBottom: SPACING.sm },
  blockTitle: { fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: SPACING.sm },

  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  uploadLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOk: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  uploadText: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },

  tip: {
    marginTop: SPACING.md,
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default KycUploadScreen;
