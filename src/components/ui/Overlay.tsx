import React from 'react';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';

import theme from '../../theme';

const { colors } = theme;

export interface OverlayProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Vertical placement of the content within the scrim. */
  justify?: 'center' | 'flex-end' | 'flex-start';
}

/**
 * Fade-in modal scrim. Consolidates the repeated
 * `<Modal transparent animationType="fade"> + backdrop TouchableOpacity`
 * pattern and standardizes the previously inconsistent backdrop opacities
 * onto the `colors.overlay` token. Tapping the scrim calls `onClose`.
 */
export function Overlay({
  visible,
  onClose,
  children,
  justify = 'center',
}: OverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.scrim, { justifyContent: justify }]}
        activeOpacity={1}
        onPress={onClose}
      >
        {children}
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
  },
});
