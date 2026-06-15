import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Overlay } from '../../../../components/ui';
import { TRAINING_TYPES } from '../../../../constants';
import theme from '../../../../theme';

const { colors, radius, typography, spacing } = theme;

export interface TagPickerModalProps {
  visible: boolean;
  /** Currently selected tag, highlighted in the list. */
  value: string;
  onClose: () => void;
  onSelect: (tag: string) => void;
}

/** Modal list for picking a program's training-type tag. */
export function TagPickerModal({
  visible,
  value,
  onClose,
  onSelect,
}: TagPickerModalProps) {
  return (
    <Overlay visible={visible} onClose={onClose}>
      <View style={styles.modalContent}>
        <FlatList
          data={TRAINING_TYPES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.modalOption,
                value === item && styles.modalOptionActive,
              ]}
              onPress={() => onSelect(item)}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  value === item && styles.modalOptionTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    width: '80%',
    backgroundColor: colors.neutral2,
    borderRadius: radius.lg,
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
