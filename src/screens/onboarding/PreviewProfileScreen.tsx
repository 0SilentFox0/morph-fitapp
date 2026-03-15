import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Tag, Avatar } from '../../components/ui';
import { ProgressIndicator } from '../../components/layout';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useOnboardingStore } from '../../store/onboardingStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PreviewProfile'>;

export function PreviewProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { name, trainingTypes, clientTypes } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <ProgressIndicator total={6} current={6} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Preview your trainer profile</Text>
        <Text style={styles.subtitle}>
          Make sure everything looks good before publishing
        </Text>

        <View style={styles.profileHeader}>
          <Avatar name={name || 'Olivia Matthews'} size={80} />
          <Text style={styles.profileName}>{name || 'Olivia Matthews'}</Text>
          <Text style={styles.profileTitle}>HIIT & Mobility Coach</Text>
        </View>

        <View style={styles.infoRow}>
          <Card style={styles.infoCard}>
            <Ionicons name="location" size={20} color={colors.textSecondary} />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>Berlin</Text>
            </View>
          </Card>
          <Card style={styles.infoCard}>
            <Ionicons name="cash" size={20} color={colors.textSecondary} />
            <View>
              <Text style={styles.infoLabel}>Pricing</Text>
              <Text style={styles.infoValue}>$35/session</Text>
            </View>
          </Card>
          <Card style={styles.infoCard}>
            <Ionicons name="briefcase" size={20} color={colors.textSecondary} />
            <View>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>3-5 yrs</Text>
            </View>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Availability</Text>
        <Card style={[styles.card, styles.availabilityCard]}>
          <Ionicons name="time" size={20} color={colors.text} />
          <Text style={styles.availabilityText}>Mon - Fri 08:00 - 17:00</Text>
        </Card>

        <Text style={styles.sectionTitle}>Training Types</Text>
        <View style={styles.tagsRow}>
          {(trainingTypes.length ? trainingTypes : ['Yoga', 'Cardio', 'HIIT', 'Mobility', 'Strength', 'Pilates']).map(
            (t) => (
              <Tag key={t} label={t} variant="default" style={styles.tag} />
            )
          )}
        </View>

        <Text style={styles.sectionTitle}>Clients</Text>
        <View style={styles.tagsRow}>
          {(clientTypes.length ? clientTypes : ['Beginners', 'Women 40+', 'Office Workers', 'Athletes']).map(
            (c) => (
              <Tag key={c} label={c} variant="default" style={styles.tag} />
            )
          )}
        </View>

        <Button
          title="Publish Profile"
          onPress={() => navigation.navigate('YoureAllSet')}
          style={styles.publishBtn}
        />
        <Button
          title="Edit Info"
          onPress={() => navigation.goBack()}
          variant="outline"
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
    paddingBottom: spacing['2xl'],
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  profileTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  availabilityCard: {
    backgroundColor: colors.Accent2,
  },
  availabilityText: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tag: {
    marginRight: 0,
  },
  publishBtn: {
    marginBottom: spacing.md,
  },
});
