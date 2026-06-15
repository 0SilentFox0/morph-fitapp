import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, ChoiceCard } from '../../../components/ui';
import theme from '../../../theme';
const { spacing } = theme;
import { useAppStore } from '../../../store/appStore';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

export function ChooseRoleScreen() {
  const { navigation } = useOnboardingScreen('ChooseRole');
  const setUserRole = useAppStore((s) => s.setUserRole);
  const [selected, setSelected] = React.useState<'client' | 'trainer'>('trainer');

  const handleApply = (role: 'client' | 'trainer') => {
    setUserRole(role);
    navigation.navigate('Welcome');
  };

  return (
    <OnboardingLayout
      title="Choose your role"
      subtitle="To personalize your experience"
      showFooter={false}
    >
      <View style={styles.cardsContainer}>
        <ChoiceCard
          selected={selected === 'trainer'}
          onPress={() => setSelected('trainer')}
          variant="card"
          icon="briefcase-outline"
          title="I'm a trainer"
          subtitle="Want to work as a trainer"
        />
        <ChoiceCard
          selected={selected === 'client'}
          onPress={() => setSelected('client')}
          variant="card"
          icon="person-outline"
          title="I'm a client"
          subtitle="Looking for a trainer"
        />
      </View>

      <Button title="Continue" onPress={() => handleApply(selected)} style={styles.button} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    gap: spacing.md,
  },
  button: {
    marginTop: spacing['2xl'],
  },
});
