import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';

interface DividerProps {
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({ 
  style, 
  orientation = 'horizontal' 
}) => {
  return (
    <View 
      style={[
        styles.divider, 
        orientation === 'vertical' ? styles.vertical : styles.horizontal,
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: COLORS.divider,
  },
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});