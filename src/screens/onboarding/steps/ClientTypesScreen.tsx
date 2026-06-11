import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { CLIENT_TYPES } from '../../../constants';
import { MultiSelectStep } from '../components/MultiSelectStep';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ClientTypes'>;

export function ClientTypesScreen() {
  const navigation = useNavigation<Nav>();
  const clientTypes = useOnboardingStore((s) => s.clientTypes);
  const toggleClientType = useOnboardingStore((s) => s.toggleClientType);

  return (
    <MultiSelectStep
      step={4}
      title="Who do you usually train?"
      subtitle="Select all types of clients you work with"
      options={CLIENT_TYPES}
      selected={clientTypes}
      onToggle={toggleClientType}
      warning="We recommend selecting at least one client type"
      onNext={() => navigation.navigate('HavePrograms')}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('HavePrograms')}
    />
  );
}
