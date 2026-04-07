import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'WhereTrain'>;

const LOCATIONS = ['Online', "In-person at client's home", 'At the gym', 'Outdoors'];

export function WhereTrainScreen() {
  const navigation = useNavigation<Nav>();
  const { locations, toggleLocation } = useOnboardingStore();
  const [showWarning, setShowWarning] = React.useState(false);

  const handleNext = () => {
    if (locations.length === 0) {
      setShowWarning(true);
    }
    navigation.navigate('WorkSchedule');
  };

  const handleToggle = (loc: string) => {
    toggleLocation(loc);
    setShowWarning(false);
  };

  return (
    <OnboardingLayout
      step={6}
      title="Where do you train clients?"
      subtitle="Select all that apply"
      onNext={handleNext}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('WorkSchedule')}
    >
      {LOCATIONS.map((loc) => {
        const isSelected = locations.includes(loc);
        return (
          <TouchableOpacity
            key={loc}
            onPress={() => handleToggle(loc)}
            style={[styles.option, isSelected && styles.optionSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={loc}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{loc}</Text>
          </TouchableOpacity>
        );
      })}
      {showWarning && (
        <Text style={styles.warning}>We recommend selecting at least one location</Text>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  option: { backgroundColor: colors.neutral2, padding: spacing.lg, borderRadius: 12, marginBottom: spacing.md },
  optionSelected: { backgroundColor: colors.accent },
  optionText: { fontSize: typography.sizes.base, color: colors.text },
  optionTextSelected: { color: '#FFFFFF' },
  warning: { fontSize: typography.sizes.xs, color: colors.Warning, marginTop: spacing.md },
});
