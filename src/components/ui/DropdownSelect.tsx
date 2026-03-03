import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * Dropdown trigger per Figma (Dropdown / Trigger / Button Basic):
 * bg #141414, border #434343, borderRadius 8, label + chevron-down.
 */
export interface DropdownSelectProps {
  value: string;
  placeholder?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function DropdownSelect({
  value,
  placeholder = 'Select',
  onPress,
  style,
}: DropdownSelectProps) {
  const label = value || placeholder;
  const isPlaceholder = !value;

  return (
    <TouchableOpacity
      style={[styles.wrapper, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isPlaceholder && styles.placeholder]} numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={12} color={colors.neutral9} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 40,
    backgroundColor: colors.Secondary1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: typography.weights.normal as '400',
    color: colors.neutral9,
  },
  placeholder: {
    color: colors.neutral7,
  },
});
