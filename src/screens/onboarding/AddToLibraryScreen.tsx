import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { ScreenHeader, ProgressIndicator } from '../../components/layout';
import { Input, Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useOnboardingStore } from '../../store/onboardingStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'AddToLibrary'>;

const ACCESS_OPTIONS = ['Public', 'For Subscribers Only', 'Private (hidden)'];

export function AddToLibraryScreen() {
  const navigation = useNavigation<Nav>();
  const {
    programTitle,
    programDescription,
    setField,
  } = useOnboardingStore();
  const [access, setAccess] = React.useState('Public');
  const [freePreview, setFreePreview] = React.useState(true);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Add to Library"
        onBack={() => navigation.replace('WhereTrain')}
      />
      <ProgressIndicator total={6} current={2} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>About</Text>
        <Input
          placeholder="Program Title"
          value={programTitle}
          onChangeText={(t) => setField('programTitle', t)}
        />
        <Input
          placeholder="Write a short description for your clients..."
          value={programDescription}
          onChangeText={(t) => setField('programDescription', t)}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Preview</Text>
        <TouchableOpacity style={styles.uploadArea}>
          <Text style={styles.uploadText}>Tap to upload file MP4 or PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addVideo}>
          <Text style={styles.addVideoText}>Add another video</Text>
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            Allow free preview for first video
          </Text>
          <Switch
            value={freePreview}
            onValueChange={setFreePreview}
            trackColor={{ false: colors.Secondary2, true: colors.Accent1 }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.sectionTitle}>Access Setting</Text>
        {ACCESS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setAccess(opt)}
            style={styles.radioRow}
          >
            <View
              style={[
                styles.radio,
                access === opt && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>{opt}</Text>
          </TouchableOpacity>
        ))}

        <Button
          title="Continue"
          onPress={() => navigation.replace('WhereTrain')}
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  uploadArea: {
    backgroundColor: colors.Secondary2,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  uploadText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  addVideo: {
    marginBottom: spacing.lg,
  },
  addVideoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  toggleLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  radioSelected: {
    borderColor: colors.Accent1,
    backgroundColor: colors.Accent1,
  },
  radioLabel: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  button: {
    marginTop: spacing.lg,
  },
});
