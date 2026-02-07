import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const GenericSettingsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { title } = route.params;

  const [accepted, setAccepted] = useState(false);

  const isTerms = title === "Conditions d'utilisation";
  const isSupport = title === 'Aide et support';
  const isSecurity = title === 'Sécurité';
  const isNotifications = title === 'Notifications';

  const content = useMemo(() => {
    if (isTerms) {
      return (
        <>
          <Text style={styles.paragraph}>
            Conditions d’utilisation (mock).{'\n\n'}
            Ceci est un texte fictif pour permettre au front de fonctionner sans backend.
            Tu pourras remplacer ce contenu plus tard par le texte officiel (PDF ou HTML).
            {'\n\n'}
            1) Utilisation du service{'\n'}
            2) Paiements et responsabilités{'\n'}
            3) KYC et vérification{'\n'}
            4) Litiges et arbitrage{'\n'}
            5) Données personnelles{'\n\n'}
            Fais défiler pour lire davantage…{'\n\n'}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setAccepted((v) => !v)}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <Icon name="checkmark" size={16} color={COLORS.text.white} />}
            </View>
            <Text style={styles.checkboxText}>J’ai lu et j’accepte les conditions</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (isSecurity) {
      return (
        <>
          <Text style={styles.paragraph}>
            Sécurité (mock). Ici tu mettras : changement de PIN, mot de passe, biométrie,
            appareils connectés, etc.
          </Text>

          <Card style={styles.item}>
            <Text style={styles.itemTitle}>Changer le code PIN</Text>
            <Text style={styles.itemDesc}>Fonctionnalité fictive pour l’instant</Text>
          </Card>

          <Card style={styles.item}>
            <Text style={styles.itemTitle}>Activer la biométrie</Text>
            <Text style={styles.itemDesc}>Face ID / empreinte (placeholder)</Text>
          </Card>
        </>
      );
    }

    if (isNotifications) {
      return (
        <>
          <Text style={styles.paragraph}>
            Notifications (mock). Ici tu mettras des toggles : dépôts, retraits, offres, litiges, marketing, etc.
          </Text>

          <Card style={styles.item}>
            <Text style={styles.itemTitle}>Transactions</Text>
            <Text style={styles.itemDesc}>Recevoir une alerte pour chaque transaction</Text>
          </Card>

          <Card style={styles.item}>
            <Text style={styles.itemTitle}>Offres P2P</Text>
            <Text style={styles.itemDesc}>Alertes lors d’une offre acceptée/annulée</Text>
          </Card>
        </>
      );
    }

    if (isSupport) {
      return (
        <>
          <Text style={styles.paragraph}>
            Aide & Support (mock). Plus tard : FAQ, Chat support, Email, WhatsApp, numéro.
          </Text>

          <Card style={styles.item}>
            <Text style={styles.itemTitle}>Contacter le support</Text>
            <Text style={styles.itemDesc}>support@alsaba.app (placeholder)</Text>
          </Card>

          <Card style={styles.item}>
            <Text style={styles.itemTitle}>FAQ</Text>
            <Text style={styles.itemDesc}>Questions fréquentes (placeholder)</Text>
          </Card>
        </>
      );
    }

    return (
      <Text style={styles.paragraph}>
        Écran "{title}" (mock). Contenu à compléter.
      </Text>
    );
  }, [title, isTerms, isSupport, isSecurity, isNotifications, accepted]);

  const onTermsContinue = () => {
    Alert.alert('Merci', 'Conditions acceptées (mock)');
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title={title} />

      {/* ✅ Body + Scroll */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>{content}</Card>

        {/* Espace en bas pour ne pas cacher le texte derrière le bouton fixe */}
        {isTerms && <View style={{ height: 90 }} />}
      </ScrollView>

      {/* ✅ Footer fixed uniquement pour Conditions */}
      {isTerms && (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onTermsContinue}
            disabled={!accepted}
            style={[styles.primaryBtn, !accepted && { opacity: 0.5 }]}
          >
            <Text style={styles.primaryBtnText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
  },
  card: {
    padding: SPACING.md,
  },

  paragraph: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },

  item: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  itemTitle: {
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
  },
  itemDesc: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.background,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
});

export default GenericSettingsScreen;
