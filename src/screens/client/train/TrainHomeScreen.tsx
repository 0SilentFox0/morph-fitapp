import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TrainStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { Card, SectionTitle, Tag, Button, EmptyState } from '../../../components/ui';
import { useSessionsStore } from '../../../store/sessionsStore';
import { mockTrainingPrograms } from '../../../mocks';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

type Nav = NavigationProp<TrainStackParamList, 'TrainHome'>;

const PROGRAMS = mockTrainingPrograms.filter((p) => (p.exercises?.length ?? 0) > 0);

export function TrainHomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const sessions = useSessionsStore((s) => s.sessions);

  // Assigned workouts = pending sessions that carry a program.
  const assigned = sessions.filter((s) => s.status === 'pending' && !!s.programId);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Train" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing['2xl'] + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle>Assigned by your trainer</SectionTitle>
        {assigned.length === 0 ? (
          <EmptyState
            icon="barbell-outline"
            title="No assigned workouts"
            subtitle="Your trainer hasn't assigned a session yet."
          />
        ) : (
          assigned.map((s) => {
            const program = mockTrainingPrograms.find((p) => p.id === s.programId);
            return (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('WorkoutOverview', { source: 'assigned', sessionId: s.id })}
              >
                <Card style={styles.assignedCard}>
                  <Text style={styles.assignedTitle}>{program?.name ?? s.title}</Text>
                  <View style={styles.tagsRow}>
                    <Tag label={s.time} variant="default" />
                    <Tag label={program?.tag ?? s.type} variant="default" />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <SectionTitle>Ready-made programs</SectionTitle>
        {PROGRAMS.map((p) => (
          <TouchableOpacity
            key={p.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WorkoutOverview', { source: 'program', programId: p.id })}
          >
            <Card style={styles.programCard}>
              <Text style={styles.assignedTitle}>{p.name}</Text>
              <View style={styles.tagsRow}>
                <Tag label={`${p.exercises!.length} exercises`} variant="default" />
                <Tag label={p.tag} variant="default" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <SectionTitle>Build your own</SectionTitle>
        <Text style={styles.hint}>Pick exercises and start a custom session.</Text>
        <Button title="Build a workout" variant="outline" onPress={() => navigation.navigate('WorkoutBuilder')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  assignedCard: { marginBottom: spacing.md },
  programCard: { marginBottom: spacing.md },
  assignedTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagsRow: { flexDirection: 'row', gap: spacing.sm },
  hint: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
});
