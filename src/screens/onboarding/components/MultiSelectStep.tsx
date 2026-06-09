import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { ChoiceCard } from '../../../components/ui';
import { OnboardingLayout } from './OnboardingLayout';

interface MultiSelectStepProps {
  step: number;
  title: string;
  subtitle: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  /** Shown when the user advances without selecting anything. */
  warning: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  /** "chip" renders a wrapped chip grid; "list" renders full-width rows. */
  layout?: 'chip' | 'list';
}

/**
 * Shared onboarding step for "select all that apply" questions. Collapses the
 * previously duplicated TrainingTypes / ClientTypes / WhereTrain screens into a
 * single configurable component.
 */
export function MultiSelectStep({
  step,
  title,
  subtitle,
  options,
  selected,
  onToggle,
  warning,
  onNext,
  onBack,
  onSkip,
  layout = 'chip',
}: MultiSelectStepProps) {
  const [showWarning, setShowWarning] = React.useState(false);

  const handleToggle = (value: string) => {
    onToggle(value);
    setShowWarning(false);
  };

  const handleNext = () => {
    if (selected.length === 0) setShowWarning(true);
    onNext();
  };

  return (
    <OnboardingLayout
      step={step}
      title={title}
      subtitle={subtitle}
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
    >
      {layout === 'chip' ? (
        <View style={styles.optionsGrid}>
          {options.map((option) => (
            <ChoiceCard
              key={option}
              variant="chip"
              selected={selected.includes(option)}
              onPress={() => handleToggle(option)}
              title={option}
            />
          ))}
        </View>
      ) : (
        options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <TouchableOpacity
              key={option}
              onPress={() => handleToggle(option)}
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
        })
      )}
      {showWarning && <Text style={styles.warning}>{warning}</Text>}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  listOption: {
    backgroundColor: colors.neutral2,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  listOptionSelected: { backgroundColor: colors.accent },
  listOptionText: { fontSize: typography.sizes.base, color: colors.text },
  listOptionTextSelected: { color: colors.white },
  warning: { fontSize: typography.sizes.xs, color: colors.Warning, marginTop: spacing.md },
});
