import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import theme from '../../../theme';

const { radius, colors, typography, spacing } = theme;

import { Controller } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, DropdownSelect, FormInput } from '../../../components/ui';
import { TRAINING_TYPES } from '../../../constants';
import type { HomeStackParamList } from '../../../navigation/types';
import { programMeta } from '../../../utils';
import { DateTimePickerSection } from './SessionForm/DateTimePickerSection';
import { ExerciseProgressionSection } from './SessionForm/ExerciseProgressionSection';
import { ParticipantsSection } from './SessionForm/ParticipantsSection';
import { ProgramPickerModal } from './SessionForm/ProgramPickerModal';
import { TypePickerModal } from './SessionForm/TypePickerModal';
import { useSessionForm } from './SessionForm/useSessionForm';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SessionForm'>;
type SessionFormRoute = RouteProp<HomeStackParamList, 'SessionForm'>;

export function SessionFormScreen() {
  const navigation = useNavigation<Nav>();

  const route = useRoute<SessionFormRoute>();

  const insets = useSafeAreaInsets();

  const session = route.params?.session;

  const {
    control,
    errors,
    setValue,
    programs,
    submit,
    submitting,
    error,
    typePicker,
    programPicker,
    setPlannedSets,
    titleValue,
    dateValue,
    timeValue,
    typeValue,
    programIdValue,
    participantsValue,
    selectedProgram,
    showProgression,
  } = useSessionForm(session, (counterpartName) =>
    navigation.navigate('RequestSubmitted', { counterpartName })
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, spacing.md) },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titleValue || 'New Session'}</Text>
        <TouchableOpacity onPress={submit} style={styles.headerBtn}>
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
          onChange={(next) =>
            setValue('participants', next, { shouldDirty: true })
          }
        />

        <Text style={styles.sectionLabel}>Type</Text>
        <DropdownSelect
          value={typeValue}
          placeholder="Select type"
          onPress={typePicker.open}
          style={styles.field}
        />

        <Text style={styles.sectionLabel}>
          Program <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.programPicker,
            errors.programId ? styles.programPickerError : null,
          ]}
          onPress={programPicker.open}
          activeOpacity={0.8}
        >
          {selectedProgram ? (
            <View style={styles.programSelected}>
              <Ionicons name="barbell" size={18} color={colors.accent} />
              <View style={styles.programInfo}>
                <Text style={styles.programName}>{selectedProgram.name}</Text>
                <Text style={styles.programMetaText}>
                  {programMeta(selectedProgram)}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
            </View>
          ) : (
            <View style={styles.programPlaceholder}>
              <Ionicons
                name="barbell-outline"
                size={18}
                color={colors.textMuted}
              />
              <Text style={styles.programPlaceholderText}>
                Select a training program
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
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

        {error ? <Text style={styles.submitError}>{error}</Text> : null}
        <Button
          title="Apply"
          onPress={submit}
          loading={submitting}
          style={styles.applyButton}
        />
      </ScrollView>

      <TypePickerModal
        visible={typePicker.visible}
        onClose={typePicker.close}
        options={TRAINING_TYPES}
        value={typeValue}
        onChange={(t) => setValue('type', t, { shouldValidate: true })}
      />

      <ProgramPickerModal
        visible={programPicker.visible}
        onClose={programPicker.close}
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
  submitError: {
    fontSize: typography.sizes.sm,
    color: colors.Error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
