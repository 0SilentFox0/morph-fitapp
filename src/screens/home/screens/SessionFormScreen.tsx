import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormInput, DropdownSelect, Button } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useProgramsStore } from '../../../store/programsStore';
import { TRAINING_TYPES } from '../../../constants';
import { formatDate, formatTime } from '../../../utils';
import { TypePickerModal } from './SessionForm/TypePickerModal';
import { ProgramPickerModal } from './SessionForm/ProgramPickerModal';
import { ParticipantsSection } from './SessionForm/ParticipantsSection';
import { DateTimePickerSection } from './SessionForm/DateTimePickerSection';

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

function validateTitle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length < 2) return 'Title must be at least 2 characters';
  return '';
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

  const [title, setTitle] = React.useState(session?.title ?? '');
  const [titleError, setTitleError] = React.useState('');

  const [dateObj, setDateObj] = React.useState(() => new Date());
  const [timeObj, setTimeObj] = React.useState(() => new Date());

  const [participants, setParticipants] = React.useState<string[]>(
    session?.participants?.map((p) => p.name) ?? [],
  );

  const [type, setType] = React.useState(session?.type ?? 'Cardio');
  const [typePickerVisible, setTypePickerVisible] = React.useState(false);

  const programs = useProgramsStore((s) => s.programs);
  const [programId, setProgramId] = React.useState<string | undefined>(session?.programId);
  const [programPickerVisible, setProgramPickerVisible] = React.useState(false);
  const [programError, setProgramError] = React.useState('');
  const selectedProgram = programs.find((p) => p.id === programId);

  const handleSave = () => {
    const err = validateTitle(title);
    setTitleError(err);

    if (!programId) {
      setProgramError('Please select a training program');
    } else {
      setProgramError('');
    }

    if (err || !programId) return;

    const trimmedTitle = title.trim();
    const builtParticipants = buildParticipants(participants, session?.participants);

    if (session) {
      updateSession(session.id, {
        title: trimmedTitle,
        type,
        date: formatDate(dateObj),
        time: formatTime(timeObj),
        participants: builtParticipants,
        programId,
      });
    } else {
      addSession({
        title: trimmedTitle,
        type,
        date: formatDate(dateObj),
        time: formatTime(timeObj),
        status: 'pending',
        participants: builtParticipants,
        programId,
      });
    }

    navigation.navigate('RequestSubmitted');
  };

  const onTitleChange = (text: string) => {
    setTitle(text);
    if (titleError) setTitleError(validateTitle(text));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || 'New Session'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <Ionicons name="save-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput
          placeholder="Session title"
          value={title}
          onChangeText={onTitleChange}
          error={titleError || undefined}
        />

        <DateTimePickerSection
          date={dateObj}
          time={timeObj}
          onDateChange={setDateObj}
          onTimeChange={setTimeObj}
        />

        <ParticipantsSection value={participants} onChange={setParticipants} />

        <Text style={styles.sectionLabel}>{'Type'}</Text>
        <DropdownSelect
          value={type}
          placeholder="Select type"
          onPress={() => setTypePickerVisible(true)}
          style={styles.field}
        />

        <Text style={styles.sectionLabel}>
          {'Program'} <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.programPicker, programError ? styles.programPickerError : null]}
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
        {programError ? <Text style={styles.errorText}>{programError}</Text> : null}

        <Button title="Apply" onPress={handleSave} style={styles.applyButton} />
      </ScrollView>

      <TypePickerModal
        visible={typePickerVisible}
        onClose={() => setTypePickerVisible(false)}
        options={TRAINING_TYPES}
        value={type}
        onChange={setType}
      />

      <ProgramPickerModal
        visible={programPickerVisible}
        onClose={() => setProgramPickerVisible(false)}
        programs={programs}
        value={programId}
        onChange={(id) => {
          setProgramId(id);
          setProgramError('');
        }}
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
    borderRadius: 12,
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
