// src/screens/profile/GenericSettingsScreen.tsx (CORRIGÉ)
// ==========================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const GenericSettingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title } = route.params;

  const getContent = () => {
    switch (title) {
      case 'Sécurité':
        return 'Gérez vos paramètres de sécurité : mot de passe, authentification à deux facteurs, etc.';
      case 'Notifications':
        return 'Configurez vos préférences de notifications push et SMS.';
      case 'Aide et support':
        return 'Contactez notre équipe de support ou consultez notre FAQ.';
      case "Conditions d'utilisation":
        return 'Consultez nos conditions générales d\'utilisation et notre politique de confidentialité.';
      default:
        return 'Contenu à venir...';
    }
  };

  return (
    <Screen padding={false}>
      <Header
        title={title}
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        <Text style={styles.text}>{getContent()}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default GenericSettingsScreen;
