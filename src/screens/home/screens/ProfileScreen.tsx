import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { Card, Tag, Avatar } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { useOnboardingStore } from '../../../store/onboardingStore';

export function ProfileScreen() {
  const navigation = useNavigation();
  const userName = useAppStore((s) => s.userName);
  const points = useAppStore((s) => s.points);
  const {
    name,
    profilePhotoUri,
    trainingTypes,
    clientTypes,
    locations,
    experienceYears,
    workDays,
    workTimeStart,
    workTimeEnd,
    certifications,
  } = useOnboardingStore();

  const displayName = userName || name || 'Trainer';
  const displayLocation = locations.length ? locations.join(', ') : 'Not set';
  const displayExperience = experienceYears || 'Not set';
  const displayAvailability = workDays.length
    ? `${workDays.map((d) => d.slice(0, 3)).join(', ')}: ${workTimeStart} - ${workTimeEnd}`
    : `${workTimeStart} - ${workTimeEnd}`;
  const displayTrainingTypes = trainingTypes.length
    ? trainingTypes
    : ['Yoga', 'Cardio', 'HIIT', 'Mobility', 'Strength', 'Pilates'];
  const displayClientTypes = clientTypes.length
    ? clientTypes
    : ['Beginners', 'Women 40+', 'Office Workers', 'Athletes'];
  const profileTitle = trainingTypes.length
    ? `${trainingTypes.slice(0, 2).join(' & ')} Coach`
    : 'Fitness Coach';

  const totalFields = 6;
  const filledFields = [
    name.trim().length > 0,
    trainingTypes.length > 0,
    clientTypes.length > 0,
    locations.length > 0,
    experienceYears.length > 0,
    profilePhotoUri != null,
  ].filter(Boolean).length;
  const completionPct = Math.round((filledFields / totalFields) * 100);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Profile"
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit profile">
            <Ionicons name="pencil" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <Avatar name={displayName} uri={profilePhotoUri} size={120} />
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>Filled {completionPct}%</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileTitle}>{profileTitle}</Text>
          {points > 0 && (
            <View style={styles.pointsRow}>
              <Ionicons name="diamond" size={14} color={colors.accent} />
              <Text style={styles.pointsText}>{points} points</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Card style={styles.infoCard}>
            <Ionicons name="location" size={20} color={colors.textSecondary} />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{displayLocation}</Text>
            </View>
          </Card>
          <Card style={styles.infoCard}>
            <Ionicons name="briefcase" size={20} color={colors.textSecondary} />
            <View>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{displayExperience}</Text>
            </View>
          </Card>
        </View>

        {certifications.length > 0 && (
          <View style={styles.certRow}>
            <Ionicons name="ribbon" size={20} color={colors.Success} />
            <Text style={styles.certText}>
              {certifications.length} certification{certifications.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Availability</Text>
        <Card style={[styles.card, styles.availabilityCard]}>
          <Ionicons name="time" size={20} color={colors.text} />
          <Text style={styles.availabilityText}>{displayAvailability}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Training Types</Text>
        <View style={styles.tagsRow}>
          {displayTrainingTypes.map((t) => (
            <Tag key={t} label={t} variant="default" />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Clients</Text>
        <View style={styles.tagsRow}>
          {displayClientTypes.map((c) => (
            <Tag key={c} label={c} variant="default" />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset },
  profileHeader: { alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap: { position: 'relative' },
  completionBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  completionText: { fontSize: typography.sizes.xs, color: colors.text },
  profileName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  profileTitle: { fontSize: typography.sizes.base, color: colors.textSecondary, marginTop: spacing.xs },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  pointsText: { fontSize: typography.sizes.sm, color: colors.accent, fontWeight: typography.weights.semibold },
  infoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  infoCard: { flex: 1, flexDirection: 'column', gap: spacing.xs },
  infoLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  infoValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.text },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  certText: { fontSize: typography.sizes.sm, color: colors.Success },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text, marginBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  availabilityCard: { backgroundColor: colors.primary2 },
  availabilityText: { fontSize: typography.sizes.base, color: colors.text },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
});
