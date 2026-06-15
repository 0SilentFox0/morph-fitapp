import React from 'react';
import { Text, StyleSheet } from 'react-native';
import theme from '../../../theme';
const { colors, typography, spacing } = theme;
import { OnboardingLayout } from './OnboardingLayout';
import { OptionGroup, OptionGroupLayout } from './OptionGroup';

interface MultiSelectStepProps {
  step?: number;
  totalSteps?: number;
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
  layout?: OptionGroupLayout;
}

/**
 * Shared onboarding step for "select all that apply" questions (and, via a
 * single-element selection, single-choice ones). Pairs {@link OnboardingLayout}
 * with {@link OptionGroup} and adds the advance-without-selection warning.
 */
export function MultiSelectStep({
  step,
  totalSteps,
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
      totalSteps={totalSteps}
      title={title}
      subtitle={subtitle}
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
    >
      <OptionGroup options={options} selected={selected} onToggle={handleToggle} layout={layout} />
      {showWarning && <Text style={styles.warning}>{warning}</Text>}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  warning: { fontSize: typography.sizes.xs, color: colors.Warning, marginTop: spacing.md },
});
