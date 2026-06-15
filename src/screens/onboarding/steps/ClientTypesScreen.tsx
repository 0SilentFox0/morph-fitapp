import React from 'react';

import { CLIENT_LEVELS, CLIENT_TYPES } from '../../../constants';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { MultiSelectStep } from '../components/MultiSelectStep';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

/**
 * Dual-purpose screen. Trainer: "Who do you usually train?" (multi-select
 * client types). Client: "How would you classify yourself?" (single-select
 * level), where picking one option replaces the previous choice.
 */
export function ClientTypesScreen() {
  const { navigation, isClient, step, totalSteps } =
    useOnboardingScreen('ClientTypes');

  const clientTypes = useOnboardingStore((s) => s.clientTypes);

  const toggleClientType = useOnboardingStore((s) => s.toggleClientType);

  const selfLevel = useOnboardingStore((s) => s.selfLevel);

  const setField = useOnboardingStore((s) => s.setField);

  const goNext = () => navigation.navigate('WhereTrain');

  if (isClient) {
    return (
      <MultiSelectStep
        step={step}
        totalSteps={totalSteps}
        title="How would you classify yourself?"
        subtitle="Pick the option that best fits you"
        options={CLIENT_LEVELS}
        selected={selfLevel ? [selfLevel] : []}
        onToggle={(value) =>
          setField('selfLevel', selfLevel === value ? '' : value)
        }
        warning="We recommend selecting your level"
        onNext={goNext}
        onBack={navigation.goBack}
        onSkip={goNext}
      />
    );
  }

  return (
    <MultiSelectStep
      step={step}
      totalSteps={totalSteps}
      title="Who do you usually train?"
      subtitle="Select all types of clients you work with"
      options={CLIENT_TYPES}
      selected={clientTypes}
      onToggle={toggleClientType}
      warning="We recommend selecting at least one client type"
      onNext={goNext}
      onBack={navigation.goBack}
      onSkip={goNext}
    />
  );
}
