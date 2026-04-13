import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import type { AccessSetting } from '../../../store/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Tag, Avatar } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PreviewProfile'>;

function accessLabel(setting: AccessSetting): string {
  switch (setting) {
    case 'public':
      return 'Public';
    case 'subscribers':
      return 'Subscribers only';
    case 'private':
      return 'Private';
    default:
      return setting;
  }
}

export function PreviewProfileScreen() {
  const navigation = useNavigation<Nav>();
  const {
    name,
    trainingTypes,
    clientTypes,
    locations,
    experienceYears,
    workDays,
    workTimeStart,
    workTimeEnd,
    sameSlotsEveryWeek,
    certifications,
    profilePhotoUri,
    hasPrograms,
    programTitle,
    programDescription,
    hasCertifications,
    freePreview,
    accessSetting,
  } = useOnboardingStore();

  const displayName = name.trim() || 'Trainer';
  const displayLocation = locations.length ? locations.join(', ') : 'Not set';
  const displayExperience = experienceYears || 'Not set';
  const displayAvailability = workDays.length
    ? `${workDays.map((d) => d.slice(0, 3)).join(', ')} ${workTimeStart} – ${workTimeEnd}`
    : `${workTimeStart} – ${workTimeEnd}`;

  return (
    <OnboardingLayout
      step={9}
      title="Preview your trainer profile"
      subtitle="Make sure everything looks good before publishing"
      showFooter={false}
    >
      <View style={styles.profileHeader}>
        <Avatar name={displayName} uri={profilePhotoUri} size={80} />
        <Text style={styles.profileName}>{displayName}</Text>
        {trainingTypes.length > 0 && (
          <Text style={styles.profileTitle}>{trainingTypes.slice(0, 3).join(' & ')} Coach</Text>
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

      <Text style={styles.sectionTitle}>Certifications</Text>
      <Card style={styles.card}>
        <Ionicons name="ribbon" size={20} color={colors.textSecondary} />
        <View style={styles.cardBody}>
          <Text style={styles.infoLabel}>Plans to add certifications</Text>
          <Text style={styles.infoValue}>{hasCertifications ? 'Yes' : 'No'}</Text>
          <Text style={[styles.infoLabel, styles.metaSpaced]}>Uploaded</Text>
          <Text style={styles.infoValue}>
            {certifications.length === 0
              ? 'None'
              : `${certifications.length} file${certifications.length > 1 ? 's' : ''}`}
          </Text>
          {certifications.length > 0 && (
            <Text style={styles.certNames}>
              {certifications.map((c) => c.name).join(', ')}
            </Text>
          )}
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Availability</Text>
      <Card style={[styles.card, styles.availabilityCard]}>
        <Ionicons name="time" size={20} color={colors.text} />
        <View style={styles.cardBody}>
          <Text style={styles.availabilityText}>{displayAvailability}</Text>
          <Text style={[styles.infoLabel, styles.metaSpaced]}>Same slots every week</Text>
          <Text style={styles.infoValue}>{sameSlotsEveryWeek ? 'Yes' : 'No'}</Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Access & preview</Text>
      <View style={styles.infoRow}>
        <Card style={styles.infoCard}>
          <Ionicons name="eye" size={20} color={colors.textSecondary} />
          <View>
            <Text style={styles.infoLabel}>Free preview</Text>
            <Text style={styles.infoValue}>{freePreview ? 'On' : 'Off'}</Text>
          </View>
        </Card>
        <Card style={styles.infoCard}>
          <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
          <View>
            <Text style={styles.infoLabel}>Access</Text>
            <Text style={styles.infoValue}>{accessLabel(accessSetting)}</Text>
          </View>
        </Card>
      </View>

      {trainingTypes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Training Types</Text>
          <View style={styles.tagsRow}>
            {trainingTypes.map((t) => (
              <Tag key={t} label={t} variant="default" />
            ))}
          </View>
        </>
      )}

      {clientTypes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Clients</Text>
          <View style={styles.tagsRow}>
            {clientTypes.map((c) => (
              <Tag key={c} label={c} variant="default" />
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Programs</Text>
      <Card style={styles.card}>
        <Ionicons name="library" size={20} color={colors.textSecondary} />
        <View style={styles.cardBody}>
          <Text style={styles.infoLabel}>Has programs</Text>
          <Text style={styles.infoValue}>{hasPrograms ? 'Yes' : 'No'}</Text>
          <Text style={[styles.infoLabel, styles.metaSpaced]}>Title</Text>
          <Text style={styles.programText}>{programTitle.trim() || '—'}</Text>
          <Text style={[styles.infoLabel, styles.metaSpaced]}>Description</Text>
          <Text style={styles.programDesc}>{programDescription.trim() || '—'}</Text>
        </View>
      </Card>

      <Button
        title="Publish Profile"
        onPress={() => navigation.navigate('YoureAllSet')}
        style={styles.publishBtn}
      />
      <Button title="Edit Info" onPress={() => navigation.goBack()} variant="outline" />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', marginBottom: spacing.lg },
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
  infoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  infoCard: { flex: 1, flexDirection: 'column', gap: spacing.xs },
  infoLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  cardBody: { flex: 1, gap: spacing.xs },
  metaSpaced: { marginTop: spacing.sm },
  certNames: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.lg },
  availabilityCard: { backgroundColor: colors.primary2 },
  availabilityText: { fontSize: typography.sizes.base, color: colors.text },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  programText: { fontSize: typography.sizes.base, color: colors.text },
  programDesc: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  publishBtn: { marginBottom: spacing.md },
});
