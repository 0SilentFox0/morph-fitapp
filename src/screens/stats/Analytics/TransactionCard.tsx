import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import type { Transaction, TransactionStatus } from '../../../mocks';

const statusColors: Record<TransactionStatus, string> = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.Error,
};

export interface TransactionCardProps {
  transaction: Transaction;
}

/** Single transaction row in the business analytics list (Figma 2006:9948). */
export function TransactionCard({ transaction: t }: TransactionCardProps) {
  const statusColor = statusColors[t.status];
  const statusLabel = t.status.charAt(0).toUpperCase() + t.status.slice(1);
  const showProgress =
    t.type === 'Subscription' && t.sessionsTotal != null && t.sessionsUsed != null;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <Text style={styles.name}>{t.clientName}</Text>
          <Text style={styles.date}>{t.date}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: statusColor }]}>{t.amount}</Text>
          <Text style={styles.type}>{t.type}</Text>
        </View>
      </View>

      {showProgress ? (
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            <Text style={styles.progressUsed}>{t.sessionsUsed}</Text>/{t.sessionsTotal}
          </Text>
          <View style={styles.progressTrack}>
            {Array.from({ length: t.sessionsTotal as number }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDash,
                  { backgroundColor: i < (t.sessionsUsed as number) ? colors.accent : colors.neutral5 },
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.badge}>
        <View style={styles.badgeIcon}>
          <Ionicons name="logo-usd" size={12} color={statusColor} />
        </View>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: 14,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.neutral9,
  },
  date: {
    fontSize: typography.sizes.xs,
    lineHeight: 20,
    color: colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
    gap: 2,
  },
  amount: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    fontWeight: typography.weights.heavy,
  },
  type: {
    fontSize: typography.sizes.xs,
    lineHeight: 20,
    color: colors.textMuted,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  progressUsed: {
    color: colors.neutral9,
    fontWeight: typography.weights.semibold,
  },
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressDash: {
    flex: 1,
    height: 3,
    borderRadius: radius.pill,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    padding: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSubtle,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    lineHeight: 20,
    color: colors.text,
  },
});
