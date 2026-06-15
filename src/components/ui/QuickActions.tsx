// src/components/ui/QuickActions.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../theme';

const { colors, spacing, radius, typography } = theme;

interface QuickActionsProps {
  onBook: () => void;
  onMessage: () => void;
  onProgress: () => void;
}

/** Row of one-tap shortcuts to the most common client tasks. */
export function QuickActions({
  onBook,
  onMessage,
  onProgress,
}: QuickActionsProps) {
  const items = [
    { key: 'book', icon: 'add-circle-outline', label: 'Book', onPress: onBook },
    {
      key: 'message',
      icon: 'chatbubble-ellipses-outline',
      label: 'Message',
      onPress: onMessage,
    },
    {
      key: 'progress',
      icon: 'stats-chart-outline',
      label: 'Progress',
      onPress: onProgress,
    },
  ] as const;

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          testID={`quick-action-${item.key}`}
          style={styles.action}
          activeOpacity={0.8}
          onPress={item.onPress}
        >
          <Ionicons name={item.icon} size={22} color={colors.accent} />
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  action: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: { fontSize: typography.sizes.sm, color: colors.text },
});
