import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { colors } from '../../theme/colors';
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

const statusIconColor: Record<SessionStatus, string> = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.Error,
};

function ScheduleCardImpl({
  session,
  onPress,
  onOptionsPress,
}: ScheduleCardProps) {
  const barColor = statusBarColor[session.status];
  const iconColor = statusIconColor[session.status];
  const statusLabel =
    session.status.charAt(0).toUpperCase() + session.status.slice(1);
  const handlePress = onPress ? () => onPress(session) : undefined;
  const handleOptionsPress = onOptionsPress ? () => onOptionsPress(session) : undefined;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.leftBar, { backgroundColor: barColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{session.title}</Text>
          <TouchableOpacity
            onPress={handleOptionsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.text}
            />
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
            {session.participants.length === 1 && session.participants[0] ? (
              <View style={styles.participantTag}>
                <Avatar name={session.participants[0].name} size={18} />
                <Text style={styles.participantName}>
                  {session.participants[0].name}
                </Text>
              </View>
            ) : (
              <View style={styles.participantsRow}>
                {session.participants.slice(0, 3).map((p) => (
                  <Avatar key={p.id} name={p.name} size={24} />
                ))}
                {session.participants.length > 3 && (
                  <Text style={styles.moreCount}>
                    +{session.participants.length - 3}
                  </Text>
                )}
              </View>
            )}
          </View>
          <View style={styles.bottomRight}>
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{session.type}</Text>
            </View>
            <View style={styles.paymentBadge}>
              <View style={styles.paymentIconCircle}>
                <Ionicons name="cash" size={8} color={iconColor} />
              </View>
              <Text style={[styles.statusText, { color: iconColor }]}>
                $ {statusLabel}
              </Text>
            </View>
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
  participantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 80,
  },
  participantName: {
    fontSize: typography.sizes.sm,
    color: colors.neutral9,
    lineHeight: 22,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -8,
  },
  moreCount: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  typeTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 80,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTagText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    lineHeight: 20,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: typography.sizes.xs,
    lineHeight: 20,
  },
});

export const ScheduleCard = React.memo(ScheduleCardImpl);
