import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClientsStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { Avatar, ClientSwitcherStrip, ProgramExerciseList } from '../../components/ui';
import type { SwitcherClient } from '../../components/ui';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { useSessionsStore } from '../../store/sessionsStore';
import { deriveActiveGroup, formatClock } from '../../utils';
import { useTrainingHistoryStore } from '../../store/trainingHistoryStore';
import { mockTrainingPrograms } from '../../mocks';
import theme from '../../theme';
const { colors, radius, typography, spacing } = theme;

type Nav = NativeStackNavigationProp<ClientsStackParamList, 'ClientProfile'>;
type Route = RouteProp<ClientsStackParamList, 'ClientProfile'>;

const PROGRAMS = mockTrainingPrograms.filter((p) => p.exercises && p.exercises.length > 0);

export function ClientProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const requestedClientId = route.params?.clientId;

  const participants = useActiveTrainingStore((s) => s.participants);
  const activeParticipantId = useActiveTrainingStore((s) => s.activeParticipantId);
  const setActiveParticipant = useActiveTrainingStore((s) => s.setActiveParticipant);
  const startTraining = useActiveTrainingStore((s) => s.startTraining);

  // Seed the active training group from today's overlapping sessions on first entry.
  React.useEffect(() => {
    if (useActiveTrainingStore.getState().participants.length === 0) {
      const group = deriveActiveGroup(
        useSessionsStore.getState().sessions,
        mockTrainingPrograms,
        useTrainingHistoryStore.getState().getLastSets,
      );
      if (group.length > 0) startTraining(group, requestedClientId);
    } else if (requestedClientId) {
      setActiveParticipant(requestedClientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeClient = participants.find((c) => c.participantId === activeParticipantId) ?? participants[0] ?? null;

  const [selectedProgramId, setSelectedProgramId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (activeClient) setSelectedProgramId(activeClient.programId);
    // reset to the client's assigned program when the active client changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClient?.participantId]);

  if (!activeClient) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Profile" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active training.</Text>
        </View>
      </View>
    );
  }

  const selectedProgram =
    PROGRAMS.find((p) => p.id === (selectedProgramId ?? activeClient.programId)) ?? PROGRAMS[0]!;

  const switcherClients: SwitcherClient[] = participants.map((c) => ({
    id: c.participantId,
    name: c.name,
    avatar: c.avatar,
    badge: c.rest.running ? formatClock(c.rest.remainingSec) : undefined,
  }));

  const assigned = mockTrainingPrograms.find((p) => p.id === activeClient.programId);
  const currentExercise = assigned?.exercises?.[activeClient.exerciseIndex];
  const subtitle = currentExercise
    ? `${currentExercise.name} · set ${activeClient.setIndex + 1}` +
      (activeClient.rest.running ? ` · rest ${formatClock(activeClient.rest.remainingSec)}` : '')
    : undefined;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title=""
        rightElement={
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('ClientsProfileExtended', { clientId: activeClient.participantId })}>
              <Ionicons name="person-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ClientSwitcherStrip
        clients={switcherClients}
        activeId={activeParticipantId}
        onSelect={setActiveParticipant}
        activeSubtitle={subtitle}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar uri={activeClient.avatar} name={activeClient.name} size={80} />
          <Text style={styles.clientName}>{activeClient.name}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            <Text style={styles.status}>Active</Text>
            <View style={[styles.dot, styles.dotMuted]} />
            <Text style={styles.status}>Group</Text>
          </View>
        </View>

        <View style={styles.programTabs}>
          {PROGRAMS.map((p, i) => {
            const active = p.id === selectedProgram.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedProgramId(p.id)}
                style={[styles.programTab, active && styles.programTabActive]}
              >
                <Text style={[styles.programTabText, active && styles.programTabTextActive]}>
                  Program {i + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ProgramExerciseList
          program={selectedProgram}
          onSelectExercise={(index) =>
            navigation.navigate('ExerciseDetail', {
              participantId: activeClient.participantId,
              programId: selectedProgram.id,
              exerciseIndex: index,
            })
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  clientName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotMuted: {
    backgroundColor: colors.neutral6,
  },
  status: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  programTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  programTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral5,
    backgroundColor: colors.neutral1,
  },
  programTabActive: {
    backgroundColor: colors.neutral3,
    borderColor: colors.neutral10,
  },
  programTabText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral8,
  },
  programTabTextActive: {
    color: colors.neutral10,
  },
});
