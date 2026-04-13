import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ProfilePhoto'>;

export function ProfilePhotoScreen() {
  const navigation = useNavigation<Nav>();
  const { profilePhotoUri, setField } = useOnboardingStore();

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setField('profilePhotoUri', result.assets[0].uri);
    }
  };

  const handleRemove = () => {
    setField('profilePhotoUri', null);
  };

  return (
    <OnboardingLayout
      step={8}
      title="Add a profile photo"
      subtitle="Clients will see this on your profile"
      centerContent
      onNext={() => navigation.navigate('PreviewProfile')}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('PreviewProfile')}
    >
      <TouchableOpacity
        style={styles.uploadCircle}
        onPress={handlePickImage}
        accessibilityRole="button"
        accessibilityLabel="Upload profile photo"
      >
        {profilePhotoUri ? (
          <Image source={{ uri: profilePhotoUri }} style={styles.photo} />
        ) : (
          <>
            <Ionicons name="person" size={64} color={colors.textMuted} />
            <Text style={styles.uploadText}>Tap to upload photo</Text>
          </>
        )}
      </TouchableOpacity>
      {profilePhotoUri && (
        <TouchableOpacity onPress={handleRemove} style={styles.removeBtn} accessibilityLabel="Remove photo">
          <Ionicons name="trash-outline" size={18} color={colors.Error} />
          <Text style={styles.removeText}>Remove photo</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.hint}>Recommended size: square, min 300x300px</Text>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  uploadCircle: { width: 200, height: 200, borderRadius: 100, backgroundColor: colors.neutral2, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, overflow: 'hidden' },
  photo: { width: 200, height: 200, borderRadius: 100 },
  uploadText: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: spacing.sm },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  removeText: { fontSize: typography.sizes.sm, color: colors.Error },
  hint: { fontSize: typography.sizes.xs, color: colors.textMuted },
});
