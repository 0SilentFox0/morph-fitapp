import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export type ProgramOptionAction = 'edit' | 'delete' | 'create-session';

interface ProgramOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: ProgramOptionAction) => void;
}

const OPTIONS: { action: ProgramOptionAction; label: string; icon: 'create-outline' | 'trash-outline' | 'calendar-outline' }[] = [
  { action: 'edit', label: 'Edit program', icon: 'create-outline' },
  { action: 'create-session', label: 'Create session from program', icon: 'calendar-outline' },
  { action: 'delete', label: 'Delete program', icon: 'trash-outline' },
];

export function ProgramOptionsMenu({
  visible,
  onClose,
  onSelect,
}: ProgramOptionsMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.menuWrap}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.menuOverlay} />
          <View style={styles.menu}>
            {OPTIONS.map((item, index) => (
              <React.Fragment key={item.action}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={[styles.option, item.action === 'delete' && styles.optionDestructive]}
                  onPress={() => {
                    onSelect(item.action);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.action === 'delete' ? colors.Error : colors.text}
                  />
                  <Text style={[styles.optionLabel, item.action === 'delete' && styles.optionLabelDestructive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuWrap: {
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 220,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
  },
  menu: {
    padding: spacing.sm,
    gap: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  optionDestructive: {},
  optionLabel: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: typography.weights.normal,
    color: colors.text,
  },
  optionLabelDestructive: {
    color: colors.Error,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 0,
  },
});
