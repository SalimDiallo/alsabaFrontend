// src/components/common/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'default',
  style 
}) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  default: {
    backgroundColor: COLORS.surface,
  },
  defaultText: {
    color: COLORS.text.secondary,
  },
  success: {
    backgroundColor: '#E8F5E9',
  },
  successText: {
    color: COLORS.success,
  },
  warning: {
    backgroundColor: '#FFF3E0',
  },
  warningText: {
    color: COLORS.warning,
  },
  error: {
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: COLORS.error,
  },
  info: {
    backgroundColor: '#E1F5FE',
  },
  infoText: {
    color: COLORS.info,
  },
});