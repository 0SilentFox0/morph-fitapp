import { useCallback } from 'react';
import { Platform } from 'react-native';

import { type Disclosure, useDisclosure } from '../ui/useDisclosure';

export interface DateTimePicker extends Disclosure {
  /**
   * `onChange` for a native DateTimePicker: forwards the selected value and, on
   * Android (where the dialog auto-dismisses on selection), closes the picker.
   */
  handleChange: (event: unknown, selected?: Date) => void;
}

/**
 * Open/close state plus the native-picker change handler for a single date or
 * time field. Wraps useDisclosure and folds in the repeated
 * "close on Android, forward the value" onChange logic.
 */
export function useDateTimePicker(
  onChange: (value: Date) => void
): DateTimePicker {
  const disclosure = useDisclosure();

  const { close } = disclosure;

  const handleChange = useCallback(
    (_event: unknown, selected?: Date) => {
      if (Platform.OS === 'android') close();

      if (selected) onChange(selected);
    },
    [close, onChange]
  );

  return { ...disclosure, handleChange };
}
