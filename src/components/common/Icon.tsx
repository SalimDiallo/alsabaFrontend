import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type IconName = keyof typeof Ionicons.glyphMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = COLORS.text.primary 
}) => {
  return <Ionicons name={name} size={size} color={color} />;
};