import React from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Input } from '../../../components/ui';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { Checkbox } from './Checkbox';

/** Client experience step: injuries / health-limitations flag + optional note. */
export function InjuriesField() {
  const { hasInjuries, injuriesNote, setField } = useOnboardingStore(
    useShallow((s) => ({
      hasInjuries: s.hasInjuries,
      injuriesNote: s.injuriesNote,
      setField: s.setField,
    }))
  );

  return (
    <>
      <Checkbox
        checked={hasInjuries}
        onToggle={() => setField('hasInjuries', !hasInjuries)}
        label="I have injuries or health limitations"
      />

      {hasInjuries && (
        <Input
          placeholder="Briefly describe them (optional)"
          value={injuriesNote}
          onChangeText={(text) => setField('injuriesNote', text)}
          multiline
          numberOfLines={3}
          accessibilityLabel="Injuries or health limitations"
        />
      )}
    </>
  );
}
