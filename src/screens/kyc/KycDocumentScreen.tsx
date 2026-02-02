import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { KycStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

type Props = NativeStackScreenProps<KycStackParamList, 'KycDocument'>;

const DOCS = [
  { id: 'id_card', label: "Carte d'identité", desc: 'Recto + verso', icon: 'card-outline' },
  { id: 'passport', label: 'Passeport', desc: 'Page d’identité', icon: 'document-text-outline' },
  { id: 'driver_license', label: 'Permis de conduire', desc: 'Recto + verso', icon: 'car-outline' },
] as const;

const KycDocumentScreen: React.FC<Props> = ({ navigation }) => {
  const go = (documentType: 'id_card' | 'passport' | 'driver_license') => {
    navigation.navigate('KycUpload', { documentType });
  };

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
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Choisis un document</Text>
          <Text style={styles.infoText}>
            Cette étape est fictive pour le moment. Plus tard, on branchera l’API KYC.
          </Text>
        </Card>

        {DOCS.map((d) => (
          <TouchableOpacity key={d.id} activeOpacity={0.8} onPress={() => go(d.id)} style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrap}>
                <Icon name={d.icon as any} size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{d.label}</Text>
                <Text style={styles.itemDesc}>{d.desc}</Text>
              </View>
            </View>

            <Icon name="chevron-forward" size={20} color={COLORS.text.disabled} />
          </TouchableOpacity>
        ))}

        <Card style={styles.noteCard}>
          <Text style={styles.noteTitle}>Conseil</Text>
          <Text style={styles.noteText}>
            Utilise des images nettes, bien éclairées, sans reflet. (mock)
          </Text>
        </Card>

        <TouchableOpacity
          style={styles.helpBtn}
          onPress={() => Alert.alert('Aide', 'FAQ KYC (placeholder)')}
          activeOpacity={0.8}
        >
          <Icon name="help-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.helpText}>Aide KYC</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: SPACING.md },

  infoCard: { padding: SPACING.md, marginBottom: SPACING.md },
  infoTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary },
  infoText: { marginTop: SPACING.xs, color: COLORS.text.secondary, lineHeight: 20 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  itemTitle: { fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.md },
  itemDesc: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },

  noteCard: { padding: SPACING.md, marginTop: SPACING.md },
  noteTitle: { fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: SPACING.xs },
  noteText: { color: COLORS.text.secondary, lineHeight: 20 },

  helpBtn: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  helpText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },
});

export default KycDocumentScreen;
