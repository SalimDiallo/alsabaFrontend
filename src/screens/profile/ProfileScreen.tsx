import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { Divider } from '@/components/common/Divider';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPhoneNumber } from '@/utils/formatters';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Données utilisateur depuis le store
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const phoneNumber = user?.phone_number || '';
  const countryCode = user?.country_code || '+212';

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Informations personnelles',
      onPress: () => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt'),
    },
    {
      icon: 'card-outline',
      label: 'Moyens de paiement',
      onPress: () => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt'),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Sécurité',
      onPress: () => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Aide et support',
      onPress: () => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt'),
    },
    {
      icon: 'document-text-outline',
      label: 'Conditions d\'utilisation',
      onPress: () => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt'),
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
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.log('Logout error:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen scrollable>
      <Header title="Profil" />

      <View style={styles.content}>
        {/* Profil utilisateur */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName?.[0] ?? ''}{lastName?.[0] ?? ''}
            </Text>
          </View>
          <Text style={styles.name}>
            {firstName || 'Utilisateur'} {lastName ?? ''}
          </Text>
          <Text style={styles.phone}>
            {phoneNumber ? formatPhoneNumber(phoneNumber, countryCode) : 'Non renseigné'}
          </Text>
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {/* Badge Numéro vérifié (OTP) */}
            {user?.phone_verified && (
              <View style={styles.phoneBadge}>
                <Icon name="call-outline" size={14} color={COLORS.primary} />
                <Text style={styles.phoneBadgeText}>Numéro vérifié</Text>
              </View>
            )}
            
            {/* Badge Compte vérifié (KYC) */}
            {user?.kyc_status === 'approved' && (
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.verifiedText}>Compte vérifié</Text>
              </View>
            )}
          </View>
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
          disabled={isLoggingOut}
        >
          <Icon name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
          </Text>
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  phoneBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: SPACING.xs,
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