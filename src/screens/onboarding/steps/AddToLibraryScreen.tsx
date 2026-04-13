import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { ScreenHeader, ProgressIndicator } from '../../../components/layout';
import { Input, Button } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import type { AccessSetting } from '../../../store/onboardingStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'AddToLibrary'>;

const ACCESS_OPTIONS: { value: AccessSetting; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'subscribers', label: 'For Subscribers Only' },
  { value: 'private', label: 'Private (hidden)' },
];

export function AddToLibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { programTitle, programDescription, freePreview, accessSetting, setField } = useOnboardingStore();
  const [titleError, setTitleError] = React.useState('');

  const handleContinue = () => {
    if (programTitle.trim().length < 2) {
      setTitleError('Title must be at least 2 characters');
      return;
    }
    navigation.navigate('WhereTrain');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Add to Library" onBack={() => navigation.goBack()} />
      <ProgressIndicator total={9} current={5} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>About</Text>
        <Input
          placeholder="Program Title"
          value={programTitle}
          onChangeText={(t) => { setField('programTitle', t); setTitleError(''); }}
          accessibilityLabel="Program title"
        />
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
        <Input
          placeholder="Write a short description for your clients..."
          value={programDescription}
          onChangeText={(t) => setField('programDescription', t)}
          multiline
          numberOfLines={4}
          accessibilityLabel="Program description"
        />

        <Text style={styles.sectionTitle}>Preview</Text>
        <TouchableOpacity style={styles.uploadArea} accessibilityRole="button" accessibilityLabel="Upload file">
          <Text style={styles.uploadText}>Tap to upload file MP4 or PDF</Text>
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Allow free preview for first video</Text>
          <Switch value={freePreview} onValueChange={(v) => setField('freePreview', v)} trackColor={{ false: colors.neutral2, true: colors.accent }} thumbColor="#FFFFFF" />
        </View>

        <Text style={styles.sectionTitle}>Access Setting</Text>
        {ACCESS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setField('accessSetting', opt.value)}
            style={styles.radioRow}
            accessibilityRole="radio"
            accessibilityState={{ checked: accessSetting === opt.value }}
          >
            <View style={[styles.radio, accessSetting === opt.value && styles.radioSelected]} />
            <Text style={styles.radioLabel}>{opt.label}</Text>
          </TouchableOpacity>
        ))}

        <Button title="Continue" onPress={handleContinue} style={styles.button} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['2xl'] },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
  uploadArea: { backgroundColor: colors.neutral2, borderRadius: 12, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md },
  uploadText: { fontSize: typography.sizes.sm, color: colors.textMuted },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  toggleLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, marginRight: spacing.sm },
  radioSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  radioLabel: { fontSize: typography.sizes.base, color: colors.text },
  button: { marginTop: spacing.lg },
  errorText: { fontSize: typography.sizes.xs, color: colors.Error, marginTop: spacing.xs },
});
