import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import type { Transaction } from '../../../mocks';

const statusColors = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.Error,
};

export interface TransactionCardProps {
  transaction: Transaction;
}

/** Single transaction row in the business analytics list. */
export function TransactionCard({ transaction: t }: TransactionCardProps) {
  return (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionName}>{t.clientName}</Text>
        <Text style={styles.transactionDate}>{t.date}</Text>
        <Text style={styles.transactionType}>{t.type}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: colors.Success }]}>{t.amount}</Text>
        <View style={styles.statusRow}>
          <Ionicons name="cash" size={16} color={statusColors[t.status]} />
          <Text style={styles.statusText}>{t.status}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  transactionDate: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  transactionType: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
