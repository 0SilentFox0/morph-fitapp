import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Button, IconButton } from '../../components/ui';
import { ProgressIndicator } from '../../components/layout';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useOnboardingStore } from '../../store/onboardingStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Experience'>;

const EXPERIENCE_OPTIONS = ['1-3 years', '4-6 years', '7-9 years', '10+ years'];

export function ExperienceScreen() {
  const navigation = useNavigation<Nav>();
  const { experienceYears, hasCertifications, setField } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <ProgressIndicator total={3} current={2} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tell us about your experience</Text>
        <Text style={styles.subtitle}>This helps clients trust your skills</Text>

        <View style={styles.optionsRow}>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setField('experienceYears', opt)}
              style={[
                styles.option,
                experienceYears === opt && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  experienceYears === opt && styles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.certRow}>
          <Text style={styles.certLabel}>I have certifications</Text>
          <Switch
            value={hasCertifications}
            onValueChange={(v) => setField('hasCertifications', v)}
            trackColor={{ false: colors.Secondary2, true: colors.Accent1 }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Button
          title="Upload certificate"
          onPress={() => {}}
          variant="secondary"
          style={styles.uploadBtn}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.skip} onPress={() => navigation.navigate('TrainingTypes')}>
          Skip
        </Text>
        <View style={styles.navButtons}>
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
          <IconButton
            icon="arrow-forward"
            onPress={() => navigation.navigate('TrainingTypes')}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 60,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  logoText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.Secondary2,
  },
  optionSelected: {
    backgroundColor: colors.Accent1,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  certLabel: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  uploadBtn: {
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  skip: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
