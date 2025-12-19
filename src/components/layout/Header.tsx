import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/colors';

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

export const Header: React.FC<HeaderProps> = ({
  title,
  leftAction,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftAction}>
        {leftAction && (
          <TouchableOpacity onPress={leftAction.onPress} activeOpacity={0.7}>
            {leftAction.icon}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightAction}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} activeOpacity={0.7}>
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  leftAction: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightAction: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
});