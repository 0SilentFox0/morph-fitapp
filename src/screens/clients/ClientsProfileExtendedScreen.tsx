import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ClientsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { Avatar, SectionTitle, Button, Tag } from '../../components/ui';
import { ProgramPickerModal } from '../home/screens/SessionForm/ProgramPickerModal';
import { useActiveTrainingStore } from '../../store/activeTrainingStore';
import { useTrainingHistoryStore } from '../../store/trainingHistoryStore';
import { useSessionsStore } from '../../store/sessionsStore';
import { useProgramsStore } from '../../store/programsStore';
import { seedActiveClient, trainingMetric, buildLineChart, getChartWidth } from '../../utils';
import { useDisclosure } from '../../hooks/useDisclosure';
import { mockClients, mockTrainingPrograms } from '../../mocks';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Route = RouteProp<ClientsStackParamList, 'ClientsProfileExtended'>;
type Nav = NativeStackNavigationProp<ClientsStackParamList, 'ClientsProfileExtended'>;

const CHART_WIDTH = getChartWidth(20);

const chartConfig = {
  backgroundColor: colors.neutral1,
  backgroundGradientFrom: colors.neutral1,
  backgroundGradientTo: colors.neutral1,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(174, 69, 31, ${opacity})`,
  labelColor: () => colors.neutral7,
  propsForBackgroundLines: { stroke: colors.neutral5, strokeDasharray: '' },
  style: { borderRadius: radius.sm },
};

export function ClientsProfileExtendedScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const clientId = route.params?.clientId;

  const fromTraining = useActiveTrainingStore((s) => s.clients.find((c) => c.clientId === clientId));
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
    const client = seedActiveClient(
      { id: clientId ?? name, name, avatar: fromTraining?.avatar },
      program,
      { lookupPrevSets: getLastSets },
    );
    startTraining([client], client.clientId);
    navigation.navigate('ClientProfile', { clientId: client.clientId });
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
        {nextSession ? (
          <LinearGradient
            colors={[colors.neutral2, colors.neutral2, 'rgba(140,30,3,0.35)']}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextCard}
          >
            <Text style={styles.nextTitle}>{nextSession.title}</Text>
            <Tag label={nextSession.type} variant="default" style={styles.nextTag} />
            <View style={styles.completedRow}>
              <View style={styles.dateChip}>
                <Ionicons name="calendar-outline" size={14} color={colors.neutral1} />
                <Text style={styles.dateChipText}>
                  {nextSession.date}: {nextSession.time}
                </Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <Text style={styles.emptyNote}>No upcoming sessions.</Text>
        )}

        <View style={styles.infoRowFull}>
          <IconSquare icon="flag" />
          <Text style={styles.infoLabel}>Target:</Text>
          <Text style={styles.infoValue}>Fat loss, Endurance</Text>
        </View>
        <View style={styles.infoColumns}>
          <View style={styles.infoCol}>
            <IconSquare icon="rocket" />
            <Text style={styles.infoLabel}>Level:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              Intermediate
            </Text>
          </View>
          <View style={styles.infoCol}>
            <IconSquare icon="walk" />
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              HIIT, Cardio
            </Text>
          </View>
        </View>

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
          [...history].reverse().map((h) => {
            const program = mockTrainingPrograms.find((p) => p.id === h.programId);
            const exerciseCount = h.exercises.length;
            return (
              <View key={h.id} style={styles.historyCard}>
                {program?.thumbnail ? (
                  <Image source={{ uri: program.thumbnail }} style={styles.historyThumb} />
                ) : (
                  <View style={styles.historyThumb} />
                )}
                <View style={styles.historyInfo}>
                  <View style={styles.historyTitleRow}>
                    <Text style={styles.historyName}>{program?.name ?? 'Training'}</Text>
                    <Text style={styles.historyDate}>{h.date}</Text>
                  </View>
                  <Text style={styles.historyType}>{program?.tag ?? '—'}</Text>
                  <View style={styles.statRow}>
                    <Stat icon="barbell-outline" value={`${exerciseCount} ex`} />
                    <Stat icon="trending-up-outline" value={trainingMetric(h)} />
                  </View>
                </View>
              </View>
            );
          })
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

function IconSquare({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.iconSquare}>
      <Ionicons name={icon} size={16} color={colors.white} />
    </View>
  );
}

function Stat({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.statText}>{value}</Text>
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
  nextCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  nextTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  nextTag: {
    marginTop: spacing.sm,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral9,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dateChipText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral1,
  },
  emptyNote: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  infoRowFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  infoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    flexShrink: 1,
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
  historyCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  historyThumb: {
    width: 96,
    height: 96,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral1,
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  historyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  historyDate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  historyType: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
