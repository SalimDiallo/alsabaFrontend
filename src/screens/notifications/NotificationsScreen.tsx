import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';
import { useMockDb } from '@/store/useMockDb';
import { RootStackParamList } from '@/types/navigation.types';

type NotificationType = 'transaction' | 'offer' | 'system' | 'security';

const getNotificationIcon = (title: string): { name: string; color: string; bgColor: string } => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('dépôt') || lowerTitle.includes('wallet') || lowerTitle.includes('débit')) {
    return { name: 'wallet-outline', color: COLORS.success, bgColor: COLORS.soft.success };
  }
  if (lowerTitle.includes('offre') || lowerTitle.includes('transaction')) {
    return { name: 'swap-horizontal-outline', color: COLORS.primary, bgColor: COLORS.soft.primary };
  }
  if (lowerTitle.includes('litige') || lowerTitle.includes('annul')) {
    return { name: 'alert-circle-outline', color: COLORS.error, bgColor: COLORS.soft.error };
  }
  if (lowerTitle.includes('paiement') || lowerTitle.includes('moyen')) {
    return { name: 'card-outline', color: COLORS.secondary, bgColor: COLORS.soft.secondary };
  }
  return { name: 'notifications-outline', color: COLORS.text.secondary, bgColor: COLORS.neutral[100] };
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const NotificationsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  
  const notifications = useMockDb((s) => s.notifications);
  const markNotificationRead = useMockDb((s) => s.markNotificationRead);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleNotificationPress = (id: string) => {
    markNotificationRead(id);
    // Ici on pourrait naviguer vers la page correspondante selon le type
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  return (
    <Screen padding={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        {unreadCount > 0 ? (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllText}>Tout lire</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="notifications-off-outline" size={48} color={COLORS.neutral[300]} />
            </View>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySubtitle}>
              Vous recevrez ici les alertes sur vos transactions, offres et autres activités.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification, index) => {
              const iconStyle = getNotificationIcon(notification.title);
              const isLast = index === notifications.length - 1;
              
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.notificationItemUnread,
                    !isLast && styles.notificationItemBorder,
                  ]}
                  onPress={() => handleNotificationPress(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.notificationIcon, { backgroundColor: iconStyle.bgColor }]}>
                    <Icon name={iconStyle.name as any} size={20} color={iconStyle.color} />
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={[
                        styles.notificationTitle,
                        !notification.read && styles.notificationTitleUnread,
                      ]} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                      {notification.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTimeAgo(new Date(notification.createdAt))}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  headerBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.white,
  },
  markAllButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  markAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  headerSpacer: {
    width: 60,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Notifications List
  notificationsList: {
    backgroundColor: COLORS.surface,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  notificationItemUnread: {
    backgroundColor: COLORS.soft.primary,
  },
  notificationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationBody: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
});

export default NotificationsScreen;
