import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { Input } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useAppStore } from '../../../store/appStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'WhatsYourName'>;

export function WhatsYourNameScreen() {
  const navigation = useNavigation<Nav>();
  const { name, setField } = useOnboardingStore();
  const setUserName = useAppStore((s) => s.setUserName);
  const [touched, setTouched] = React.useState(false);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 2;
  const showError = touched && trimmed.length > 0 && !isValid;

  const handleNext = () => {
    setTouched(true);
    if (!isValid) return;
    setUserName(trimmed);
    navigation.navigate('Experience');
  };

  return (
    <OnboardingLayout
      step={1}
      title="What's your name?"
      subtitle="Let clients know how to address you"
      onNext={handleNext}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('Experience')}
      nextDisabled={!isValid}
    >
      <Input
        placeholder="Your name"
        value={name}
        onChangeText={(text) => setField('name', text)}
        onBlur={() => setTouched(true)}
        autoCapitalize="words"
        accessibilityLabel="Your name"
      />
      {showError && (
        <Text style={styles.error}>Name must be at least 2 characters</Text>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: typography.sizes.xs,
    color: colors.Error,
    marginTop: spacing.xs,
  },
});
