import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
const { colors } = theme;
import type { MessageStatus } from '../../store/chatStore';

interface MessageReceiptProps {
  status: MessageStatus;
  size?: number;
  color?: string;
}

/**
 * Delivery indicator for outgoing messages, per Figma node 2006:10239:
 * - `sent`      -> single check
 * - `delivered` -> double check (muted)
 * - `read`      -> double check (accent)
 */
export function MessageReceipt({ status, size = 16, color }: MessageReceiptProps) {
  if (status === 'sent') {
    return <Ionicons name="checkmark" size={size} color={color ?? colors.neutral8} />;
  }
  return (
    <Ionicons
      name="checkmark-done"
      size={size}
      color={color ?? (status === 'read' ? colors.primary8 : colors.neutral8)}
    />
  );
}
