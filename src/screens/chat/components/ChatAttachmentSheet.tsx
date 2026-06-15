import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Overlay } from '../../../components/ui';
import theme from '../../../theme';
const { colors, radius, typography, spacing } = theme;

interface ChatAttachmentSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Called with the chosen photo URI when the user taps a gallery thumbnail. */
  onPick: (uri: string) => void;
}

// Mock "Recent" gallery photos (Figma node 2006:10559 shows a 3-column grid).
const RECENT_PHOTOS: string[] = Array.from(
  { length: 12 },
  (_, i) => `https://picsum.photos/seed/fitchat-${i}/300/300`
);

/**
 * Attachment picker bottom-sheet opened from the message-bar link button.
 * "Recent" header with a close button over a 3-column photo grid, matching
 * Figma node 2006:10559.
 */
export function ChatAttachmentSheet({ visible, onClose, onPick }: ChatAttachmentSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Overlay visible={visible} onClose={onClose} justify="flex-end">
      <TouchableOpacity activeOpacity={1} style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Recent</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.neutral9} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <View style={styles.grid}>
            {RECENT_PHOTOS.map((uri) => (
              <TouchableOpacity
                key={uri}
                style={styles.cell}
                activeOpacity={0.8}
                onPress={() => onPick(uri)}
              >
                <Image source={{ uri }} style={styles.photo} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </TouchableOpacity>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    height: '64%',
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
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '33.333%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.neutral2,
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral3,
  },
});
