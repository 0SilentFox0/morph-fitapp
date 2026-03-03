import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { Tag } from './Tag';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { Session, SessionStatus } from '../../mocks';

interface ScheduleCardProps {
  session: Session;
  onPress?: () => void;
  onOptionsPress?: () => void;
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

export function ScheduleCard({
  session,
  onPress,
  onOptionsPress,
}: ScheduleCardProps) {
  const barColor = statusBarColor[session.status];
  const iconColor = statusIconColor[session.status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.leftBar, { backgroundColor: barColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{session.title}</Text>
          <TouchableOpacity
            onPress={onOptionsPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="ellipsis-vertical"
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
        <View style={styles.tagsRow}>
          {session.participants.length === 1 ? (
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
          <Tag label={session.type} variant="default" style={styles.typeTag} />
        </View>
        <View style={styles.statusRow}>
          <View style={styles.paymentBadge}>
            <View style={[styles.paymentIconCircle, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
              <Ionicons name="cash" size={10} color={iconColor} />
            </View>
            <Text style={[styles.statusText, { color: iconColor }]}>
              $ {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.Secondary2,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    flexShrink: 0,
  },
  leftBar: {
    width: 2,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 6,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.neutral9,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: 4,
  },
  participantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.Secondary1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  participantName: {
    fontSize: typography.sizes.xs,
    color: colors.text,
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
    alignSelf: 'flex-start',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  paymentIconCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
