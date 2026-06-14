import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme';
import type { Session, SessionStatus } from '../../../../types';

const WEEK_STATUS_BAR: Record<SessionStatus, string> = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.error6,
};

export interface WeekColumnsProps {
  weekDays: { dateKey: string; label: string; date: string }[];
  /** Sessions for a day, already filtered for the active search. */
  getSessions: (dateKey: string) => Session[];
  onSessionPress: (s: Session) => void;
}

/** Horizontal per-day columns for the schedule's week view. */
export function WeekColumns({ weekDays, getSessions, onSessionPress }: WeekColumnsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.weekColumns}
    >
      {weekDays.map((day) => {
        const sess = getSessions(day.dateKey);
        return (
          <View key={day.dateKey} style={styles.weekColumn}>
            <Text style={styles.weekColumnTitle}>
              {day.label} {day.date}
            </Text>
            {sess.length === 0 ? (
              <Text style={styles.weekColumnEmpty}>No sessions</Text>
            ) : (
              sess.map((s) => <WeekMiniCard key={s.id} session={s} onPress={onSessionPress} />)
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

/** Compact session card used inside the week view's per-day columns. */
function WeekMiniCard({ session, onPress }: { session: Session; onPress: (s: Session) => void }) {
  return (
    <TouchableOpacity style={styles.miniCard} activeOpacity={0.8} onPress={() => onPress(session)}>
      <View style={[styles.miniBar, { backgroundColor: WEEK_STATUS_BAR[session.status] }]} />
      <View style={styles.miniBody}>
        <Text style={styles.miniTitle} numberOfLines={2}>
          {session.title}
        </Text>
        <Text style={styles.miniTime}>{session.time}</Text>
        <View style={styles.miniTypeTag}>
          <Text style={styles.miniTypeText}>{session.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  weekColumns: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  weekColumn: {
    width: 160,
  },
  weekColumnTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  weekColumnEmpty: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  miniCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral2,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  miniBar: {
    width: 2,
  },
  miniBody: {
    flex: 1,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  miniTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text,
    lineHeight: 16,
  },
  miniTime: {
    fontSize: 11,
    color: colors.neutral9,
  },
  miniTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  miniTypeText: {
    fontSize: 11,
    color: colors.text,
  },
});
