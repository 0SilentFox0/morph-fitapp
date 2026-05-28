import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { Button, ChoiceCard } from '../../../components/ui';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ChooseRole'>;

export function ChooseRoleScreen() {
  const navigation = useNavigation<Nav>();
  const setUserRole = useAppStore((s) => s.setUserRole);
  const [selected, setSelected] = React.useState<'client' | 'trainer'>('trainer');

  const handleApply = (role: 'client' | 'trainer') => {
    setUserRole(role);
    if (role === 'trainer') {
      navigation.navigate('WelcomeTrainer');
    } else {
      navigation.navigate('YoureAllSet');
    }
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
