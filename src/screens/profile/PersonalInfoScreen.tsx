// src/screens/profile/PersonalInfoScreen.tsx
// ==========================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { mockUser } from '@/utils/mockData';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInfo'>;

const PersonalInfoScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState(mockUser.firstName || '');
  const [lastName, setLastName] = useState(mockUser.lastName || '');
  const [email, setEmail] = useState(mockUser.email || '');

  const handleSave = () => {
    Alert.alert('Succès', 'Vos informations ont été mises à jour !');
  };

  return (
    <Screen scrollable padding={false}>
      <Header
        title="Informations Personnelles"
        leftAction={{
          icon: <Icon name="arrow-back" size={24} color={COLORS.text.primary} />,
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        <Input
          label="Prénom"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Votre prénom"
        />

        <Input
          label="Nom"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Votre nom"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="votre@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Téléphone"
          value={mockUser.phoneNumber}
          editable={false}
          leftIcon={<Text style={styles.countryCode}>{mockUser.countryCode}</Text>}
        />

        <Button
          title="Enregistrer"
          onPress={handleSave}
          fullWidth
          size="large"
          style={styles.submitButton}
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
  countryCode: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});

export default PersonalInfoScreen;
