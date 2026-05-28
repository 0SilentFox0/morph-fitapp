import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { Input, Button, DropdownSelect, ExerciseCard } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useProgramsStore } from '../../../store/programsStore';
import { useDraftProgramStore } from '../../../store/draftProgramStore';
import { useShallow } from 'zustand/react/shallow';
import { TRAINING_TYPES, SET_NOTES } from '../../../constants';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AddToLibraryForm'>;
type Route = RouteProp<HomeStackParamList, 'AddToLibraryForm'>;


export function AddToLibraryFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const program = route.params?.program;
  const isEdit = !!program;

  const addProgramFromDraft = useProgramsStore((s) => s.addProgramFromDraft);
  const updateProgram = useProgramsStore((s) => s.updateProgram);

  const {
    title,
    setTitle,
    tag,
    setTag,
    description,
    setDescription,
    exercises,
    setExercises,
    resetDraft,
  } = useDraftProgramStore(
    useShallow((s) => ({
      title: s.title,
      setTitle: s.setTitle,
      tag: s.tag,
      setTag: s.setTag,
      description: s.description,
      setDescription: s.setDescription,
      exercises: s.exercises,
      setExercises: s.setExercises,
      resetDraft: s.reset,
    })),
  );

  const [showTagModal, setShowTagModal] = React.useState(false);

  React.useEffect(() => {
    if (isEdit && program) {
      setTitle(program.name);
      setTag(program.tag);
      setDescription(program.description ?? '');
      setExercises(program.exercises ?? []);
    }
  }, [isEdit, program?.id, setTitle, setTag, setDescription, setExercises]);

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
      addProgramFromDraft({ title, tag, description, exercises });
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
              data={TRAINING_TYPES}
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
