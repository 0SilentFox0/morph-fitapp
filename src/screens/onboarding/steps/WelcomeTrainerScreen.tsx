import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'WelcomeTrainer'>;

export function WelcomeTrainerScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <OnboardingLayout
      title="Welcome, Trainer!"
      subtitle="Let's set up your profile to start working"
      showFooter={false}
    >
      <View style={styles.card}>
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.baseFill} />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(49,13,0,0.6)', 'rgba(174,69,31,0.45)']}
            locations={[0, 0.4, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(240,119,75,0.3)', 'rgba(255,180,153,0.25)']}
            locations={[0, 0.55, 0.85, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.profileBox}>
            <View style={styles.avatarCircle}>
              <Ionicons name="sparkles" size={40} color={colors.accent} />
            </View>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonBar} />
              <View style={styles.skeletonBar} />
            </View>
            <View style={[styles.skeletonBar, styles.skeletonBarWide]} />
          </View>

          <Text style={styles.hint}>
            Clients will discover you once{'\n'}your profile is ready
          </Text>
        </View>
      </View>

      <Button
        title="Let's Go"
        onPress={() => navigation.navigate('WhatsYourName')}
        style={styles.button}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 525,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  baseFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  profileBox: {
    width: 192,
    height: 192,
    borderRadius: 24,
    backgroundColor: colors.neutral1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonBar: {
    width: 48,
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.neutral4,
  },
  skeletonBarWide: {
    width: 96,
  },
  hint: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral8,
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});
