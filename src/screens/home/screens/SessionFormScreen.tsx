import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { radius } from '../../../theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, DropdownSelect, Button } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useProgramsStore } from '../../../store/programsStore';
import { TRAINING_TYPES } from '../../../constants';
import { formatDate, formatTime } from '../../../utils';
import { sessionSchema, type SessionFormValues } from '../../../schemas/session';
import { TypePickerModal } from './SessionForm/TypePickerModal';
import { ProgramPickerModal } from './SessionForm/ProgramPickerModal';
import { ParticipantsSection } from './SessionForm/ParticipantsSection';
import { DateTimePickerSection } from './SessionForm/DateTimePickerSection';
import { ExerciseProgressionSection } from './SessionForm/ExerciseProgressionSection';
import type { ExerciseSet } from '../../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SessionForm'>;
type SessionFormRoute = RouteProp<HomeStackParamList, 'SessionForm'>;

function participantIdForName(name: string): string {
  return `p-${name.replace(/\s+/g, '-').toLowerCase()}`;
}

function buildParticipants(
  names: string[],
  existing?: { id: string; name: string; avatar?: string }[],
): { id: string; name: string; avatar?: string }[] {
  return names.map((name) => {
    const prev = existing?.find((p) => p.name === name);
    if (prev) return { id: prev.id, name: prev.name, avatar: prev.avatar };
    return { id: participantIdForName(name), name };
  });
}

function programMeta(p: { tag: string; exercises?: unknown[]; videoCount: number }): string {
  const count = p.exercises?.length ?? p.videoCount;
  return `${p.tag} · ${count} exercises`;
}

export function SessionFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<SessionFormRoute>();
  const insets = useSafeAreaInsets();
  const session = route.params?.session;

  const addSession = useSessionsStore((s) => s.addSession);
  const updateSession = useSessionsStore((s) => s.updateSession);
  const programs = useProgramsStore((s) => s.programs);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: session?.title ?? '',
      programId: session?.programId ?? '',
      date: new Date(),
      time: new Date(),
      type: session?.type ?? 'Cardio',
      participants: session?.participants?.map((p) => p.name) ?? [],
    },
    mode: 'onBlur',
  });

  const [typePickerVisible, setTypePickerVisible] = React.useState(false);
  const [programPickerVisible, setProgramPickerVisible] = React.useState(false);
  const [plannedSets, setPlannedSets] = React.useState<Record<number, ExerciseSet[]>>({});

  const titleValue = watch('title');
  const dateValue = watch('date');
  const timeValue = watch('time');
  const typeValue = watch('type');
  const programIdValue = watch('programId');
  const participantsValue = watch('participants');
  const selectedProgram = programs.find((p) => p.id === programIdValue);
  // Progression pre-fill is per-client, so it only applies to Personal (1-participant) sessions.
  const isPersonal = participantsValue.length === 1;
  const showProgression = isPersonal && (selectedProgram?.exercises?.length ?? 0) > 0;

  const onSubmit = (data: SessionFormValues) => {
    const trimmedTitle = data.title.trim();
    const builtParticipants = buildParticipants(data.participants, session?.participants);

    if (session) {
      updateSession(session.id, {
        title: trimmedTitle,
        type: data.type,
        date: formatDate(data.date),
        time: formatTime(data.time),
        participants: builtParticipants,
        programId: data.programId,
        plannedSets: showProgression ? plannedSets : undefined,
      });
    } else {
      addSession({
        title: trimmedTitle,
        type: data.type,
        date: formatDate(data.date),
        time: formatTime(data.time),
        status: 'pending',
        participants: builtParticipants,
        programId: data.programId,
        plannedSets: showProgression ? plannedSets : undefined,
      });
    }

    navigation.navigate('RequestSubmitted');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titleValue || 'New Session'}</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.headerBtn}>
          <Ionicons name="save-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              placeholder="Session title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
            />
          )}
        />

        <DateTimePickerSection
          date={dateValue}
          time={timeValue}
          onDateChange={(d) => setValue('date', d, { shouldValidate: true })}
          onTimeChange={(t) => setValue('time', t, { shouldValidate: true })}
        />

        <ParticipantsSection
          value={participantsValue}
          onChange={(next) => setValue('participants', next, { shouldDirty: true })}
        />

        <Text style={styles.sectionLabel}>Type</Text>
        <DropdownSelect
          value={typeValue}
          placeholder="Select type"
          onPress={() => setTypePickerVisible(true)}
          style={styles.field}
        />

        <Text style={styles.sectionLabel}>
          Program <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.programPicker, errors.programId ? styles.programPickerError : null]}
          onPress={() => setProgramPickerVisible(true)}
          activeOpacity={0.8}
        >
          {selectedProgram ? (
            <View style={styles.programSelected}>
              <Ionicons name="barbell" size={18} color={colors.accent} />
              <View style={styles.programInfo}>
                <Text style={styles.programName}>{selectedProgram.name}</Text>
                <Text style={styles.programMetaText}>{programMeta(selectedProgram)}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </View>
          ) : (
            <View style={styles.programPlaceholder}>
              <Ionicons name="barbell-outline" size={18} color={colors.textMuted} />
              <Text style={styles.programPlaceholderText}>Select a training program</Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </View>
          )}
        </TouchableOpacity>
        {errors.programId ? (
          <Text style={styles.errorText}>{errors.programId.message}</Text>
        ) : null}

        {showProgression && selectedProgram ? (
          <ExerciseProgressionSection
            program={selectedProgram}
            clientName={participantsValue[0]!}
            onChange={setPlannedSets}
          />
        ) : null}

        <Button
          title="Apply"
          onPress={handleSubmit(onSubmit)}
          style={styles.applyButton}
        />
      </ScrollView>

      <TypePickerModal
        visible={typePickerVisible}
        onClose={() => setTypePickerVisible(false)}
        options={TRAINING_TYPES}
        value={typeValue}
        onChange={(t) => setValue('type', t, { shouldValidate: true })}
      />

      <ProgramPickerModal
        visible={programPickerVisible}
        onClose={() => setProgramPickerVisible(false)}
        programs={programs}
        value={programIdValue || undefined}
        onChange={(id) => setValue('programId', id, { shouldValidate: true })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: typography.weights.normal as '400',
    color: colors.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  required: {
    color: colors.Error,
  },
  field: {
    marginBottom: spacing.md,
  },
  programPicker: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: spacing.xs,
  },
  programPickerError: {
    borderColor: colors.Error,
  },
  programSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  programMetaText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  programPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  programPlaceholderText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.Error,
    marginBottom: spacing.sm,
  },
  applyButton: {
    marginTop: spacing.xl,
  },
});
