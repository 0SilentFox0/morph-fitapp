import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatRelativeTime } from '../../utils';

interface SystemMessageCardProps {
  title: string;
  subtitle?: string;
  sentAt: string;
}

/**
 * Centered system note (e.g. "Session started" / "Timer running") per Figma
 * node 2006:10417. primary-2 (#310A00) surface, white title, primary-9 detail.
 */
export function SystemMessageCard({ title, subtitle, sentAt }: SystemMessageCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text style={styles.time}>{formatRelativeTime(sentAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  card: {
    minWidth: 148,
    backgroundColor: colors.primary2,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    fontWeight: typography.weights.medium,
    color: colors.white,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.primary9,
    marginTop: spacing.xs,
  },
  time: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.primary9,
    marginTop: spacing.sm,
  },
});
