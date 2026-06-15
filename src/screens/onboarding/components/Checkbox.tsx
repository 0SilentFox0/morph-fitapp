import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../../theme';

const { colors, spacing } = theme;

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  style?: ViewStyle;
}

/** Labeled checkbox row used by the onboarding experience step. */
export function Checkbox({ checked, onToggle, label, style }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.row, style]}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Ionicons name="checkmark" size={12} color={colors.white} />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xl,
  },
  box: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.neutral5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral9,
  },
});
