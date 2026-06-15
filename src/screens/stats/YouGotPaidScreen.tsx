import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import type { StatsStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import theme from '../../theme';
const { colors, radius, typography, spacing } = theme;

type Nav = NativeStackNavigationProp<StatsStackParamList, 'YouGotPaid'>;

export function YouGotPaidScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>You got paid!</Text>
        <Text style={styles.subtitle}>Track your earnings and manage your finances with ease.</Text>

        <View style={styles.achievementCard}>
          <LinearGradient
            colors={['#1D1D1D', 'rgba(121,26,31,0)', 'rgba(174,69,31,0.45)']}
            locations={[0, 0.55, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={32} color={colors.neutral1} />
          </View>
          <Text style={styles.achievementLabel}>Achievement unlocked</Text>
          <Text style={styles.achievementTitle}>First Transaction Recorded</Text>
          <Text style={styles.achievementDesc}>
            Earn more achievements by uploading content or getting reviews
          </Text>
        </View>

        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>+ 20</Text>
          <Ionicons name="sparkles" size={16} color={colors.text} />
        </View>

        <Button
          title="Go to Homepage"
          onPress={() => navigation.getParent()?.navigate('HomeTab' as never)}
          style={styles.primaryBtn}
        />
        <Button
          title="Record More Transactions"
          onPress={() => navigation.navigate('Transactions')}
          variant="secondary"
          style={styles.secondaryBtn}
        />
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
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  achievementCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  trophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  achievementLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  achievementDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral2,
    marginBottom: spacing.xl,
  },
  pointsText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  primaryBtn: {
    width: '100%',
    marginBottom: spacing.md,
  },
  secondaryBtn: {
    width: '100%',
  },
});
