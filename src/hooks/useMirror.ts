import { useEffect } from 'react';

/**
 * Mirror `value` into an external `setter` whenever it changes, while `enabled`.
 * Collapses the repeated `useEffect(() => { if (enabled) setX(value) }, [...])`
 * pattern used to keep a persisted draft in sync with form fields.
 */
export function useMirror<T>(value: T, enabled: boolean, setter: (value: T) => void): void {
  useEffect(() => {
    if (enabled) setter(value);
  }, [value, enabled, setter]);
}
