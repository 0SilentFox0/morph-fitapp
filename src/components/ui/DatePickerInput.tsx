import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../theme';

const { colors, radius, typography } = theme;

/**
 * Date picker input per Figma Session form: bg #141414, border #434343,
 * borderRadius 8, calendar icon right. Tapping opens date picker (caller handles).
 */
export interface DatePickerInputProps {
  value: string;
  onPress?: () => void;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  style?: ViewStyle;
}

export function DatePickerInput({
  value,
  onPress,
  onChangeText,
  placeholder = '03/15/2019',
  editable = true,
  style,
}: DatePickerInputProps) {
  const content = (
    <>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral9}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
      <Ionicons
        name="calendar-outline"
        size={18}
        color={colors.neutral9}
        style={styles.icon}
      />
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.wrapper, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.wrapper, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: 40,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: typography.weights.normal as '400',
    color: colors.text,
  },
  icon: {
    marginLeft: 4,
  },
});
