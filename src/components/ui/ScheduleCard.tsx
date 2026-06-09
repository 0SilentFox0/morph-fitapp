import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParticipantGroup } from './ParticipantGroup';
import { StatusBadge, type StatusBadgeColor } from './StatusBadge';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { Session, SessionStatus } from '../../mocks';

interface ScheduleCardProps {
  session: Session;
  onPress?: (session: Session) => void;
  onOptionsPress?: (session: Session) => void;
}

const statusBarColor: Record<SessionStatus, string> = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.Error,
};

const statusBadgeColor: Record<SessionStatus, StatusBadgeColor> = {
  completed: 'success',
  pending: 'warning',
  canceled: 'error',
};

function ScheduleCardImpl({ session, onPress, onOptionsPress }: ScheduleCardProps) {
  const barColor = statusBarColor[session.status];
  const statusLabel = session.status.charAt(0).toUpperCase() + session.status.slice(1);
  const handlePress = onPress ? () => onPress(session) : undefined;
  const handleOptionsPress = onOptionsPress ? () => onOptionsPress(session) : undefined;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={[styles.leftBar, { backgroundColor: barColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{session.title}</Text>
          <TouchableOpacity
            onPress={handleOptionsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.neutral9} />
          <Text style={styles.dateText}>
            {session.date}: {session.time}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.bottomLeft}>
            <ParticipantGroup participants={session.participants} maxVisible={3} />
          </View>
          <View style={styles.bottomRight}>
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{session.type}</Text>
            </View>
            <StatusBadge
              icon="cash"
              label={`$ ${statusLabel}`}
              color={statusBadgeColor[session.status]}
            />
          </View>
        </View>
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
});

export const ScheduleCard = React.memo(ScheduleCardImpl);
