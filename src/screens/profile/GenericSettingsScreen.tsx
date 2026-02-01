import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Divider } from '@/components/common/Divider';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

type SettingsRoute = RouteProp<RootStackParamList, 'Settings'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

type RowProps = {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

const SettingsRow: React.FC<RowProps> = ({ icon, title, description, right, onPress, disabled }) => {
  const content = (
    <View style={[styles.row, disabled && { opacity: 0.5 }]}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Icon name={icon} size={20} color={COLORS.text.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{title}</Text>
          {!!description && <Text style={styles.rowDesc}>{description}</Text>}
        </View>
      </View>
      <View style={styles.rowRight}>
        {right ?? <Icon name="chevron-forward" size={18} color={COLORS.text.disabled} />}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={disabled}>
      {content}
    </TouchableOpacity>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.hint}>{children}</Text>
);

const GenericSettingsScreen = () => {
  const route = useRoute<SettingsRoute>();
  const navigation = useNavigation<Nav>();

  const screenTitle = route.params?.title ?? 'Paramètres';

  // États fictifs (à remplacer par store/API plus tard)
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const contentKey = useMemo(() => {
    const t = (screenTitle || '').toLowerCase();
    if (t.includes('sécurité')) return 'security';
    if (t.includes('notification')) return 'notifications';
    if (t.includes('aide') || t.includes('support')) return 'support';
    if (t.includes('condition')) return 'terms';
    return 'generic';
  }, [screenTitle]);

  const comingSoon = (feature?: string) => {
    Alert.alert('Bientôt disponible', feature ? `${feature} sera disponible prochainement.` : 'Fonctionnalité à venir.');
  };

  const openMockDoc = (title: string) => {
    Alert.alert(title, "Contenu fictif pour l'instant.\n\nTu pourras le remplacer par du texte légal réel plus tard.");
  };

  const renderSecurity = () => (
    <>
      <SectionTitle>Accès au compte</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="key-outline"
          title="Changer le code PIN"
          description="Mettre à jour votre code de sécurité"
          onPress={() => comingSoon('Changement de PIN')}
        />
        <Divider />
        <SettingsRow
          icon="finger-print-outline"
          title="Connexion biométrique"
          description="Empreinte digitale / Face ID (si disponible)"
          right={
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text.white}
            />
          }
        />
      </Card>

      <SectionTitle>Protection</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="shield-checkmark-outline"
          title="Alertes de connexion"
          description="Recevoir une alerte lors d’une connexion"
          right={
            <Switch
              value={loginAlerts}
              onValueChange={setLoginAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text.white}
            />
          }
        />
        <Divider />
        <SettingsRow
          icon="warning-outline"
          title="Alertes de transactions"
          description="Notification lors d’un débit/crédit"
          right={
            <Switch
              value={transactionAlerts}
              onValueChange={setTransactionAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text.white}
            />
          }
        />
      </Card>

      <SectionTitle>Session</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="log-out-outline"
          title="Déconnecter tous les appareils"
          description="Coupe toutes les sessions actives (mock)"
          onPress={() => Alert.alert('Succès', 'Toutes les sessions ont été déconnectées (mode fictif).')}
        />
      </Card>

      <Hint>
        Ces paramètres sont fictifs pour l’instant. Plus tard, on les branchera à l’API (KYC / sécurité / sessions).
      </Hint>
    </>
  );

  const renderNotifications = () => (
    <>
      <SectionTitle>Canaux</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="notifications-outline"
          title="Notifications Push"
          description="Recevoir des notifications dans l’application"
          right={
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text.white}
            />
          }
        />
        <Divider />
        <SettingsRow
          icon="chatbubble-ellipses-outline"
          title="SMS"
          description="Recevoir des SMS pour les opérations importantes"
          right={
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text.white}
            />
          }
        />
        <Divider />
        <SettingsRow
          icon="mail-outline"
          title="Email"
          description="Recevoir des emails (relevés, alertes)"
          right={
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text.white}
            />
          }
        />
      </Card>

      <SectionTitle>Préférences</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="megaphone-outline"
          title="Messages marketing"
          description="Offres, nouveautés, promotions (mock)"
          right={
            <Switch
              value={marketing}
              onValueChange={setMarketing}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text.white}
            />
          }
        />
        <Divider />
        <SettingsRow
          icon="time-outline"
          title="Mode silencieux"
          description="Plage horaire (ex: 22:00–08:00) (mock)"
          onPress={() => comingSoon('Mode silencieux')}
        />
      </Card>

      <Hint>
        Plus tard, on synchronisera ces préférences avec le backend et les permissions natives (push).
      </Hint>
    </>
  );

  const renderSupport = () => (
    <>
      <SectionTitle>Assistance</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="chatbubbles-outline"
          title="Chat support"
          description="Discuter avec un agent (mock)"
          onPress={() => comingSoon('Chat support')}
        />
        <Divider />
        <SettingsRow
          icon="call-outline"
          title="Appeler le support"
          description="+212 6XX XXX XXX (exemple)"
          onPress={() => Alert.alert('Support', "Appel fictif.\n\nTu brancheras ensuite sur Linking.openURL('tel:...').")}
        />
        <Divider />
        <SettingsRow
          icon="mail-outline"
          title="Envoyer un email"
          description="support@alsaba.app (exemple)"
          onPress={() => Alert.alert('Support', "Email fictif.\n\nTu brancheras ensuite sur Linking.openURL('mailto:...').")}
        />
      </Card>

      <SectionTitle>FAQ</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="help-circle-outline"
          title="Questions fréquentes"
          description="Trouver des réponses rapidement"
          onPress={() => comingSoon('FAQ')}
        />
        <Divider />
        <SettingsRow
          icon="document-text-outline"
          title="Guide d’utilisation"
          description="Fonctionnement, frais, délais (mock)"
          onPress={() => comingSoon('Guide')}
        />
      </Card>

      <Hint>
        Ici tu peux ensuite ajouter une page “Tickets” ou “Historique des demandes”.
      </Hint>
    </>
  );

  const renderTerms = () => (
    <>
      <SectionTitle>Documents</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="document-text-outline"
          title="Conditions d’utilisation"
          description="Version 1.0 (brouillon)"
          onPress={() => openMockDoc("Conditions d’utilisation")}
        />
        <Divider />
        <SettingsRow
          icon="lock-closed-outline"
          title="Politique de confidentialité"
          description="Données, cookies, consentement (mock)"
          onPress={() => openMockDoc('Politique de confidentialité')}
        />
        <Divider />
        <SettingsRow
          icon="cash-outline"
          title="Frais et tarification"
          description="Grille des commissions (mock)"
          onPress={() => openMockDoc('Frais et tarification')}
        />
      </Card>

      <SectionTitle>Consentements</SectionTitle>
      <Card style={styles.card}>
        <SettingsRow
          icon="shield-outline"
          title="Gestion des consentements"
          description="Autoriser / retirer certains consentements (mock)"
          onPress={() => comingSoon('Consentements')}
        />
      </Card>

      <Hint>
        Plus tard, on remplacera ces contenus par des pages statiques ou du HTML/Markdown chargé depuis l’API.
      </Hint>
    </>
  );

  const renderGeneric = () => (
    <Card style={styles.card}>
      <Text style={styles.genericText}>
        Page en construction. Ajoute ici des sections et options selon le besoin.
      </Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <Screen padding={false} scrollable>
      <Header title={screenTitle} />

      <View style={styles.content}>
        {contentKey === 'security' && renderSecurity()}
        {contentKey === 'notifications' && renderNotifications()}
        {contentKey === 'support' && renderSupport()}
        {contentKey === 'terms' && renderTerms()}
        {contentKey === 'generic' && renderGeneric()}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },

  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  card: {
    padding: 0,
    marginBottom: SPACING.md,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  rowRight: {
    marginLeft: SPACING.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  rowDesc: {
    marginTop: 2,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },

  hint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },

  genericText: {
    padding: SPACING.md,
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },

  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  backText: {
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default GenericSettingsScreen;
