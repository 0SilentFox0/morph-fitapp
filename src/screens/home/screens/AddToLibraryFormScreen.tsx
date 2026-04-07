import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { Input, Button } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useProgramsStore } from '../../../store/programsStore';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AddToLibraryForm'>;
type Route = RouteProp<HomeStackParamList, 'AddToLibraryForm'>;

const ACCESS_OPTIONS = ['Public', 'For Subscribers Only', 'Private (hidden)'];
const TAG_OPTIONS = ['HIIT', 'Cardio', 'Strength', 'Yoga', 'Mobility', 'Pilates'];

export function AddToLibraryFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const program = route.params?.program;
  const isEdit = !!program;

  const addProgram = useProgramsStore((s) => s.addProgram);
  const updateProgram = useProgramsStore((s) => s.updateProgram);

  const [title, setTitle] = React.useState(program?.name ?? '');
  const [tag, setTag] = React.useState(program?.tag ?? 'HIIT');
  const [description, setDescription] = React.useState('');
  const [access, setAccess] = React.useState('Public');
  const [freePreview, setFreePreview] = React.useState(true);

  const handleContinue = () => {
    if (isEdit && program) {
      updateProgram(program.id, {
        name: title || program.name,
        tag: tag || program.tag,
      });
      navigation.goBack();
    } else {
      navigation.navigate('Gallery', { draftTitle: title || 'New Program', draftTag: tag || 'HIIT' });
    }
  };

  const handleSaveDraft = () => {
    if (isEdit && program) {
      updateProgram(program.id, {
        name: title || program.name,
        tag: tag || program.tag,
      });
      navigation.goBack();
    } else {
      addProgram({
        name: title || 'New Program',
        tag: tag || 'HIIT',
        videoCount: 0,
        views: 0,
        likes: 0,
        price: '$5/month',
      });
      navigation.navigate('TrainingLibrary');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isEdit ? (title || program?.name || 'Edit') : 'Add to Library'}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>About</Text>
        <Input
          placeholder="Program Title"
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.dropdownRow}>
          <Text style={styles.dropdownLabel}>Type</Text>
          <View style={styles.tagRow}>
            {TAG_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setTag(opt)}
                style={[styles.tagChip, tag === opt && styles.tagChipActive]}
              >
                <Text style={[styles.tagChipText, tag === opt && styles.tagChipTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Input
          placeholder="Write a short description for your clients..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Preview</Text>
        <Input placeholder="Video 1" />
        <Input placeholder="Brief explanation of this video..." multiline />
        <TouchableOpacity style={styles.uploadArea}>
          <Text style={styles.uploadText}>Tap to upload file MP4 or PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addVideo}>
          <Text style={styles.addVideoText}>Add another video</Text>
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            Allow free preview for first video
          </Text>
          <Switch
            value={freePreview}
            onValueChange={setFreePreview}
            trackColor={{ false: colors.neutral2, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.sectionTitle}>Access Setting</Text>
        {ACCESS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setAccess(opt)}
            style={styles.radioRow}
          >
            <View
              style={[
                styles.radio,
                access === opt && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioLabel}>{opt}</Text>
          </TouchableOpacity>
        ))}

        <Button
          title={isEdit ? 'Save' : 'Continue'}
          onPress={isEdit ? handleSaveDraft : handleContinue}
          style={styles.button}
        />
        {!isEdit && (
          <Button
            title="Save as Draft"
            onPress={handleSaveDraft}
            variant="secondary"
            style={styles.buttonSecondary}
          />
        )}
      </ScrollView>
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
    paddingBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  dropdownRow: {
    marginBottom: spacing.md,
  },
  dropdownLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.neutral2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tagChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  tagChipTextActive: {
    color: colors.text,
  },
  uploadArea: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  uploadText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  addVideo: {
    marginBottom: spacing.lg,
  },
  addVideoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  toggleLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  radioLabel: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  button: {
    marginTop: spacing.lg,
  },
  buttonSecondary: {
    marginTop: spacing.md,
  },
});
