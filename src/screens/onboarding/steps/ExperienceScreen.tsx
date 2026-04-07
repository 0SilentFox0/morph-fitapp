import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Experience'>;

const EXPERIENCE_OPTIONS = [
  { label: '1–3', sub: 'years' },
  { label: '4–6', sub: 'years' },
  { label: '7–9', sub: 'years' },
  { label: '10+', sub: 'years' },
];
const EXPERIENCE_VALUES = ['1-3 years', '4-6 years', '7-9 years', '10+ years'];

export function ExperienceScreen() {
  const navigation = useNavigation<Nav>();
  const { experienceYears, hasCertifications, certifications, setField, addCertification, removeCertification } = useOnboardingStore();

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        addCertification({ name: asset.name, uri: asset.uri });
      }
    } catch {
      Alert.alert('Error', 'Could not pick document. Please try again.');
    }
  };

  const toggleCerts = () => setField('hasCertifications', !hasCertifications);

  return (
    <OnboardingLayout
      step={2}
      title="Tell us about your experience"
      subtitle="This helps clients trust your skills"
      onNext={() => navigation.navigate('TrainingTypes')}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('TrainingTypes')}
    >
      <View style={styles.optionsRow}>
        {EXPERIENCE_OPTIONS.map((opt, i) => {
          const val = EXPERIENCE_VALUES[i];
          const isSelected = experienceYears === val;
          return (
            <TouchableOpacity
              key={val}
              onPress={() => setField('experienceYears', val)}
              style={[styles.option, isSelected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{opt.label}</Text>
              <Text style={[styles.optionSub, isSelected && styles.optionSubSelected]}>{opt.sub}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={toggleCerts}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: hasCertifications }}
      >
        <View style={[styles.checkbox, hasCertifications && styles.checkboxChecked]}>
          {hasCertifications && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
        </View>
        <Text style={styles.checkboxLabel}>I have certifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} activeOpacity={0.8}>
        <Ionicons name="cloud-upload-outline" size={16} color={colors.neutral9} />
        <Text style={styles.uploadText}>Upload certificate</Text>
      </TouchableOpacity>

      {certifications.map((cert) => (
        <View key={cert.uri} style={styles.certChip}>
          <Ionicons name="document-text" size={16} color={colors.text} />
          <Text style={styles.certName} numberOfLines={1}>{cert.name}</Text>
          <TouchableOpacity onPress={() => removeCertification(cert.uri)} accessibilityLabel={`Remove ${cert.name}`}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  option: {
    flex: 1,
    height: 68,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  optionSelected: {
    backgroundColor: colors.primary4,
  },
  optionLabel: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral9,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  optionSub: {
    fontSize: 12,
    lineHeight: 20,
    color: colors.neutral8,
    textAlign: 'center',
  },
  optionSubSelected: {
    color: colors.primary9,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.neutral5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxLabel: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral9,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: spacing.md,
  },
  uploadText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.neutral9,
  },
  certChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  certName: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
});
