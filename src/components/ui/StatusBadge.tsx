import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
const { colors, typography, radius } = theme;

export type StatusBadgeColor = 'success' | 'warning' | 'error' | 'accent' | 'neutral';

export interface StatusBadgeProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: StatusBadgeColor;
}

const colorMap: Record<StatusBadgeColor, string> = {
  success: colors.Success,
  warning: colors.Warning,
  error: colors.Error,
  accent: colors.accent,
  neutral: colors.text,
};

export const StatusBadge = React.memo(function StatusBadge({
  icon,
  label,
  color = 'neutral',
}: StatusBadgeProps) {
  const fg = colorMap[color];
  return (
    <View style={styles.badge}>
      {icon ? (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={10} color={fg} />
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.sizes.xs,
    lineHeight: 20,
    color: colors.text,
  },
});
