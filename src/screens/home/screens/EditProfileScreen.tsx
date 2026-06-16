import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';

import { ScreenHeader } from '../../../components/layout';
import { Button, FormInput } from '../../../components/ui';
import { updateProfile } from '../../../services/usersService';
import { useAuthStore } from '../../../store/authStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import theme from '../../../theme';

const { colors, typography, spacing } = theme;

/** Split a comma-separated input into a trimmed, non-empty list. */
const toList = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export function EditProfileScreen() {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const setField = useOnboardingStore((s) => s.setField);

  const current = useOnboardingStore(
    useShallow((s) => ({
      name: s.name,
      experienceYears: s.experienceYears,
      trainingTypes: s.trainingTypes,
      clientTypes: s.clientTypes,
      locations: s.locations,
    }))
  );

  const [name, setName] = React.useState(current.name);

  const [experience, setExperience] = React.useState(current.experienceYears);

  const [trainingTypes, setTrainingTypes] = React.useState(
    current.trainingTypes.join(', ')
  );

  const [clientTypes, setClientTypes] = React.useState(
    current.clientTypes.join(', ')
  );

  const [locations, setLocations] = React.useState(current.locations.join(', '));

  const [submitting, setSubmitting] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const form = {
        name,
        experience,
        trainingTypes: toList(trainingTypes),
        clientTypes: toList(clientTypes),
        locations: toList(locations),
      };

      // Persist to the backend, then refresh the cached user.
      await updateProfile(form);
      await refreshProfile();

      // Keep the (onboarding-store-backed) Profile screen display in sync.
      setField('name', form.name.trim());
      setField('experienceYears', form.experience ?? '');
      setField('trainingTypes', form.trainingTypes);
      setField('clientTypes', form.clientTypes);
      setField('locations', form.locations);

      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Edit Profile"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Name</Text>
        <FormInput placeholder="Your name" value={name} onChangeText={setName} />

        <Text style={styles.label}>Experience</Text>
        <FormInput
          placeholder="e.g. 7-9 years"
          value={experience}
          onChangeText={setExperience}
        />

        <Text style={styles.label}>Training types</Text>
        <FormInput
          placeholder="Comma-separated (Cardio, HIIT)"
          value={trainingTypes}
          onChangeText={setTrainingTypes}
        />

        <Text style={styles.label}>Client types</Text>
        <FormInput
          placeholder="Comma-separated (Beginners, Athletes)"
          value={clientTypes}
          onChangeText={setClientTypes}
        />

        <Text style={styles.label}>Locations</Text>
        <FormInput
          placeholder="Comma-separated (Gym, Online)"
          value={locations}
          onChangeText={setLocations}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Math.max(insets.bottom, spacing.md) + spacing.tabBarInset,
          },
        ]}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Save Profile" onPress={handleSave} loading={submitting} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  error: {
    color: colors.Error,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
