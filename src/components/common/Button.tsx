import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.text.disabled;
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.secondary;
      case 'outline': return 'transparent';
      case 'text': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.text.white;
    switch (variant) {
      case 'primary': return COLORS.text.white;
      case 'secondary': return COLORS.text.white;
      case 'outline': return COLORS.primary;
      case 'text': return COLORS.primary;
      default: return COLORS.text.white;
    }
  };

  const getBorderColor = () => {
    if (disabled) return 'transparent';
    if (variant === 'outline') return COLORS.primary;
    return 'transparent';
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return SPACING.sm;
      case 'medium': return SPACING.md;
      case 'large': return SPACING.md + 4;
      default: return SPACING.md;
    }
  };

  const baseStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: variant === 'outline' ? 1 : 0,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: getPadding(),
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.7 : 1,
  };

  const textBaseStyle: TextStyle = {
    color: getTextColor(),
    fontSize: size === 'large' ? TYPOGRAPHY.sizes.lg : TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  };

  return (
    <TouchableOpacity
      style={[baseStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[textBaseStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});
