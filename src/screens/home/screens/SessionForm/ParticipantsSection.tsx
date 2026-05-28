import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../../components/ui';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { mockClients } from '../../../../mocks';

export interface ParticipantsSectionProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export function ParticipantsSection({ value, onChange }: ParticipantsSectionProps) {
  const [search, setSearch] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockClients.filter((c) => !value.includes(c.name));
    return mockClients.filter(
      (c) => c.name.toLowerCase().includes(q) && !value.includes(c.name),
    );
  }, [search, value]);

  const addParticipant = (name: string) => {
    if (!value.includes(name)) {
      onChange([...value, name]);
    }
    setSearch('');
    setShowResults(false);
  };

  const removeParticipant = (name: string) => {
    onChange(value.filter((n) => n !== name));
  };

  const hasNoResults =
    showResults && filtered.length === 0 && search.trim().length > 0;

  return (
    <>
      <Text style={styles.sectionLabel}>Participants</Text>
      {value.length > 0 && (
        <View style={styles.chipsRow}>
          {value.map((name) => (
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
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
      </View>
      {showResults && filtered.length > 0 && (
        <View style={styles.results}>
          {filtered.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.row}
              onPress={() => addParticipant(c.name)}
            >
              <Avatar name={c.name} size={28} />
              <View style={styles.info}>
                <Text style={styles.name}>{c.name}</Text>
                {c.lastSession ? (
                  <Text style={styles.meta}>{`Last session: ${c.lastSession}`}</Text>
                ) : null}
              </View>
              <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
          ))}
        </View>
      )}
      {hasNoResults && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No clients found</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neutral2,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    padding: 0,
  },
  results: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  meta: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  noResults: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
