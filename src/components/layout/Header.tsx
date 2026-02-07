import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';
import { Icon } from '@/components/common/Icon';

interface HeaderProps {
  title: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({ title, leftAction, rightAction }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const canGoBack = useMemo(() => {
    try {
      return navigation?.canGoBack?.() ?? false;
    } catch {
      return false;
    }
  }, [navigation]);

  const showAutoBack = !leftAction && canGoBack;

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      <View style={styles.leftAction}>
        {leftAction ? (
          <TouchableOpacity onPress={leftAction.onPress} activeOpacity={0.7} hitSlop={10}>
            {leftAction.icon}
          </TouchableOpacity>
        ) : showAutoBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={10}>
            <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightAction}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} activeOpacity={0.7} hitSlop={10}>
            {rightAction.icon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  leftAction: { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  rightAction: { width: 44, alignItems: 'flex-end', justifyContent: 'center' },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
});
