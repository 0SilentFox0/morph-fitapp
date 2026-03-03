import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Card, Tag, Avatar } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Profile"
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity>
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
            <Avatar name="Olivia Matthews" size={120} />
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>Filled 84%</Text>
            </View>
          </View>
          <Text style={styles.profileName}>Olivia Matthews</Text>
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
          <Text style={styles.availabilityText}>Mon - Fri: 08:00 - 17:00</Text>
        </Card>

        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.bullet}>• 8 years of coaching experience specializing in HIIT and mobility training.</Text>
        <Text style={styles.bullet}>• NASM certified personal trainer with a focus on functional fitness and injury prevention.</Text>

        <Text style={styles.sectionTitle}>Training Types</Text>
        <View style={styles.tagsRow}>
          {['Yoga', 'Cardio', 'HIIT', 'Mobility', 'Strength', 'Pilates'].map((t) => (
            <Tag key={t} label={t} variant="default" style={styles.tag} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Clients</Text>
        <View style={styles.tagsRow}>
          {['Beginners', 'Women 40+', 'Office Workers', 'Athletes'].map((c) => (
            <Tag key={c} label={c} variant="default" style={styles.tag} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Style</Text>
        <View style={styles.tagsRow}>
          {['Motivational', 'Adaptive', 'Goal-Oriented'].map((s) => (
            <Tag key={s} label={s} variant="default" style={styles.tag} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrap: {
    position: 'relative',
  },
  completionBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  completionText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  profileName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  profileTitle: {
    fontSize: typography.sizes.base,
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
    marginBottom: spacing.md,
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
  bullet: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
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
});
