import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge, type StatusBadgeColor } from './StatusBadge';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { Session, SessionStatus } from '../../mocks';

interface ScheduleCardProps {
  session: Session;
  /** 'trainer' (default) keeps the full trainer UI; 'client' hides trainer-only bits. */
  variant?: 'trainer' | 'client';
  /** Client variant only: renders a "w/ {trainerName}" pill in place of participants. */
  trainerName?: string;
  onPress?: (session: Session) => void;
  onOptionsPress?: (session: Session) => void;
  /** When provided (trainer variant), a "Start training" button shows for pending sessions. */
  onStart?: (session: Session) => void;
}

const statusBarColor: Record<SessionStatus, string> = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.error6,
};

const statusBadgeColor: Record<SessionStatus, StatusBadgeColor> = {
  completed: 'success',
  pending: 'warning',
  canceled: 'error',
};

function ScheduleCardImpl({
  session,
  variant = 'trainer',
  trainerName,
  onPress,
  onOptionsPress,
  onStart,
}: ScheduleCardProps) {
  const isClient = variant === 'client';
  const barColor = statusBarColor[session.status];
  const statusLabel = session.status.charAt(0).toUpperCase() + session.status.slice(1);
  const isGroup = session.participants.length !== 1;
  const nameLabel = isGroup ? 'Group' : session.participants[0]?.name ?? 'Group';
  const handlePress = onPress ? () => onPress(session) : undefined;
  const handleOptionsPress = onOptionsPress ? () => onOptionsPress(session) : undefined;
  const canStart = !isClient && !!onStart && session.status === 'pending';

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={[styles.leftBar, { backgroundColor: barColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{session.title}</Text>
          {!isClient && (
            <TouchableOpacity
              testID="schedule-card-options"
              onPress={handleOptionsPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.neutral9} />
          <Text style={styles.dateText}>
            {session.date}: {session.time}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.bottomLeft}>
            {isClient ? (
              trainerName ? (
                <View style={[styles.namePill, styles.namePillSingle]}>
                  <Text style={styles.nameText}>w/ {trainerName}</Text>
                </View>
              ) : null
            ) : (
              <View style={[styles.namePill, isGroup ? styles.namePillGroup : styles.namePillSingle]}>
                <Text style={styles.nameText}>{nameLabel}</Text>
              </View>
            )}
          </View>
          <View style={styles.bottomRight}>
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{session.type}</Text>
            </View>
            <StatusBadge
              icon={isClient ? undefined : 'logo-usd'}
              label={statusLabel}
              color={statusBadgeColor[session.status]}
            />
          </View>
        </View>
        {canStart && (
          <TouchableOpacity
            onPress={() => onStart!(session)}
            style={styles.startBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={14} color={colors.white} />
            <Text style={styles.startText}>Start training</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.neutral2,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: spacing.sm,
    flexShrink: 0,
  },
  leftBar: {
    width: 2,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    color: colors.text,
    lineHeight: 22,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.neutral9,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  namePill: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  namePillSingle: {
    backgroundColor: colors.surfaceSubtle,
  },
  namePillGroup: {
    backgroundColor: colors.neutral3,
  },
  nameText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral9,
    lineHeight: 22,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeTag: {
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTagText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    lineHeight: 20,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  startText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});

export const ScheduleCard = React.memo(ScheduleCardImpl);
