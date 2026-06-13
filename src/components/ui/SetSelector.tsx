import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface SetSelectorProps {
  count: number;
  value: number;
  onChange: (index: number) => void;
  /** How many leading pills to show before collapsing with an ellipsis. */
  maxVisible?: number;
}

/**
 * Set pills for the live Exercise screen (Figma 2006:8333). When there are more
 * sets than `maxVisible`, the middle collapses behind an ellipsis pill that
 * expands on tap. The active set is always visible.
 */
export function SetSelector({ count, value, onChange, maxVisible = 6 }: SetSelectorProps) {
  const [expanded, setExpanded] = React.useState(false);
  const indices = Array.from({ length: count }, (_, i) => i);

  const collapse = !expanded && count > maxVisible + 1;
  let visible: number[];
  if (!collapse) {
    visible = indices;
  } else {
    const head = indices.slice(0, maxVisible);
    const last = count - 1;
    visible = head.includes(last) ? head : [...head, last];
    // ensure the active set is reachable without expanding
    if (!visible.includes(value)) visible = [...head, value, last];
  }

  return (
    <View style={styles.row}>
      {visible.map((i, pos) => {
        const showEllipsis = collapse && pos === maxVisible - 1 && i !== count - 2;
        return (
          <React.Fragment key={i}>
            <Pill label={String(i + 1)} active={i === value} onPress={() => onChange(i)} />
            {showEllipsis && (
              <Pill label="..." active={false} onPress={() => setExpanded(true)} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
    >
      <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    minWidth: 36,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.neutral3,
    borderColor: colors.neutral10,
  },
  pillInactive: {
    backgroundColor: colors.neutral1,
    borderColor: colors.neutral5,
  },
  pillText: {
    fontSize: typography.sizes.sm,
  },
  pillTextActive: {
    color: colors.neutral10,
  },
  pillTextInactive: {
    color: colors.neutral8,
  },
});
