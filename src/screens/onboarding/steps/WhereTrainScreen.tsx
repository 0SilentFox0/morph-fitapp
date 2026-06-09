import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { TRAINING_LOCATIONS } from '../../../constants';
import { MultiSelectStep } from '../components/MultiSelectStep';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'WhereTrain'>;

export function WhereTrainScreen() {
  const navigation = useNavigation<Nav>();
  const locations = useOnboardingStore((s) => s.locations);
  const toggleLocation = useOnboardingStore((s) => s.toggleLocation);

  return (
    <MultiSelectStep
      step={6}
      title="Where do you train clients?"
      subtitle="Select all that apply"
      options={TRAINING_LOCATIONS}
      selected={locations}
      onToggle={toggleLocation}
      warning="We recommend selecting at least one location"
      onNext={() => navigation.navigate('WorkSchedule')}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('WorkSchedule')}
      layout="list"
    />
  );
}
