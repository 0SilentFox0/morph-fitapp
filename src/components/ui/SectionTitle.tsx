import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import theme from '../../theme';
const { colors, typography, spacing } = theme;

export interface SectionTitleProps {
  children: React.ReactNode;
  /** Override or extend layout (e.g. margins) without re-declaring the type styles. */
  style?: StyleProp<TextStyle>;
}

/**
 * Standard section heading used across screens. Consolidates the
 * lg / semibold / text-color title style that was previously copy-pasted
 * into ~11 screen StyleSheets. Defaults to a bottom margin; pass `style`
 * to adjust spacing for a specific layout.
 */
export function SectionTitle({ children, style }: SectionTitleProps) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
});
