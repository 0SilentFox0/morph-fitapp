import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../../../theme';

const { colors, typography, spacing } = theme;

export interface MonthSelectorProps {
  dateKey: string;
  onPrev?: () => void;
  onNext?: () => void;
}

export function MonthSelector({ dateKey, onPrev, onNext }: MonthSelectorProps) {
  const label = React.useMemo(
    () =>
      new Date(dateKey).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
    [dateKey]
  );

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onPrev}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={onNext}>
        <Ionicons name="chevron-forward" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
});
