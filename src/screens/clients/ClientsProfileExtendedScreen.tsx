import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ClientsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { Avatar, SectionTitle, Button } from '../../components/ui';
import { ProgramPickerModal } from '../home/screens/SessionForm/ProgramPickerModal';
import { TrainingHistoryCard } from './ClientProfile/TrainingHistoryCard';
import { NextTrainingCard } from './ClientProfile/NextTrainingCard';
import { ClientInfoSection } from './ClientProfile/ClientInfoSection';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { useTrainingHistoryStore } from '../../store/trainingHistoryStore';
import { useSessionsStore } from '../../store/sessionsStore';
import { useProgramsStore } from '../../store/programsStore';
import { seedParticipant, trainingMetric, buildLineChart, getChartWidth } from '../../utils';
import { useDisclosure } from '../../hooks/ui/useDisclosure';
import { mockClients, mockTrainingPrograms } from '../../mocks';
import theme from '../../theme';
const { colors, createChartConfig, radius, typography, spacing } = theme;

type Route = RouteProp<ClientsStackParamList, 'ClientsProfileExtended'>;
type Nav = NativeStackNavigationProp<ClientsStackParamList, 'ClientsProfileExtended'>;

const CHART_WIDTH = getChartWidth(20);

const chartConfig = createChartConfig();

export function ClientsProfileExtendedScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const clientId = route.params?.clientId;

  const fromTraining = useActiveTrainingStore((s) => s.participants.find((c) => c.participantId === clientId));
  const startTraining = useActiveTrainingStore((s) => s.startTraining);
  const getClientHistory = useTrainingHistoryStore((s) => s.getClientHistory);
  const getLastSets = useTrainingHistoryStore((s) => s.getLastSets);
  const sessions = useSessionsStore((s) => s.sessions);
  const programs = useProgramsStore((s) => s.programs);

  const name =
    fromTraining?.name ?? mockClients.find((c) => c.id === clientId)?.name ?? 'Brooklyn Simmons';

  const programPicker = useDisclosure();

  const history = getClientHistory(name);
  const nextSession = sessions.find(
    (s) => s.status === 'pending' && s.participants.some((p) => p.name === name),
  );

  const handleStart = (programId: string) => {
    programPicker.close();
    const program =
      programs.find((p) => p.id === programId) ??
      mockTrainingPrograms.find((p) => p.id === programId);
    if (!program) return;
    const participant = seedParticipant(
      { id: clientId ?? name, name, avatar: fromTraining?.avatar },
      program,
      { lookupPrevSets: getLastSets },
    );
    startTraining([participant], participant.participantId);
    navigation.navigate('ClientProfile', { clientId: participant.participantId });
  };

  const chartData = buildLineChart(history, (h) => h.date, trainingMetric);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Client's Profile"
        rightElement={
          <TouchableOpacity>
            <Ionicons name="pencil" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Avatar uri={fromTraining?.avatar} name={name} size={96} />
          <Text style={styles.clientName}>{name}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusDot}>•</Text>
            <Text style={styles.status}>Personal</Text>
            <Text style={styles.statusDot}>•</Text>
            <Text style={styles.status}>Group</Text>
          </View>
        </View>

        <Button title="Start training" onPress={programPicker.open} style={styles.startBtn} />

        <View style={styles.sectionHeader}>
          <SectionTitle style={styles.sectionTitleInline}>Next training</SectionTitle>
        </View>
        <NextTrainingCard session={nextSession} />

        <ClientInfoSection />

        {chartData && (
          <>
            <SectionTitle>Progress</SectionTitle>
            <View style={styles.chartCard}>
              <LineChart
                data={chartData}
                width={CHART_WIDTH}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>
          </>
        )}

        <SectionTitle>Training History</SectionTitle>
        {history.length === 0 ? (
          <Text style={styles.emptyNote}>No completed trainings yet.</Text>
        ) : (
          [...history].reverse().map((h) => (
            <TrainingHistoryCard
              key={h.id}
              training={h}
              program={mockTrainingPrograms.find((p) => p.id === h.programId)}
            />
          ))
        )}
      </ScrollView>

      <ProgramPickerModal
        visible={programPicker.visible}
        onClose={programPicker.close}
        programs={programs}
        value={undefined}
        onChange={handleStart}
      />
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
    marginBottom: spacing.lg,
  },
  clientName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusDot: {
    fontSize: typography.sizes.base,
    color: colors.neutral7,
  },
  status: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  startBtn: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleInline: {
    marginBottom: spacing.md,
  },
  emptyNote: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  chartCard: {
    backgroundColor: colors.neutral1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  chart: {
    borderRadius: radius.sm,
  },
});
