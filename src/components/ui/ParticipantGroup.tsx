import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface ParticipantInfo {
  id: string;
  name: string;
  avatar?: string;
}

export interface ParticipantGroupProps {
  participants: ParticipantInfo[];
  maxVisible?: number;
}

export const ParticipantGroup = React.memo(function ParticipantGroup({
  participants,
  maxVisible = 3,
}: ParticipantGroupProps) {
  if (participants.length === 0) return null;

  if (participants.length === 1) {
    const first = participants[0];
    if (!first) return null;
    return (
      <View style={styles.singleTag}>
        <Avatar name={first.name} uri={first.avatar} size={18} />
        <Text style={styles.singleName}>{first.name}</Text>
      </View>
    );
  }

  const visible = participants.slice(0, maxVisible);
  const overflow = participants.length - maxVisible;

  return (
    <View style={styles.row}>
      {visible.map((p) => (
        <Avatar key={p.id} name={p.name} uri={p.avatar} size={24} />
      ))}
      {overflow > 0 ? <Text style={styles.moreCount}>+{overflow}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  singleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral3,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 80,
  },
  singleName: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  moreCount: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
