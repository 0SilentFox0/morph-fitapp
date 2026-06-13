import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TrainersStackParamList } from '../../../navigation/types';
import { ScreenHeader } from '../../../components/layout';
import { Button, SectionTitle, Toggle } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useTrainersStore } from '../../../store/trainersStore';
import { trainerSpecialties } from '../../../mocks';

type Nav = NativeStackNavigationProp<TrainersStackParamList, 'TrainerFilters'>;

export function TrainerFiltersScreen() {
  const navigation = useNavigation<Nav>();
  const filterSpecialty = useTrainersStore((s) => s.filterSpecialty);
  const onlineOnly = useTrainersStore((s) => s.onlineOnly);
  const setFilterSpecialty = useTrainersStore((s) => s.setFilterSpecialty);
  const setOnlineOnly = useTrainersStore((s) => s.setOnlineOnly);
  const clearFilters = useTrainersStore((s) => s.clearFilters);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Filters" transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionTitle>Specialty</SectionTitle>
        <View style={styles.chips}>
          <Chip
            label="All"
            active={filterSpecialty === null}
            onPress={() => setFilterSpecialty(null)}
          />
          {trainerSpecialties.map((s) => (
            <Chip
              key={s}
              label={s}
              active={filterSpecialty === s}
              onPress={() => setFilterSpecialty(s)}
            />
          ))}
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Online sessions only</Text>
          <Toggle value={onlineOnly} onValueChange={setOnlineOnly} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Clear" variant="outline" onPress={clearFilters} style={styles.footerBtn} />
        <Button title="Show results" onPress={() => navigation.goBack()} style={styles.footerBtn} />
      </View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral5,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: typography.weights.semibold },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  toggleLabel: { fontSize: typography.sizes.base, color: colors.text },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerBtn: { flex: 1 },
});
