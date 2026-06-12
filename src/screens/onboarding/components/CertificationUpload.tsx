import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useShallow } from 'zustand/react/shallow';
import { Checkbox } from './Checkbox';

/** Trainer experience step: "I have certifications" + certificate uploads. */
export function CertificationUpload() {
  const { hasCertifications, certifications, setField, addCertification, removeCertification } =
    useOnboardingStore(
      useShallow((s) => ({
        hasCertifications: s.hasCertifications,
        certifications: s.certifications,
        setField: s.setField,
        addCertification: s.addCertification,
        removeCertification: s.removeCertification,
      }))
    );

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const existing = new Set(certifications.map((c) => c.uri));
      result.assets.forEach((asset) => {
        if (!existing.has(asset.uri)) addCertification({ name: asset.name, uri: asset.uri });
      });
    } catch (e) {
      console.warn('[CertificationUpload] DocumentPicker failed:', e);
      Alert.alert('Error', 'Could not pick document. Please try again.');
    }
  };

  return (
    <>
      <Checkbox
        checked={hasCertifications}
        onToggle={() => setField('hasCertifications', !hasCertifications)}
        label="I have certifications"
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} activeOpacity={0.8}>
        <Ionicons name="cloud-upload-outline" size={16} color={colors.neutral9} />
        <Text style={styles.uploadText}>
          {certifications.length ? 'Add another certificate' : 'Upload certificate'}
        </Text>
      </TouchableOpacity>

      {certifications.map((cert) => (
        <View key={cert.uri} style={styles.certChip}>
          <Ionicons name="document-text" size={16} color={colors.text} />
          <Text style={styles.certName} numberOfLines={1}>
            {cert.name}
          </Text>
          <TouchableOpacity
            onPress={() => removeCertification(cert.uri)}
            accessibilityLabel={`Remove ${cert.name}`}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
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
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  certName: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
});
