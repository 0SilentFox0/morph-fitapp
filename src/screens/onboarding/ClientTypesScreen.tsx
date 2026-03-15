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
import { useOnboardingStore } from '../../store/onboardingStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ClientTypes'>;

const CLIENT_TYPES = [
  'Beginners',
  'Pro',
  'Women',
  'Men',
  '50+',
  'Strength',
  'Other',
];

export function ClientTypesScreen() {
  const navigation = useNavigation<Nav>();
  const { clientTypes, toggleClientType } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <ProgressIndicator total={3} current={3} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Who do you usually train?</Text>
        <Text style={styles.subtitle}>
          Select all types of clients you work with
        </Text>

        <View style={styles.optionsGrid}>
          {CLIENT_TYPES.map((type) => {
            const isSelected = clientTypes.includes(type);
            return (
              <TouchableOpacity
                key={type}
                onPress={() => toggleClientType(type)}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.skip} onPress={() => navigation.navigate('HavePrograms')}>
          Skip
        </Text>
        <View style={styles.navButtons}>
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
          <IconButton
            icon="arrow-forward"
            onPress={() => navigation.navigate('HavePrograms')}
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
