import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ProgressIndicator } from '../../components/layout';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useOnboardingStore } from '../../store/onboardingStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'HavePrograms'>;

export function HaveProgramsScreen() {
  const navigation = useNavigation<Nav>();
  const { setField } = useOnboardingStore();

  const handleUpload = () => {
    setField('hasPrograms', true);
    navigation.navigate('AddToLibrary');
  };

  const handleLater = () => {
    setField('hasPrograms', false);
    navigation.navigate('WhereTrain');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <ProgressIndicator total={6} current={1} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Do you already have training programs?
        </Text>
        <Text style={styles.subtitle}>
          Upload your templates if you want to use them right away
        </Text>

        <TouchableOpacity onPress={handleUpload} activeOpacity={0.8}>
          <View style={styles.optionCard}>
            <Text style={styles.optionText}>
              Yes, I want to upload now
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLater} activeOpacity={0.8}>
          <View style={[styles.optionCard, styles.optionCardSelected]}>
            <Text style={styles.optionTextSelected}>
              No, I'll add them later
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
  optionCard: {
    backgroundColor: colors.Secondary2,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.Accent1,
  },
  optionText: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  optionTextSelected: {
    fontSize: typography.sizes.base,
    color: '#FFFFFF',
    fontWeight: typography.weights.medium,
  },
});
