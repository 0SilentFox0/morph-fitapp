import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, ChoiceCard } from '../../../components/ui';
import theme from '../../../theme';

const { colors, spacing, typography } = theme;

import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

export function ChooseRoleScreen() {
  const { navigation } = useOnboardingScreen('ChooseRole');

  const setUserRole = useAppStore((s) => s.setUserRole);

  const setSignupMode = useAppStore((s) => s.setSignupMode);

  // During sign-up the user reached onboarding from the login screen; offer a
  // way back. (No-op for the authenticated first-run onboarding path.)
  const isSigningUp = useAuthStore((s) => s.status) !== 'authenticated';

  const [selected, setSelected] = React.useState<'client' | 'trainer'>(
    'trainer'
  );

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

      <Button
        title="Continue"
        onPress={() => handleApply(selected)}
        style={styles.button}
      />

      {isSigningUp && (
        <Pressable
          accessibilityRole="button"
          style={styles.loginRow}
          onPress={() => setSignupMode(false)}
        >
          <Text style={styles.loginMuted}>Already have an account? </Text>
          <Text style={styles.loginLink}>Log in</Text>
        </Pressable>
      )}
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginMuted: { color: colors.textMuted, fontSize: typography.sizes.sm },
  loginLink: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
});
