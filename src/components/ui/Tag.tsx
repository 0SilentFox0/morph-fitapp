import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface TagProps {
  label: string;
  variant?: 'default' | 'accent';
  style?: ViewStyle;
}

export function Tag({ label, variant = 'default', style }: TagProps) {
  return (
    <View
      style={[
        styles.tag,
        variant === 'accent' && styles.tagAccent,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'accent' && styles.textAccent,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.neutral2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tagAccent: {
    backgroundColor: colors.accent,
  },
  text: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  textAccent: {
    color: '#FFFFFF',
  },
});
