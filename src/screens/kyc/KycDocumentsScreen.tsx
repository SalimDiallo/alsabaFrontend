import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KycStackParamList } from '../../types/navigation.types';

import { Screen } from '../../components/layout/Screen';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/colors';

type Props = NativeStackScreenProps<KycStackParamList, 'KycDocument'>;

type DocType = 'id_card' | 'passport' | 'driver_license';

const docLabel: Record<DocType, string> = {
  id_card: "Carte d'identité",
  passport: 'Passeport',
  driver_license: 'Permis',
};

const KycDocumentScreen: React.FC<Props> = ({ navigation }) => {
  const [docType, setDocType] = useState<DocType>('id_card');

  return (
    <Screen padding={false} scrollable>
      <Header
        title="Vérification d'identité"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Choisis ton document</Text>
          <Text style={styles.subtitle}>Cette étape est obligatoire pour utiliser toutes les fonctionnalités.</Text>

          {(Object.keys(docLabel) as DocType[]).map((k) => {
            const active = docType === k;
            return (
              <TouchableOpacity
                key={k}
                style={[styles.optionRow, active && styles.optionRowActive]}
                onPress={() => setDocType(k)}
                activeOpacity={0.75}
              >
                <Icon
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={active ? COLORS.primary : COLORS.text.secondary}
                />
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{docLabel[k]}</Text>
              </TouchableOpacity>
            );
          })}

          <Button
            title="Continuer"
            onPress={() => navigation.navigate('KycUpload', { documentType: docType })}
            fullWidth
            style={{ marginTop: SPACING.md }}
          />
        </Card>

        <Card style={styles.noteCard}>
          <Text style={styles.noteTitle}>Conseil</Text>
          <Text style={styles.noteText}>
            Utilise des photos nettes et lisibles. Tu pourras brancher le vrai upload plus tard avec ton backend.
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },
  card: { padding: SPACING.md, marginBottom: SPACING.md },

  title: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xs },
  subtitle: { color: COLORS.text.secondary, marginBottom: SPACING.md },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  optionRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },

  optionText: { color: COLORS.text.primary },
  optionTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },

  noteCard: { padding: SPACING.md },
  noteTitle: { fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xs, color: COLORS.text.primary },
  noteText: { color: COLORS.text.secondary, lineHeight: 20 },
});

export default KycDocumentScreen;
