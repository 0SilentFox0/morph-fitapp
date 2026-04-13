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

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ClientTypes'>;

const CLIENT_TYPES = ['Beginners', 'Pro', 'Women', 'Men', '50+', 'Strength', 'Other'];

export function ClientTypesScreen() {
  const navigation = useNavigation<Nav>();
  const { clientTypes, toggleClientType } = useOnboardingStore();
  const [showWarning, setShowWarning] = React.useState(false);

  const handleNext = () => {
    if (clientTypes.length === 0) {
      setShowWarning(true);
    }
    navigation.navigate('HavePrograms');
  };

  const handleToggle = (type: string) => {
    toggleClientType(type);
    setShowWarning(false);
  };

  return (
    <OnboardingLayout
      step={4}
      title="Who do you usually train?"
      subtitle="Select all types of clients you work with"
      onNext={handleNext}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('HavePrograms')}
    >
      <View style={styles.optionsGrid}>
        {CLIENT_TYPES.map((type) => {
          const isSelected = clientTypes.includes(type);
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
        <Text style={styles.warning}>We recommend selecting at least one client type</Text>
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
