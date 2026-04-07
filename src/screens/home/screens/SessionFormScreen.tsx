import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import {
  FormInput,
  DatePickerInput,
  TimePickerInput,
  ParticipantChip,
  DropdownSelect,
  Button,
} from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useSessionsStore } from '../../../store/sessionsStore';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SessionForm'>;
type SessionFormRoute = RouteProp<HomeStackParamList, 'SessionForm'>;

const PARTICIPANTS = [
  'Darrell Steward',
  'Theresa Webb',
  'Bessie Cooper',
  'Wade Warren',
  'Guy Hawkins',
  'Arlene McCoy',
];

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
    if (prev) {
      return { id: prev.id, name: prev.name, avatar: prev.avatar };
    }
    return { id: participantIdForName(name), name };
  });
}

function validateTitle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Title is required';
  }
  if (trimmed.length < 2) {
    return 'Title must be at least 2 characters';
  }
  return '';
}

export function SessionFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<SessionFormRoute>();
  const session = route.params?.session;

  const addSession = useSessionsStore((s) => s.addSession);
  const updateSession = useSessionsStore((s) => s.updateSession);

  const [title, setTitle] = React.useState(session?.title ?? 'Cardio Class');
  const [titleError, setTitleError] = React.useState('');
  const [date, setDate] = React.useState(session?.date ?? '03/15/2019');
  const [time, setTime] = React.useState(session?.time ?? '12:02');
  const [selectedParticipants, setSelectedParticipants] = React.useState<string[]>(
    session?.participants?.map((p) => p.name) ?? ['Darrell Steward'],
  );
  const [type, setType] = React.useState(session?.type ?? 'Cardio');
  const [typePickerVisible, setTypePickerVisible] = React.useState(false);

  const toggleParticipant = (name: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleSave = () => {
    const err = validateTitle(title);
    setTitleError(err);
    if (err) {
      return;
    }

    const trimmedTitle = title.trim();
    const participants = buildParticipants(selectedParticipants, session?.participants);

    if (session) {
      updateSession(session.id, {
        title: trimmedTitle,
        type,
        date,
        time,
        participants,
      });
    } else {
      addSession({
        title: trimmedTitle,
        type,
        date,
        time,
        status: 'pending',
        participants,
      });
    }

    navigation.navigate('RequestSubmitted');
  };

  const handleApply = () => {
    handleSave();
  };

  const onTitleChange = (text: string) => {
    setTitle(text);
    if (titleError) {
      setTitleError(validateTitle(text));
    }
  };

  const screenTitle = session ? title : 'Cardio Class';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <Ionicons name="save-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FormInput
          placeholder="Cardio Class"
          value={title}
          onChangeText={onTitleChange}
          error={titleError || undefined}
        />

        <View style={styles.dateTimeRow}>
          <DatePickerInput value={date} onChangeText={setDate} placeholder="03/15/2019" />
          <View style={styles.dateTimeGap} />
          <TimePickerInput value={time} onChangeText={setTime} placeholder="12:02" />
        </View>

        <Text style={styles.sectionLabel}>Participants</Text>
        <View style={styles.chipsRow}>
          {PARTICIPANTS.map((name) => (
            <ParticipantChip
              key={name}
              name={name}
              selected={selectedParticipants.includes(name)}
              onPress={() => toggleParticipant(name)}
            />
          ))}
        </View>

        <DropdownSelect value={type} placeholder="Type" onPress={() => setTypePickerVisible(true)} />

        <Button title="Apply" onPress={handleApply} style={styles.applyButton} />
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
          <View style={styles.typePicker}>
            {TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.typeOption, type === opt && styles.typeOptionSelected]}
                onPress={() => {
                  setType(opt);
                  setTypePickerVisible(false);
                }}
              >
                <Text style={[styles.typeOptionText, type === opt && styles.typeOptionTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
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
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
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
    paddingBottom: spacing['2xl'],
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateTimeGap: { width: 8 },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  applyButton: {
    marginTop: 24,
    borderRadius: 80,
    backgroundColor: colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  typePicker: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  typeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  typeOptionSelected: {
    backgroundColor: colors.accent,
  },
  typeOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
});
