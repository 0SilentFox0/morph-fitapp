import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatRelativeTime } from '../../utils';

interface SessionMessageCardProps {
  title: string;
  date: string;
  time: string;
  participants: number;
  /** Once started, the button reads "Session in progress" and is disabled. */
  started?: boolean;
  sentAt: string;
  onStart: () => void;
}

/**
 * Inline "Single Training" session card shown in a chat thread, per Figma
 * node 2006:10390. primary-2 (#310A00) surface, primary-9 (#F5B6A6) detail
 * text, primary-6 accent "Start Session" button.
 */
export function SessionMessageCard({
  title,
  date,
  time,
  participants,
  started,
  sentAt,
  onStart,
}: SessionMessageCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Ionicons name="barbell-outline" size={20} color={colors.white} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.detail}>{date}</Text>
        <Text style={styles.detail}>{time}</Text>
        <View style={styles.participantsRow}>
          <Ionicons name="people-outline" size={16} color={colors.primary9} />
          <Text style={styles.detail}>{participants} participants</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, started && styles.buttonDisabled]}
          onPress={onStart}
          disabled={started}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {started ? 'Session in progress' : 'Start Session'}
          </Text>
        </TouchableOpacity>
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
    width: 280,
    backgroundColor: colors.primary2,
    borderRadius: 14,
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    color: colors.white,
  },
  detail: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.primary9,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.primary4,
  },
  buttonText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    fontWeight: typography.weights.medium,
    color: colors.white,
    letterSpacing: -0.15,
  },
  time: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.primary9,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
});
