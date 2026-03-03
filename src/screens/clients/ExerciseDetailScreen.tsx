import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Card, IconButton } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const SETS = ['Set 1', 'Set 2', 'Set 3'];

export function ExerciseDetailScreen() {
  const [activeSet, setActiveSet] = React.useState(0);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Exercise" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.videoArea} />

        <View style={styles.setTabs}>
          {SETS.map((s, i) => (
            <TouchableOpacity
              key={s}
              onPress={() => setActiveSet(i)}
              style={[
                styles.setTab,
                i === activeSet && styles.setTabActive,
              ]}
            >
              <Text
                style={[
                  styles.setTabText,
                  i === activeSet && styles.setTabTextActive,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Main info</Text>
        <View style={styles.mainInfoRow}>
          <Card style={styles.infoBox}>
            <Text style={styles.infoValue}>40 kg</Text>
          </Card>
          <Card style={styles.infoBox}>
            <Text style={styles.infoValue}>30x</Text>
          </Card>
          <Card style={styles.infoBox}>
            <Text style={styles.infoValue}>40s</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Trainer Notes</Text>
        <Card style={styles.notesCard}>
          <Text style={styles.notesText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </Card>

        <View style={styles.mediaControls}>
          <IconButton icon="play-back" onPress={() => {}} />
          <View style={styles.playButton}>
            <Ionicons name="play" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.timer}>04:52</Text>
          <IconButton icon="play-forward" onPress={() => {}} />
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
    paddingBottom: spacing['2xl'],
  },
  videoArea: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.Secondary2,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  setTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  setTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.Secondary2,
  },
  setTabActive: {
    backgroundColor: colors.Accent1,
  },
  setTabText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  setTabTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  mainInfoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
  },
  infoValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  notesCard: {
    marginBottom: spacing.lg,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  mediaControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.Accent1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
});
