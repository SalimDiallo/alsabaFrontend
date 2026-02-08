import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/navigation.types';
import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPhoneNumber } from '@/utils/formatters';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Configuration des statuts KYC
const getKycConfig = (status?: string) => {
  switch (status) {
    case 'verified':
      return {
        text: 'Vérifié',
        color: COLORS.success,
        bgColor: COLORS.soft.success,
        icon: 'checkmark-circle' as const,
      };
    case 'pending':
      return {
        text: 'En cours',
        color: COLORS.warning,
        bgColor: COLORS.soft.warning,
        icon: 'time-outline' as const,
      };
    case 'rejected':
      return {
        text: 'Rejeté',
        color: COLORS.error,
        bgColor: COLORS.soft.error,
        icon: 'close-circle' as const,
      };
    default:
      return {
        text: 'Non vérifié',
        color: COLORS.text.secondary,
        bgColor: COLORS.neutral[100],
        icon: 'shield-outline' as const,
      };
  }
};

// Composant MenuItem
interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  showChevron?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  badge,
  badgeColor,
  badgeBgColor,
  showChevron = true,
  danger = false,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[
      styles.menuIconContainer,
      danger && { backgroundColor: COLORS.soft.error },
    ]}>
      <Icon
        name={icon as any}
        size={18}
        color={danger ? COLORS.error : COLORS.text.secondary}
      />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>
        {label}
      </Text>
      {badge && (
        <View style={[styles.menuBadge, { backgroundColor: badgeBgColor || COLORS.neutral[100] }]}>
          <Text style={[styles.menuBadgeText, { color: badgeColor || COLORS.text.secondary }]}>
            {badge}
          </Text>
        </View>
      )}
    </View>
    {showChevron && (
      <Icon name="chevron-forward" size={18} color={COLORS.neutral[400]} />
    )}
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout, refreshProfile, isLoading } = useAuthStore();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const goStack = (name: keyof RootStackParamList, params?: any) => {
    const root = navigation.getParent?.('RootStack');
    if (root) {
      root.navigate(name as any, params);
      return;
    }
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate(name as any, params);
      return;
    }
    navigation.navigate(name as any, params);
  };

  useEffect(() => {
    if (!user) refreshProfile();
  }, [user, refreshProfile]);

  const firstName = user?.first_name ?? '';
  const lastName = user?.last_name ?? '';
  const phoneNumber = user?.phone_number ?? '';
  const countryCode = user?.country_code ?? '+212';

  const initials = useMemo(() => {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  }, [firstName, lastName]);

  const kyc = getKycConfig(user?.kyc_status);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (e) {
      console.log('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
          } catch (err) {
            console.log('Logout error:', err);
            Alert.alert('Erreur', 'Impossible de se déconnecter. Réessayez.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen
      padding={false}
      scrollable
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header avec profil */}
      <View style={styles.headerSection}>
        {/* Avatar et infos */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => goStack('PersonalInfo')}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.editAvatarBadge}>
              <Icon name="pencil" size={10} color={COLORS.text.white} />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {isLoading ? 'Chargement…' : (firstName || 'Utilisateur') + (lastName ? ` ${lastName}` : '')}
            </Text>
            <Text style={styles.profilePhone}>
              {phoneNumber ? formatPhoneNumber(phoneNumber, countryCode) : 'Non renseigné'}
            </Text>
          </View>

          <Icon name="chevron-forward" size={20} color={COLORS.neutral[400]} />
        </TouchableOpacity>

        {/* Badges de statut */}
        <View style={styles.statusBadges}>
          {user?.phone_verified && (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.soft.primary }]}>
              <Icon name="call" size={12} color={COLORS.primary} />
              <Text style={[styles.statusBadgeText, { color: COLORS.primary }]}>
                Téléphone vérifié
              </Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: kyc.bgColor }]}>
            <Icon name={kyc.icon} size={12} color={kyc.color} />
            <Text style={[styles.statusBadgeText, { color: kyc.color }]}>
              {kyc.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Menu principal */}
      <View style={styles.content}>
        {/* Compte */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Compte</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              label="Informations personnelles"
              onPress={() => goStack('PersonalInfo')}
            />
            {user?.kyc_status !== 'verified' && (
              <MenuItem
                icon="shield-checkmark-outline"
                label="Vérifier mon identité"
                onPress={() => goStack('KYCFlow')}
                badge={user?.kyc_status === 'pending' ? 'En cours' : user?.kyc_status === 'rejected' ? 'Échoué' : undefined}
                badgeColor={user?.kyc_status === 'pending' ? COLORS.warning : user?.kyc_status === 'rejected' ? COLORS.error : undefined}
                badgeBgColor={user?.kyc_status === 'pending' ? COLORS.soft.warning : user?.kyc_status === 'rejected' ? COLORS.soft.error : undefined}
              />
            )}
            <MenuItem
              icon="card-outline"
              label="Moyens de paiement"
              onPress={() => goStack('PaymentMethods')}
            />
          </View>
        </View>

        {/* Préférences */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Préférences</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => goStack('Settings', { title: 'Notifications' })}
            />
            <MenuItem
              icon="language-outline"
              label="Langue"
              onPress={() => goStack('Settings', { title: 'Langue' })}
              badge="Français"
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Aide et support"
              onPress={() => goStack('Settings', { title: 'Aide et support' })}
            />
            <MenuItem
              icon="document-text-outline"
              label="Conditions d'utilisation"
              onPress={() => goStack('Settings', { title: "Conditions d'utilisation" })}
            />
            <MenuItem
              icon="shield-outline"
              label="Politique de confidentialité"
              onPress={() => goStack('Settings', { title: 'Politique de confidentialité' })}
            />
          </View>
        </View>

        {/* Déconnexion */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuItem
              icon="log-out-outline"
              label={isLoggingOut ? 'Déconnexion…' : 'Déconnexion'}
              onPress={handleLogout}
              showChevron={false}
              danger
            />
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>ALSABA • Version 1.0.0</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  // Header Section
  headerSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral[50],
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  profileName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  profilePhone: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  // Status Badges
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Content
  content: {
    flex: 1,
    padding: SPACING.md,
  },

  // Menu Section
  menuSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  menuBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Version
  version: {
    fontSize: 10,
    color: COLORS.text.disabled,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});

export default ProfileScreen;
