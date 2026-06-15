import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Tag } from '../../../components/ui';
import theme from '../../../theme';
import type { Session } from '../../../types';

const { colors, radius, typography, spacing } = theme;

/** "Next training" card: the client's upcoming pending session, or an empty note. */
export function NextTrainingCard({
  session,
}: {
  session: Session | undefined;
}) {
  if (!session)
    return <Text style={styles.emptyNote}>No upcoming sessions.</Text>;

  return (
    <LinearGradient
      colors={[colors.neutral2, colors.neutral2, 'rgba(140,30,3,0.35)']}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.nextCard}
    >
      <Text style={styles.nextTitle}>{session.title}</Text>
      <Tag label={session.type} variant="default" style={styles.nextTag} />
      <View style={styles.completedRow}>
        <View style={styles.dateChip}>
          <Ionicons name="calendar-outline" size={14} color={colors.neutral1} />
          <Text style={styles.dateChipText}>
            {session.date}: {session.time}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  emptyNote: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  nextCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  nextTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  nextTag: { marginTop: spacing.sm },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral9,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dateChipText: { fontSize: typography.sizes.sm, color: colors.neutral1 },
});
