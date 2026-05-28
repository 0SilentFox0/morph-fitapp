import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { Input, Button, DropdownSelect } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useProgramsStore } from '../../../store/programsStore';
import { useDraftProgramStore } from '../../../store/draftProgramStore';
import { useShallow } from 'zustand/react/shallow';
import type { ProgramExercise, ExerciseSet, SetNote } from '../../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AddToLibraryForm'>;
type Route = RouteProp<HomeStackParamList, 'AddToLibraryForm'>;

const TAG_OPTIONS = ['HIIT', 'Cardio', 'Strength', 'Yoga', 'Mobility', 'Pilates'];

const SET_NOTES: { key: SetNote; label: string; icon: string }[] = [
  { key: 'regular', label: 'Regular', icon: 'checkmark-circle-outline' },
  { key: 'failure', label: 'To failure', icon: 'flame-outline' },
  { key: 'dropset', label: 'Drop set', icon: 'trending-down-outline' },
  { key: 'short_rest', label: 'Short rest', icon: 'timer-outline' },
  { key: 'long_rest', label: 'Long rest', icon: 'time-outline' },
];

function ExerciseCard({ exercise }: { exercise: ProgramExercise }) {
  const removeExercise = useDraftProgramStore((s) => s.removeExercise);
  const addSet = useDraftProgramStore((s) => s.addSet);
  const removeSet = useDraftProgramStore((s) => s.removeSet);
  const updateSet = useDraftProgramStore((s) => s.updateSet);

  const handleWeightChange = (setIdx: number, text: string) => {
    const num = parseInt(text, 10);
    updateSet(exercise.id, setIdx, { weight: isNaN(num) ? 0 : num });
  };

  const handleRepsChange = (setIdx: number, text: string) => {
    const num = parseInt(text, 10);
    updateSet(exercise.id, setIdx, { reps: isNaN(num) ? 0 : num });
  };

  const NOTE_CYCLE: SetNote[] = ['regular', 'failure', 'dropset', 'short_rest', 'long_rest'];

  const cycleNote = (setIdx: number) => {
    const current = exercise.sets[setIdx]?.note ?? 'regular';
    const currentIdx = NOTE_CYCLE.indexOf(current);
    const next = NOTE_CYCLE[(currentIdx + 1) % NOTE_CYCLE.length];
    updateSet(exercise.id, setIdx, { note: next });
  };

  return (
    <View style={es.card}>
      <View style={es.cardHeader}>
        <View style={es.headerLeft}>
          {exercise.imageUrl ? (
            <Image source={{ uri: exercise.imageUrl }} style={es.thumb} resizeMode="cover" />
          ) : (
            <View style={[es.thumb, es.thumbEmpty]}>
              <Ionicons name="barbell-outline" size={16} color={colors.neutral5} />
            </View>
          )}
          <View style={es.headerText}>
            <Text style={es.exerciseName} numberOfLines={1}>
              {exercise.name}
            </Text>
            <Text style={es.exerciseCategory}>{exercise.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => removeExercise(exercise.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={colors.neutral7} />
        </TouchableOpacity>
      </View>

      <View style={es.setsHeader}>
        <Text style={es.colSet}>SET</Text>
        <Text style={es.colKg}>KG</Text>
        <Text style={es.colReps}>REPS</Text>
        <View style={es.colNote} />
      </View>

      {exercise.sets.map((set: ExerciseSet, idx: number) => (
        <View key={idx}>
          <View style={es.setRow}>
            <Text style={es.setNum}>{idx + 1}</Text>
            <View style={es.inputCellKg}>
              <TextInput
                style={es.cellInput}
                value={String(set.weight)}
                onChangeText={(t) => handleWeightChange(idx, t)}
                keyboardType="number-pad"
                selectTextOnFocus
              />
            </View>
            <View style={es.inputCellReps}>
              <TextInput
                style={es.cellInput}
                value={String(set.reps)}
                onChangeText={(t) => handleRepsChange(idx, t)}
                keyboardType="number-pad"
                selectTextOnFocus
              />
            </View>
            <TouchableOpacity
              style={es.noteBtn}
              onPress={() => cycleNote(idx)}
              onLongPress={() =>
                exercise.sets.length > 1 ? removeSet(exercise.id, idx) : undefined
              }
            >
              <Ionicons
                name={
                  (SET_NOTES.find((n) => n.key === (set.note ?? 'regular'))?.icon ??
                    'checkmark-circle-outline') as keyof typeof Ionicons.glyphMap
                }
                size={16}
                color={colors.accent}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={es.addSetBtn} onPress={() => addSet(exercise.id)}>
        <Ionicons name="add" size={16} color={colors.accent} />
        <Text style={es.addSetText}>Add set</Text>
      </TouchableOpacity>
    </View>
  );
}

export function AddToLibraryFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const program = route.params?.program;
  const isEdit = !!program;

  const addProgram = useProgramsStore((s) => s.addProgram);
  const updateProgram = useProgramsStore((s) => s.updateProgram);

  const { title, setTitle, tag, setTag, description, setDescription, exercises, resetDraft } =
    useDraftProgramStore(
      useShallow((s) => ({
        title: s.title,
        setTitle: s.setTitle,
        tag: s.tag,
        setTag: s.setTag,
        description: s.description,
        setDescription: s.setDescription,
        exercises: s.exercises,
        resetDraft: s.reset,
      })),
    );

  const [showTagModal, setShowTagModal] = React.useState(false);

  React.useEffect(() => {
    if (isEdit && program) {
      setTitle(program.name);
      setTag(program.tag);
      useDraftProgramStore.getState().setDescription(program.description ?? '');
      useDraftProgramStore.getState().setExercises(program.exercises ?? []);
    }
  }, []);

  const handleContinue = () => {
    if (isEdit && program) {
      updateProgram(program.id, {
        name: title || program.name,
        tag,
        description,
        exercises,
        videoCount: exercises.length,
      });
      resetDraft();
      navigation.goBack();
    } else {
      navigation.navigate('Gallery');
    }
  };

  const handleSaveDraft = () => {
    if (isEdit && program) {
      updateProgram(program.id, {
        name: title || program.name,
        tag,
        description,
        exercises,
        videoCount: exercises.length,
      });
    } else {
      addProgram({
        name: title || 'New Program',
        tag,
        description,
        exercises,
        videoCount: exercises.length,
        views: 0,
        likes: 0,
        price: '$5/month',
      });
    }
    resetDraft();
    navigation.navigate('TrainingLibrary');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={title || (isEdit ? (program?.name ?? 'Edit') : 'Name')}
        rightElement={
          <TouchableOpacity onPress={handleSaveDraft}>
            <Ionicons name="bookmark-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        }
        onBack={() => {
          if (!isEdit) resetDraft();
          navigation.goBack();
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>About</Text>
        <Input placeholder="Cardio Class" value={title} onChangeText={setTitle} />
        <DropdownSelect
          value={tag}
          placeholder="Select category"
          onPress={() => setShowTagModal(true)}
          style={styles.dropdown}
        />
        <Input
          placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textarea}
        />

        <Text style={styles.sectionLabel}>Preview</Text>
        <TouchableOpacity style={styles.uploadArea}>
          <View style={styles.uploadIconBox}>
            <Ionicons name="image-outline" size={22} color={colors.textMuted} />
          </View>
          <View style={styles.uploadTextBox}>
            <Text style={styles.uploadTitle}>Tap to upload photo</Text>
            <Text style={styles.uploadHint}>Recommended size: square,{'\n'}min 500x500px</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Exercises</Text>
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>{'Set type icons'}</Text>
          <View style={styles.legendGrid}>
            {SET_NOTES.map((n) => (
              <View key={n.key} style={styles.legendItem}>
                <Ionicons name={n.icon as keyof typeof Ionicons.glyphMap} size={14} color={n.key === 'regular' ? colors.neutral6 : colors.accent} />
                <Text style={styles.legendText}>{n.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.legendHint}>{'Tap icon to cycle \u00B7 Long press to remove set'}</Text>
        </View>
        {exercises.length > 0 ? (
          exercises.map((ex) => <ExerciseCard key={ex.id} exercise={ex} />)
        ) : (
          <TouchableOpacity
            style={styles.addExerciseEmpty}
            onPress={() => navigation.navigate('Gallery')}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
            <Text style={styles.addExerciseEmptyText}>Tap to browse exercises</Text>
          </TouchableOpacity>
        )}

        {exercises.length > 0 && (
          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={() => navigation.navigate('Gallery')}
          >
            <Ionicons name="add" size={18} color={colors.accent} />
            <Text style={styles.addMoreText}>Add more exercises</Text>
          </TouchableOpacity>
        )}

        <Button
          title={isEdit ? 'Save' : 'Continue'}
          onPress={handleContinue}
          style={styles.button}
        />
        <Button
          title="Save as Draft"
          onPress={handleSaveDraft}
          variant="outline"
          style={styles.buttonSecondary}
        />
      </ScrollView>

      <Modal visible={showTagModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTagModal(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={TAG_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, tag === item && styles.modalOptionActive]}
                  onPress={() => {
                    setTag(item);
                    setShowTagModal(false);
                  }}
                >
                  <Text
                    style={[styles.modalOptionText, tag === item && styles.modalOptionTextActive]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Exercise card styles ────────────────────────────────────────────────────

const es = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral2,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.neutral3,
  },
  thumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    lineHeight: 20,
  },
  exerciseCategory: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral3,
    marginBottom: 4,
    gap: 6,
  },
  colSet: {
    width: 26,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.neutral6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colKg: {
    flex: 1,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.neutral6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  colReps: {
    flex: 1,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.neutral6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  colNote: {
    width: 28,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 6,
  },
  setNum: {
    width: 26,
    fontSize: typography.sizes.xs,
    color: colors.neutral7,
    fontWeight: typography.weights.semibold,
  },
  inputCellKg: {
    flex: 1,
    backgroundColor: colors.neutral3,
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
  },
  inputCellReps: {
    flex: 1,
    backgroundColor: colors.neutral3,
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
  },
  cellInput: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: 0,
    height: 32,
  },
  noteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing.sm,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral3,
  },
  addSetText: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
});

// ─── Screen styles ───────────────────────────────────────────────────────────

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
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  dropdown: {
    marginBottom: spacing.md,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  uploadIconBox: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: colors.neutral3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextBox: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  legend: {
    backgroundColor: colors.neutral2,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  legendTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.neutral8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
    rowGap: 10,
  },
  legendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    width: '45%' as unknown as number,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.neutral9,
  },
  legendHint: {
    fontSize: 10,
    color: colors.neutral6,
    marginTop: spacing.sm,
    textAlign: 'center' as const,
  },
  addExerciseEmpty: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addExerciseEmptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  addMoreText: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  button: {
    marginTop: spacing.lg,
  },
  buttonSecondary: {
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.neutral2,
    borderRadius: 16,
    paddingVertical: spacing.sm,
    maxHeight: 400,
  },
  modalOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
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
});
