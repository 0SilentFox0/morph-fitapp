import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'TrainingTypes'>;

const TRAINING_TYPES = ['Strength', 'Yoga', 'Cardio', 'HIIT', 'Mobility', 'Pilates', 'Other'];

export function TrainingTypesScreen() {
  const navigation = useNavigation<Nav>();
  const { trainingTypes, toggleTrainingType } = useOnboardingStore();
  const [showWarning, setShowWarning] = React.useState(false);

  const handleNext = () => {
    if (trainingTypes.length === 0) {
      setShowWarning(true);
    }
    navigation.navigate('ClientTypes');
  };

  const handleToggle = (type: string) => {
    toggleTrainingType(type);
    setShowWarning(false);
  };

  return (
    <OnboardingLayout
      step={3}
      title="What types of training do you offer?"
      subtitle="Select all that apply"
      onNext={handleNext}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('ClientTypes')}
    >
      <View style={styles.optionsGrid}>
        {TRAINING_TYPES.map((type) => {
          const isSelected = trainingTypes.includes(type);
          return (
            <TouchableOpacity
              key={type}
              onPress={() => handleToggle(type)}
              style={[styles.option, isSelected && styles.optionSelected]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={type}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{type}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {showWarning && (
        <Text style={styles.warning}>We recommend selecting at least one training type</Text>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 20, backgroundColor: colors.neutral2 },
  optionSelected: { backgroundColor: colors.accent },
  optionText: { fontSize: typography.sizes.sm, color: colors.text },
  optionTextSelected: { color: '#FFFFFF' },
  warning: { fontSize: typography.sizes.xs, color: colors.Warning, marginTop: spacing.md },
});
