import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Overlay } from '../../../components/ui';
import theme from '../../../theme';
const { colors, radius, typography, spacing } = theme;

/** Actions surfaced by the thread "more" menu, per Figma node 2006:10537. */
export type ChatOptionAction =
  | 'reschedule'
  | 'cancel'
  | 'viewClient'
  | 'viewProgram'
  | 'addClient';

interface ChatOptionsSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (action: ChatOptionAction) => void;
}

// A divider sits between "Cancel session" and "View client profile".
const OPTIONS: { action: ChatOptionAction; label: string; dividerBefore?: boolean }[] = [
  { action: 'reschedule', label: 'Reschedule session' },
  { action: 'cancel', label: 'Cancel session' },
  { action: 'viewClient', label: 'View client profile', dividerBefore: true },
  { action: 'viewProgram', label: 'View program' },
  { action: 'addClient', label: 'Add client to group' },
];

/**
 * Bottom-sheet menu opened from the chat thread header.
 * Drag handle + "Title" header with a close button, then a list of 48px-tall
 * action rows. Matches Figma node 2006:10537.
 */
export function ChatOptionsSheet({ visible, title, onClose, onSelect }: ChatOptionsSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Overlay visible={visible} onClose={onClose} justify="flex-end">
      <TouchableOpacity activeOpacity={1} style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.neutral9} />
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {OPTIONS.map((item) => (
            <React.Fragment key={item.action}>
              {item.dividerBefore && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => onSelect(item.action)}
              >
                <Text style={styles.optionLabel}>{item.label}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    backgroundColor: colors.neutral2,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    lineHeight: 32,
    fontWeight: typography.weights.normal,
    color: colors.neutral9,
  },
  list: {
    width: '100%',
  },
  option: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  optionLabel: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral3,
    marginHorizontal: spacing.md,
  },
});
