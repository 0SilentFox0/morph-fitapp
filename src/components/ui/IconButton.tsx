import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
const { colors, radius } = theme;

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export function IconButton({ icon, onPress, variant = 'secondary', style }: IconButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, variant === 'primary' && styles.primary, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={24} color={variant === 'primary' ? colors.white : colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
});
