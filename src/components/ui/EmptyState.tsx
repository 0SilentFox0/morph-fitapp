import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
const { colors, spacing, radius } = theme;

export interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTestID?: string;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction, actionTestID }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity testID={actionTestID} onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
