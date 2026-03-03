import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatsStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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
        <Text style={styles.subtitle}>
          Track your earnings and manage your finances with ease.
        </Text>

        <Card style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Ionicons name="trophy" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.achievementLabel}>Achievement unlocked</Text>
          <Text style={styles.achievementTitle}>First Transaction Recorded</Text>
          <Text style={styles.achievementDesc}>
            Earn more achievements by uploading content or getting reviews
          </Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>+20</Text>
            <Ionicons name="star" size={16} color={colors.text} />
          </View>
        </Card>

        <Button
          title="Go to Homepage"
          onPress={() => navigation.navigate('BusinessAnalytics')}
          style={styles.primaryBtn}
        />
        <Button
          title="Record More Transactions"
          onPress={() => navigation.navigate('Transactions')}
          variant="secondary"
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
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
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  achievementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.Accent1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
    marginBottom: spacing.sm,
  },
  achievementDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
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
});
