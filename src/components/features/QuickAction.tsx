import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Icon } from '@/components/common/Icon';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  onPress,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, styles[variant]]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, styles[`${variant}Icon`]]}>
        <Icon 
          name={icon} 
          size={24} 
          color={variant === 'primary' ? COLORS.primary : COLORS.secondary} 
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  primary: {
    borderColor: COLORS.border,
  },
  secondary: {
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  primaryIcon: {
    backgroundColor: `${COLORS.primary}15`,
  },
  secondaryIcon: {
    backgroundColor: `${COLORS.secondary}15`,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
});
