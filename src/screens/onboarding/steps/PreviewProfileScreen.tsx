import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  Avatar,
  Button,
  Card,
  SectionTitle,
  Tag,
} from '../../../components/ui';
import theme from '../../../theme';

const { colors, typography, spacing } = theme;

import { useShallow } from 'zustand/react/shallow';

import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { useOnboardingScreen } from '../hooks/useOnboardingScreen';

function availabilityText(
  workDays: string[],
  workTimeStart: string,
  workTimeEnd: string
): string {
  return workDays.length
    ? `${workDays.map((d) => d.slice(0, 3)).join(', ')} ${workTimeStart} – ${workTimeEnd}`
    : `${workTimeStart} – ${workTimeEnd}`;
}

export function PreviewProfileScreen() {
  const { navigation, isClient } = useOnboardingScreen('PreviewProfile');

  const s = useOnboardingStore(
    useShallow((st) => ({
      name: st.name,
      trainingTypes: st.trainingTypes,
      clientTypes: st.clientTypes,
      locations: st.locations,
      experienceYears: st.experienceYears,
      workDays: st.workDays,
      workTimeStart: st.workTimeStart,
      workTimeEnd: st.workTimeEnd,
      sameSlotsEveryWeek: st.sameSlotsEveryWeek,
      certifications: st.certifications,
      profilePhotoUri: st.profilePhotoUri,
      hasCertifications: st.hasCertifications,
      selfLevel: st.selfLevel,
      hasInjuries: st.hasInjuries,
      injuriesNote: st.injuriesNote,
      preferredTrainerGender: st.preferredTrainerGender,
      preferredFormat: st.preferredFormat,
    }))
  );

  const displayName = s.name.trim() || (isClient ? 'Client' : 'Trainer');

  const displayLocation = s.locations.length
    ? s.locations.join(', ')
    : 'Not set';

  const displayAvailability = availabilityText(
    s.workDays,
    s.workTimeStart,
    s.workTimeEnd
  );

  return (
    <OnboardingLayout
      title={isClient ? 'Preview your profile' : 'Preview your trainer profile'}
      subtitle="Make sure everything looks good before publishing"
      showFooter={false}
    >
      <View style={styles.profileHeader}>
        <Avatar name={displayName} uri={s.profilePhotoUri} size={80} />
        <Text style={styles.profileName}>{displayName}</Text>
        {isClient
          ? s.selfLevel !== '' && (
              <Text style={styles.profileTitle}>{s.selfLevel}</Text>
            )
          : s.trainingTypes.length > 0 && (
              <Text style={styles.profileTitle}>
                {s.trainingTypes.slice(0, 3).join(' & ')} Coach
              </Text>
            )}
      </View>

      {isClient ? (
        <>
          <View style={styles.infoRow}>
            <Card style={styles.infoCard}>
              <Ionicons name="time" size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.infoLabel}>Training for</Text>
                <Text style={styles.infoValue}>
                  {s.experienceYears || 'Not set'}
                </Text>
              </View>
            </Card>
            <Card style={styles.infoCard}>
              <Ionicons name="podium" size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.infoLabel}>Level</Text>
                <Text style={styles.infoValue}>{s.selfLevel || 'Not set'}</Text>
              </View>
            </Card>
          </View>

          <SectionTitle style={styles.sectionTitleSpacing}>
            Injuries & limitations
          </SectionTitle>
          <Card style={styles.card}>
            <Ionicons name="medkit" size={20} color={colors.textSecondary} />
            <View style={styles.cardBody}>
              <Text style={styles.infoValue}>
                {s.hasInjuries ? 'Yes' : 'None'}
              </Text>
              {s.hasInjuries && s.injuriesNote.trim() !== '' && (
                <Text style={[styles.infoLabel, styles.metaSpaced]}>
                  {s.injuriesNote.trim()}
                </Text>
              )}
            </View>
          </Card>

          {s.trainingTypes.length > 0 && (
            <>
              <SectionTitle style={styles.sectionTitleSpacing}>
                Interested in
              </SectionTitle>
              <View style={styles.tagsRow}>
                {s.trainingTypes.map((t) => (
                  <Tag key={t} label={t} variant="default" />
                ))}
              </View>
            </>
          )}

          <SectionTitle style={styles.sectionTitleSpacing}>
            Preferred location
          </SectionTitle>
          <Card style={styles.card}>
            <Ionicons name="location" size={20} color={colors.textSecondary} />
            <View style={styles.cardBody}>
              <Text style={styles.infoValue}>{displayLocation}</Text>
            </View>
          </Card>

          <SectionTitle style={styles.sectionTitleSpacing}>
            Availability
          </SectionTitle>
          <Card style={[styles.card, styles.availabilityCard]}>
            <Ionicons name="calendar" size={20} color={colors.text} />
            <View style={styles.cardBody}>
              <Text style={styles.availabilityText}>{displayAvailability}</Text>
            </View>
          </Card>

          <SectionTitle style={styles.sectionTitleSpacing}>
            Trainer preferences
          </SectionTitle>
          <View style={styles.infoRow}>
            <Card style={styles.infoCard}>
              <Ionicons name="person" size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {s.preferredTrainerGender || 'Any'}
                </Text>
              </View>
            </Card>
            <Card style={styles.infoCard}>
              <Ionicons name="laptop" size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.infoLabel}>Format</Text>
                <Text style={styles.infoValue}>
                  {s.preferredFormat.length
                    ? s.preferredFormat.join(', ')
                    : 'Any'}
                </Text>
              </View>
            </Card>
          </View>
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Card style={styles.infoCard}>
              <Ionicons
                name="location"
                size={20}
                color={colors.textSecondary}
              />
              <View>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{displayLocation}</Text>
              </View>
            </Card>
            <Card style={styles.infoCard}>
              <Ionicons
                name="briefcase"
                size={20}
                color={colors.textSecondary}
              />
              <View>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoValue}>
                  {s.experienceYears || 'Not set'}
                </Text>
              </View>
            </Card>
          </View>

          <SectionTitle style={styles.sectionTitleSpacing}>
            Certifications
          </SectionTitle>
          <Card style={styles.card}>
            <Ionicons name="ribbon" size={20} color={colors.textSecondary} />
            <View style={styles.cardBody}>
              <Text style={styles.infoLabel}>Plans to add certifications</Text>
              <Text style={styles.infoValue}>
                {s.hasCertifications ? 'Yes' : 'No'}
              </Text>
              <Text style={[styles.infoLabel, styles.metaSpaced]}>
                Uploaded
              </Text>
              <Text style={styles.infoValue}>
                {s.certifications.length === 0
                  ? 'None'
                  : `${s.certifications.length} file${s.certifications.length > 1 ? 's' : ''}`}
              </Text>
              {s.certifications.length > 0 && (
                <Text style={styles.certNames}>
                  {s.certifications.map((c) => c.name).join(', ')}
                </Text>
              )}
            </View>
          </Card>

          <SectionTitle style={styles.sectionTitleSpacing}>
            Availability
          </SectionTitle>
          <Card style={[styles.card, styles.availabilityCard]}>
            <Ionicons name="time" size={20} color={colors.text} />
            <View style={styles.cardBody}>
              <Text style={styles.availabilityText}>{displayAvailability}</Text>
              <Text style={[styles.infoLabel, styles.metaSpaced]}>
                Same slots every week
              </Text>
              <Text style={styles.infoValue}>
                {s.sameSlotsEveryWeek ? 'Yes' : 'No'}
              </Text>
            </View>
          </Card>

          {s.trainingTypes.length > 0 && (
            <>
              <SectionTitle style={styles.sectionTitleSpacing}>
                Training Types
              </SectionTitle>
              <View style={styles.tagsRow}>
                {s.trainingTypes.map((t) => (
                  <Tag key={t} label={t} variant="default" />
                ))}
              </View>
            </>
          )}

          {s.clientTypes.length > 0 && (
            <>
              <SectionTitle style={styles.sectionTitleSpacing}>
                Clients
              </SectionTitle>
              <View style={styles.tagsRow}>
                {s.clientTypes.map((c) => (
                  <Tag key={c} label={c} variant="default" />
                ))}
              </View>
            </>
          )}
        </>
      )}

      <Button
        title={isClient ? 'Confirm' : 'Publish Profile'}
        onPress={() => navigation.navigate('YoureAllSet')}
        style={styles.publishBtn}
      />
      <Button
        title="Edit Info"
        onPress={() => navigation.goBack()}
        variant="outline"
      />
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
  sectionTitleSpacing: {
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  availabilityCard: { backgroundColor: colors.primary2 },
  availabilityText: { fontSize: typography.sizes.base, color: colors.text },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  publishBtn: { marginBottom: spacing.md },
});
