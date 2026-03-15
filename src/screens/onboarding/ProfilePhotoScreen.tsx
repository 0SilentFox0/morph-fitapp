import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '../../components/ui';
import { ProgressIndicator } from '../../components/layout';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ProfilePhoto'>;

export function ProfilePhotoScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <ProgressIndicator total={6} current={5} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Add a profile photo</Text>
        <Text style={styles.subtitle}>
          Clients will see this on your profile
        </Text>

        <TouchableOpacity style={styles.uploadCircle}>
          <Ionicons name="person" size={64} color={colors.textMuted} />
          <Text style={styles.uploadText}>Tap to upload photo</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          Recommended size: square, min 300x300px
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.skip} onPress={() => navigation.navigate('PreviewProfile')}>
          Skip
        </Text>
        <View style={styles.navButtons}>
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
          <IconButton
            icon="arrow-forward"
            onPress={() => navigation.navigate('PreviewProfile')}
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
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    alignSelf: 'flex-start',
  },
  uploadCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.Secondary2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
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
