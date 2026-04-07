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

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'HavePrograms'>;

export function HaveProgramsScreen() {
  const navigation = useNavigation<Nav>();
  const { setField } = useOnboardingStore();

  const handleUpload = () => {
    setField('hasPrograms', true);
    navigation.navigate('AddToLibrary');
  };

  const handleLater = () => {
    setField('hasPrograms', false);
    navigation.navigate('WhereTrain');
  };

  return (
    <OnboardingLayout
      step={5}
      title="Do you already have training programs?"
      subtitle="Upload your templates if you want to use them right away"
      onBack={() => navigation.goBack()}
    >
      <TouchableOpacity onPress={handleUpload} activeOpacity={0.8}>
        <View style={styles.optionCard}>
          <Text style={styles.optionText}>Yes, I want to upload now</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLater} activeOpacity={0.8}>
        <View style={[styles.optionCard, styles.optionCardSelected]}>
          <Text style={styles.optionTextSelected}>No, I'll add them later</Text>
        </View>
      </TouchableOpacity>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  optionCard: { backgroundColor: colors.neutral2, padding: spacing.lg, borderRadius: 12, marginBottom: spacing.md },
  optionCardSelected: { backgroundColor: colors.accent },
  optionText: { fontSize: typography.sizes.base, color: colors.text },
  optionTextSelected: { fontSize: typography.sizes.base, color: '#FFFFFF', fontWeight: typography.weights.medium },
});
