import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KycStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

type Props = NativeStackScreenProps<KycStackParamList, 'KycDocument'>;

type DocType = 'id_card' | 'passport' | 'driver_license';

const KycDocumentScreen: React.FC<Props> = ({ navigation }) => {
  const [docType, setDocType] = useState<DocType>('id_card');

  const items: Array<{ id: DocType; label: string; desc: string; icon: any }> = [
    { id: 'id_card', label: "Carte d'identité", desc: 'Recto + verso', icon: 'card-outline' },
    { id: 'passport', label: 'Passeport', desc: 'Page principale', icon: 'document-text-outline' },
    { id: 'driver_license', label: 'Permis', desc: 'Recto + verso', icon: 'car-outline' },
  ];

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
          <Text style={styles.title}>Prépare ton document</Text>
          <Text style={styles.subtitle}>
            Assure-toi d’être dans un endroit lumineux. Le processus prend ~2 minutes (mock).
          </Text>

          <Text style={styles.section}>Choisir un document</Text>

          {items.map((it) => {
            const active = docType === it.id;
            return (
              <TouchableOpacity
                key={it.id}
                style={[styles.docRow, active && styles.docRowActive]}
                onPress={() => setDocType(it.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.docIcon, active && { borderColor: COLORS.primary }]}>
                  <Icon name={it.icon} size={22} color={active ? COLORS.primary : COLORS.text.secondary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>{it.label}</Text>
                  <Text style={styles.docDesc}>{it.desc}</Text>
                </View>

                {active ? <Icon name="checkmark-circle" size={22} color={COLORS.primary} /> : null}
              </TouchableOpacity>
            );
          })}

          <Button
            title="Commencer"
            onPress={() => navigation.navigate('KycUpload', { documentType: docType })}
            fullWidth
            style={{ marginTop: SPACING.lg }}
          />
        </Card>

        <Card style={styles.note}>
          <Text style={styles.noteTitle}>Info</Text>
          <Text style={styles.noteText}>
            En production, cet écran lancera une session KYC (provider) et ouvrira le parcours “hosted”.
            Ici on simule le même flow côté front.
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

  section: { marginTop: SPACING.lg, marginBottom: SPACING.sm, color: COLORS.text.secondary },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  docRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  docLabel: { color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.semibold },
  docDesc: { color: COLORS.text.secondary, marginTop: 2, fontSize: TYPOGRAPHY.sizes.xs },

  note: { padding: SPACING.md },
  noteTitle: { fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: 6 },
  noteText: { color: COLORS.text.secondary, lineHeight: 20 },
});

export default KycDocumentScreen;
