import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { ChoiceCard } from '../../../components/ui';

export type OptionGroupLayout = 'chip' | 'list';

interface OptionGroupProps {
  options: readonly string[];
  /** Currently selected values. Single-select callers pass `[value]`. */
  selected: string[];
  onToggle: (value: string) => void;
  /** "chip" renders a wrapped chip grid; "list" renders full-width rows. */
  layout?: OptionGroupLayout;
}

/**
 * Renders a set of selectable options shared by every onboarding question
 * screen (training types, client types/level, locations, trainer preferences).
 * Selection state lives with the caller, so the same component serves single-
 * and multi-select flows.
 */
export function OptionGroup({ options, selected, onToggle, layout = 'chip' }: OptionGroupProps) {
  if (layout === 'chip') {
    return (
      <View style={styles.grid}>
        {options.map((option) => (
          <ChoiceCard
            key={option}
            variant="chip"
            selected={selected.includes(option)}
            onPress={() => onToggle(option)}
            title={option}
          />
        ))}
      </View>
    );
  }

  return (
    <>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onToggle(option)}
            style={[styles.listOption, isSelected && styles.listOptionSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={option}
          >
            <Text style={[styles.listOptionText, isSelected && styles.listOptionTextSelected]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  listOption: {
    backgroundColor: colors.neutral2,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  listOptionSelected: { backgroundColor: colors.accent },
  listOptionText: { fontSize: typography.sizes.base, color: colors.text },
  listOptionTextSelected: { color: colors.white },
});
