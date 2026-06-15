import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import theme from '../../theme';
const { colors, radius, typography, spacing } = theme;
import { formatRelativeTime } from '../../utils';

interface MessageBubbleProps {
  text: string;
  sentAt: string;
  isFromMe: boolean;
  style?: ViewStyle;
}

/**
 * Text chat bubble per Figma node 2006:10366.
 * Sent bubbles are primary-5 (#8C1E03) aligned right; received bubbles are
 * neutral-4 (#303030) aligned left. The timestamp sits below the bubble,
 * muted, outside the rounded surface.
 */
export function MessageBubble({ text, sentAt, isFromMe, style }: MessageBubbleProps) {
  return (
    <View style={[styles.wrapper, isFromMe ? styles.wrapperRight : styles.wrapperLeft, style]}>
      <View style={[styles.bubble, isFromMe ? styles.bubbleSent : styles.bubbleReceived]}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <Text style={[styles.time, isFromMe ? styles.timeRight : styles.timeLeft]}>
        {formatRelativeTime(sentAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  wrapperLeft: {
    alignItems: 'flex-start',
  },
  wrapperRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleSent: {
    backgroundColor: colors.primary5,
  },
  bubbleReceived: {
    backgroundColor: colors.neutral4,
  },
  text: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    color: colors.white,
  },
  time: {
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  timeLeft: {
    textAlign: 'left',
  },
  timeRight: {
    textAlign: 'right',
  },
});
