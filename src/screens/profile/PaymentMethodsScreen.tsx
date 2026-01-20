// src/screens/profile/PaymentMethodsScreen.tsx
// ==========================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Icon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/EmptyState';
import { COLORS, SPACING } from '@/constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;

const PaymentMethodsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <Screen padding={false}>
      <Header
        title="Moyens de Paiement"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
        rightAction={{
          icon: <Icon name="add-circle-outline" size={28} color={COLORS.primary} />,
          onPress: () => console.log('Ajouter méthode'),
        }}
      />

      <View style={styles.content}>
        <EmptyState
          icon="card-outline"
          title="Aucun moyen de paiement"
          message="Ajoutez une carte bancaire ou un compte Mobile Money pour faciliter vos transactions"
          actionLabel="Ajouter un moyen de paiement"
          onAction={() => console.log('Ajouter')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
});

export default PaymentMethodsScreen;