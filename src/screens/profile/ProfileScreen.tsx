import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Divider } from '@/components/common/Divider';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { mockUser } from '@/utils/mockData';
import { formatPhoneNumber } from '@/utils/formatters';

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Informations personnelles',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      icon: 'card-outline',
      label: 'Moyens de paiement',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Sécurité',
      onPress: () => navigation.navigate('Settings', { title: 'Sécurité' }),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => navigation.navigate('Settings', { title: 'Notifications' }),
    },
    {
      icon: 'help-circle-outline',
      label: 'Aide et support',
      onPress: () => navigation.navigate('Settings', { title: 'Aide et support' }),
    },
    {
      icon: 'document-text-outline',
      label: 'Conditions d\'utilisation',
      onPress: () => navigation.navigate('Settings', { title: 'Conditions d\'utilisation' }),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => console.log('Déconnexion'),
        },
      ]
    );
  };

  return (
    <Screen padding={false} scrollable>
      <Header title="Profil" />

      <View style={styles.content}>
        {/* Profil utilisateur */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {mockUser.firstName?.[0]}{mockUser.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.name}>
            {mockUser.firstName} {mockUser.lastName}
          </Text>
          <Text style={styles.phone}>
            {formatPhoneNumber(mockUser.phoneNumber, mockUser.countryCode)}
          </Text>
          {mockUser.verified && (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.verifiedText}>Compte vérifié</Text>
            </View>
          )}
        </Card>

        {/* Menu */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Icon name={item.icon as any} size={24} color={COLORS.text.secondary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Icon name="chevron-forward" size={20} color={COLORS.text.disabled} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        {/* Déconnexion */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  profileCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  phone: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: SPACING.xs,
  },
  menuCard: {
    padding: 0,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginBottom: SPACING.lg,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  version: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.disabled,
    textAlign: 'center',
  },
});

export default ProfileScreen;