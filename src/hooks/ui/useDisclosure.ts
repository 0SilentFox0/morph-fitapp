import { useCallback, useState } from 'react';

export interface Disclosure {
  /** Whether the modal / sheet / picker is currently shown. */
  visible: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Boolean open/close state for a modal, bottom sheet, picker or any toggleable
 * overlay. Replaces the `const [x, setX] = useState(false)` + inline
 * `setX(true)` / `setX(false)` pattern repeated across screens. The handlers are
 * stable, so they can be passed straight to `onClose` / `onPress` props.
 */
export function useDisclosure(initial = false): Disclosure {
  const [visible, setVisible] = useState(initial);

  const open = useCallback(() => setVisible(true), []);

  const close = useCallback(() => setVisible(false), []);

  const toggle = useCallback(() => setVisible((v) => !v), []);

  return { visible, open, close, toggle };
}
