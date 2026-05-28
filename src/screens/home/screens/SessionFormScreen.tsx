import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FormInput, DropdownSelect, Button, Avatar } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useSessionsStore } from '../../../store/sessionsStore';
import { useProgramsStore } from '../../../store/programsStore';
import { mockClients } from '../../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SessionForm'>;
type SessionFormRoute = RouteProp<HomeStackParamList, 'SessionForm'>;

const TYPE_OPTIONS = ['Cardio', 'HIIT', 'Strength', 'Yoga', 'Mobility', 'Pilates'];

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

function formatDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

function programMeta(p: { tag: string; exercises?: unknown[]; videoCount: number }): string {
  const count = p.exercises?.length ?? p.videoCount;
  return `${p.tag} \u00B7 ${count} exercises`;
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
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  const [participants, setParticipants] = React.useState<string[]>(
    session?.participants?.map((p) => p.name) ?? [],
  );
  const [clientSearch, setClientSearch] = React.useState('');
  const [showClientResults, setShowClientResults] = React.useState(false);

  const filteredClients = React.useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return mockClients.filter((c) => !participants.includes(c.name));
    return mockClients.filter(
      (c) => c.name.toLowerCase().includes(q) && !participants.includes(c.name),
    );
  }, [clientSearch, participants]);

  const [type, setType] = React.useState(session?.type ?? 'Cardio');
  const [typePickerVisible, setTypePickerVisible] = React.useState(false);

  const programs = useProgramsStore((s) => s.programs);
  const [programId, setProgramId] = React.useState<string | undefined>(session?.programId);
  const [programPickerVisible, setProgramPickerVisible] = React.useState(false);
  const [programError, setProgramError] = React.useState('');
  const selectedProgram = programs.find((p) => p.id === programId);

  const selectClient = (name: string) => {
    if (!participants.includes(name)) {
      setParticipants((prev) => [...prev, name]);
    }
    setClientSearch('');
    setShowClientResults(false);
  };

  const removeParticipant = (name: string) => {
    setParticipants((prev) => prev.filter((n) => n !== name));
  };

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

  const onDateChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setDateObj(selected);
  };

  const onTimeChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selected) setTimeObj(selected);
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

        <Text style={styles.sectionLabel}>{'Date & Time'}</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.pickerField}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.neutral8} />
            <Text style={styles.pickerFieldText}>{formatDate(dateObj)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pickerField}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={16} color={colors.neutral8} />
            <Text style={styles.pickerFieldText}>{formatTime(timeObj)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <View style={styles.nativePicker}>
            <DateTimePicker
              value={dateObj}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              themeVariant="dark"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDoneText}>{'Done'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showTimePicker && (
          <View style={styles.nativePicker}>
            <DateTimePicker
              value={timeObj}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              themeVariant="dark"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.pickerDone} onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerDoneText}>{'Done'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.sectionLabel}>{'Participants'}</Text>
        {participants.length > 0 && (
          <View style={styles.chipsRow}>
            {participants.map((name) => (
              <View key={name} style={styles.chip}>
                <Avatar name={name} size={22} />
                <Text style={styles.chipText}>{name}</Text>
                <TouchableOpacity onPress={() => removeParticipant(name)} hitSlop={6}>
                  <Ionicons name="close-circle" size={16} color={colors.neutral6} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.neutral7} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={colors.textMuted}
            value={clientSearch}
            onChangeText={(t) => { setClientSearch(t); setShowClientResults(true); }}
            onFocus={() => setShowClientResults(true)}
          />
        </View>
        {showClientResults && filteredClients.length > 0 && (
          <View style={styles.clientResults}>
            {filteredClients.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.clientRow}
                onPress={() => selectClient(c.name)}
              >
                <Avatar name={c.name} size={28} />
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{c.name}</Text>
                  {c.lastSession ? (
                    <Text style={styles.clientMeta}>{`Last session: ${c.lastSession}`}</Text>
                  ) : null}
                </View>
                <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        {showClientResults && filteredClients.length === 0 && clientSearch.trim().length > 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>{'No clients found'}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>{'Type'}</Text>
        <DropdownSelect
          value={type}
          placeholder="Type"
          onPress={() => setTypePickerVisible(true)}
          style={styles.field}
        />

        <Text style={styles.sectionLabel}>
          {'Training Program '}
          <Text style={styles.required}>{'*'}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.programPicker, programError ? styles.programPickerError : undefined]}
          onPress={() => setProgramPickerVisible(true)}
          activeOpacity={0.8}
        >
          {selectedProgram ? (
            <View style={styles.programSelected}>
              <Ionicons name="barbell-outline" size={18} color={colors.accent} />
              <View style={styles.programInfo}>
                <Text style={styles.programName}>{selectedProgram.name}</Text>
                <Text style={styles.programMetaText}>{programMeta(selectedProgram)}</Text>
              </View>
              <Ionicons name="chevron-down" size={14} color={colors.neutral9} />
            </View>
          ) : (
            <View style={styles.programPlaceholder}>
              <Ionicons name="folder-open-outline" size={18} color={colors.textMuted} />
              <Text style={styles.programPlaceholderText}>{'Select program'}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.neutral9} />
            </View>
          )}
        </TouchableOpacity>
        {programError ? <Text style={styles.errorText}>{programError}</Text> : null}

        <Button title="Apply" onPress={handleSave} style={styles.applyButton} />
      </ScrollView>

      <Modal
        visible={typePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypePickerVisible(false)}
        >
          <View style={styles.modalBox}>
            {TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.modalOption, type === opt && styles.modalOptionActive]}
                onPress={() => { setType(opt); setTypePickerVisible(false); }}
              >
                <Text style={[styles.modalOptionText, type === opt && styles.modalOptionTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={programPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProgramPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setProgramPickerVisible(false)}
        >
          <View style={styles.programModal}>
            <Text style={styles.programModalTitle}>{'Select Program'}</Text>
            <ScrollView style={styles.programList} showsVerticalScrollIndicator={false}>
              {programs.length > 0 ? (
                programs.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.modalOption, programId === p.id && styles.modalOptionActive]}
                    onPress={() => { setProgramId(p.id); setProgramError(''); setProgramPickerVisible(false); }}
                  >
                    <View style={styles.programOptionRow}>
                      <Ionicons
                        name="barbell-outline"
                        size={16}
                        color={programId === p.id ? colors.accent : colors.neutral8}
                      />
                      <View style={styles.programOptionInfo}>
                        <Text style={[styles.modalOptionText, programId === p.id && styles.modalOptionTextActive]}>
                          {p.name}
                        </Text>
                        <Text style={styles.programOptionMeta}>{programMeta(p)}</Text>
                      </View>
                    </View>
                    {programId === p.id ? (
                      <Ionicons name="checkmark" size={18} color={colors.accent} />
                    ) : null}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>{'No programs yet. Create one in Training Library.'}</Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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

  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pickerField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  pickerFieldText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  nativePicker: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  pickerDone: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral3,
  },
  pickerDoneText: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    marginBottom: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    padding: 0,
    height: 36,
  },
  clientResults: {
    backgroundColor: colors.neutral2,
    borderRadius: 10,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral3,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  clientMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  noResults: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  noResultsText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingLeft: 2,
    paddingRight: 8,
    paddingVertical: 2,
    borderRadius: 80,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.neutral9,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    padding: spacing.sm,
    minWidth: 200,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  modalOptionActive: {
    backgroundColor: colors.neutral3,
  },
  modalOptionText: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  modalOptionTextActive: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  programModal: {
    backgroundColor: colors.neutral2,
    borderRadius: 16,
    padding: spacing.md,
    width: '90%',
    maxHeight: 420,
  },
  programModalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  programList: {
    maxHeight: 350,
  },
  programOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  programOptionInfo: {
    flex: 1,
  },
  programOptionMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
