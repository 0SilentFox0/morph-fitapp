import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
const { colors, radius, typography, spacing } = theme;

type Status = 'completed' | 'pending' | 'canceled';

interface StatusTagProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  { bg: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  completed: {
    bg: colors.Success,
    icon: 'checkmark',
    label: 'Completed',
  },
  pending: {
    bg: colors.Warning,
    icon: 'time',
    label: 'Pending',
  },
  canceled: {
    bg: colors.Error,
    icon: 'close',
    label: 'Canceled',
  },
};

export function StatusTag({ status }: StatusTagProps) {
  const config = statusConfig[status];

  return (
    <View style={[styles.tag, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={12} color={colors.white} />
      <Text style={styles.text}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.medium,
  },
});
