import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { LinearGradient } from 'react-native-svg';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'WelcomeTrainer'>;

export function WelcomeTrainerScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <View style={styles.body}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Welcome, Trainer!</Text>
          <Text style={styles.subtitle}>Let's set up your profile to start working</Text>
          <View style={styles.iconCard}>
            <Ionicons name="sparkles" size={64} color={colors.Accent1} />
            <Text style={styles.hint}>Clients will discover your profile when it's ready</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Apply"
            onPress={() => navigation.navigate('WhatsYourName')}
            style={styles.button}
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
    paddingTop: 80,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    marginHorizontal: 'auto',
  },
  logoText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text,
    marginBottom: spacing.sm,
    marginHorizontal: 'auto',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    marginHorizontal: 'auto',
  },
  iconCard: {
    backgroundColor: '#191919',
    borderRadius: 16,
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    height: 450,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  button: {
    marginTop: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});
