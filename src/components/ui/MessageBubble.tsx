import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatTime } from '../../store/chatStore';

interface MessageBubbleProps {
  text: string;
  sentAt: string;
  isFromMe: boolean;
  style?: ViewStyle;
}

export function MessageBubble({ text, sentAt, isFromMe, style }: MessageBubbleProps) {
  return (
    <View style={[styles.wrapper, isFromMe ? styles.wrapperRight : styles.wrapperLeft, style]}>
      <View style={[styles.bubble, isFromMe ? styles.bubbleSent : styles.bubbleReceived]}>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.time}>{formatTime(sentAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  wrapperLeft: {
    alignItems: 'flex-start',
  },
  wrapperRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  bubbleSent: {
    backgroundColor: colors.Accent1,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
  },
  bubbleReceived: {
    backgroundColor: colors.Secondary2,
    borderBottomRightRadius: 16,
  },
  text: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
