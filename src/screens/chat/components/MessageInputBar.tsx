import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';

const { colors, radius, typography, spacing } = theme;

interface MessageInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach: () => void;
  bottomInset: number;
}

/** Bottom compose bar: attach button, text field, and send/mic toggle. */
export function MessageInputBar({ value, onChangeText, onSend, onAttach, bottomInset }: MessageInputBarProps) {
  const hasInput = value.trim().length > 0;
  return (
    <View style={[styles.inputRow, { paddingBottom: spacing.md + bottomInset }]}>
      <TouchableOpacity style={styles.iconBox} onPress={onAttach} activeOpacity={0.7}>
        <Ionicons name="link-outline" size={24} color={colors.neutral8} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor={colors.neutral5}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={1000}
        onSubmitEditing={onSend}
      />

      <TouchableOpacity
        style={styles.iconBox}
        onPress={hasInput ? onSend : undefined}
        disabled={!hasInput}
        activeOpacity={0.7}
      >
        <Ionicons name={hasInput ? 'send' : 'mic-outline'} size={20} color={hasInput ? colors.accent : colors.neutral8} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md - 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.text,
  },
});
