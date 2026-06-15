import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import theme from '../../../theme';
const { radius, colors, typography, spacing } = theme;
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import { ScreenHeader } from '../../../components/layout';
import { Input, Button, DropdownSelect } from '../../../components/ui';
import { ExercisesSection } from './AddToLibraryForm/ExercisesSection';
import { TagPickerModal } from './AddToLibraryForm/TagPickerModal';
import { useProgramDraftForm } from './AddToLibraryForm/useProgramDraftForm';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'AddToLibraryForm'>;
type Route = RouteProp<HomeStackParamList, 'AddToLibraryForm'>;

export function AddToLibraryFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const program = route.params?.program;

  const { control, errors, exercises, tagModal, watchedTitle, isEdit, submit, saveDraft, handleBack } =
    useProgramDraftForm(program, {
      goBack: () => navigation.goBack(),
      goToGallery: () => navigation.navigate('Gallery'),
      goToLibrary: () => navigation.navigate('TrainingLibrary'),
    });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={watchedTitle || (isEdit ? (program?.name ?? 'Edit') : 'Name')}
        rightElement={
          <TouchableOpacity onPress={saveDraft}>
            <Ionicons name="bookmark-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        }
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>About</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Cardio Class"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title.message}</Text> : null}

        <Controller
          control={control}
          name="tag"
          render={({ field: { value } }) => (
            <DropdownSelect
              value={value}
              placeholder="Select category"
              onPress={tagModal.open}
              style={styles.dropdown}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              style={styles.textarea}
            />
          )}
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

        <ExercisesSection exercises={exercises} onBrowse={() => navigation.navigate('Gallery')} />

        <Button
          title={isEdit ? 'Save' : 'Continue'}
          onPress={submit}
          style={styles.button}
        />
        <Button
          title="Save as Draft"
          onPress={saveDraft}
          variant="outline"
          style={styles.buttonSecondary}
        />
      </ScrollView>

      <Controller
        control={control}
        name="tag"
        render={({ field: { onChange, value } }) => (
          <TagPickerModal
            visible={tagModal.visible}
            value={value}
            onClose={tagModal.close}
            onSelect={(tag) => {
              onChange(tag);
              tagModal.close();
            }}
          />
        )}
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
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.Error,
    marginBottom: spacing.sm,
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
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  uploadIconBox: {
    width: 84,
    height: 84,
    borderRadius: radius.sm,
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
  button: {
    marginTop: spacing.lg,
  },
  buttonSecondary: {
    marginTop: spacing.md,
  },
});
