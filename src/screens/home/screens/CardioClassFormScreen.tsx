import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { Input, Button, Avatar } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useSessionsStore } from '../../../store/sessionsStore';
import { mockClients } from '../../../mocks';
import { cardioClassSchema, type CardioClassFormValues } from '../../../schemas/cardio-class';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CardioClassForm'>;
type Route = RouteProp<HomeStackParamList, 'CardioClassForm'>;

export function CardioClassFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const program = route.params?.program;
  const addSession = useSessionsStore((s) => s.addSession);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CardioClassFormValues>({
    resolver: zodResolver(cardioClassSchema),
    defaultValues: {
      title: program?.name ?? 'Cardio Class',
      type: program?.tag ?? 'Cardio',
      description: '',
      date: '',
      time: '',
      price: '40',
      clientIds: [],
    },
    mode: 'onBlur',
  });

  const clientIds = watch('clientIds');

  const toggleClient = (id: string) => {
    const next = clientIds.includes(id)
      ? clientIds.filter((c) => c !== id)
      : [...clientIds, id];
    setValue('clientIds', next, { shouldValidate: false, shouldDirty: true });
  };

  const onSubmit = (data: CardioClassFormValues) => {
    const participants = mockClients
      .filter((c) => data.clientIds.includes(c.id))
      .map((c) => ({ id: c.id, name: c.name }));

    addSession({
      title: data.title.trim(),
      type: data.type,
      date: data.date || 'Today',
      time: data.time || '12:00',
      status: 'pending',
      participants,
    });
    navigation.goBack();
  };

  const titleValue = watch('title');

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={titleValue || 'Cardio Class'}
        rightElement={
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Share">
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>About</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Class name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              accessibilityLabel="Class name"
            />
          )}
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title.message}</Text> : null}

        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Type"
              value={value}
              onChangeText={onChange}
              accessibilityLabel="Type"
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Description..."
              value={value ?? ''}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              accessibilityLabel="Description"
            />
          )}
        />

        <Text style={styles.sectionTitle}>Preview</Text>
        <TouchableOpacity
          style={styles.uploadArea}
          accessibilityRole="button"
          accessibilityLabel="Upload photo"
        >
          <Ionicons name="camera" size={40} color={colors.textMuted} />
          <Text style={styles.uploadText}>Tap to upload photo</Text>
          <Text style={styles.uploadHint}>Recommended size: square, min 500x500px</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Date and time</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Date (e.g. 04/10/2026)"
              value={value ?? ''}
              onChangeText={onChange}
              rightIcon={<Ionicons name="calendar" size={20} color={colors.textMuted} />}
              accessibilityLabel="Date"
            />
          )}
        />
        <Controller
          control={control}
          name="time"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Time (e.g. 14:00)"
              value={value ?? ''}
              onChangeText={onChange}
              rightIcon={<Ionicons name="time" size={20} color={colors.textMuted} />}
              accessibilityLabel="Time"
            />
          )}
        />

        <Text style={styles.sectionTitle}>Clients</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clientsRow}
        >
          {mockClients.map((client) => {
            const isSelected = clientIds.includes(client.id);
            return (
              <TouchableOpacity
                key={client.id}
                style={styles.clientItem}
                onPress={() => toggleClient(client.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={client.name}
              >
                <View
                  style={[styles.clientAvatarWrap, isSelected && styles.clientAvatarSelected]}
                >
                  <Avatar name={client.name} size={48} />
                </View>
                <Text style={styles.clientName} numberOfLines={1}>
                  {client.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Price per class</Text>
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="$ 40"
              value={`$ ${value}`}
              onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              accessibilityLabel="Price"
            />
          )}
        />
        {errors.price ? <Text style={styles.errorText}>{errors.price.message}</Text> : null}

        <Button title="Apply" onPress={handleSubmit(onSubmit)} style={styles.button} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['2xl'] },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  uploadArea: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  uploadText: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: spacing.sm },
  uploadHint: { fontSize: typography.sizes.xs, color: colors.textMuted, marginTop: spacing.xs },
  clientsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  clientItem: { alignItems: 'center' },
  clientAvatarWrap: { borderRadius: radius['2xl'], borderWidth: 2, borderColor: 'transparent' },
  clientAvatarSelected: { borderColor: colors.accent },
  clientName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    maxWidth: 60,
  },
  button: { marginTop: spacing.lg },
  errorText: { fontSize: typography.sizes.xs, color: colors.Error, marginTop: spacing.xs },
});
