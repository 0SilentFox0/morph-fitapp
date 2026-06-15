import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateRangePicker {
  /** Active timeframe index (e.g. 0 = Week, 1 = Month, 2 = Custom). */
  timeframe: number;
  /** Committed custom range, or null when none has been configured. */
  customRange: DateRange | null;
  /** Which bound the two-step picker is currently selecting, or null when closed. */
  picking: null | 'start' | 'end';
  /** Draft date shown in the open picker. */
  draft: Date;
  /**
   * Select a timeframe by index. Pass `isCustom` for the custom-range option to
   * (re)start range selection; any other option closes an open picker.
   */
  selectTimeframe: (index: number, isCustom: boolean) => void;
  /** Clear the custom range and fall back to the first timeframe. */
  reset: () => void;
  /** Abandon range selection; reverts to the first timeframe if none is set. */
  cancel: () => void;
  /** `onChange` handler for a native DateTimePicker. */
  handleChange: (event: { type?: string }, selected?: Date) => void;
  /** Commit the given date as the current bound (iOS Next / Done). */
  commit: (value: Date) => void;
}

/**
 * Two-step "start then end" date-range picker state machine, decoupled from the
 * view that renders it. Tapping the custom option starts at the `start` bound;
 * committing it advances to `end`; committing `end` stores the range (swapping
 * the bounds if they were picked out of order).
 */
export function useDateRangePicker(): DateRangePicker {
  const [timeframe, setTimeframe] = useState(0);

  const [customRange, setCustomRange] = useState<DateRange | null>(null);

  const [picking, setPicking] = useState<null | 'start' | 'end'>(null);

  const [draft, setDraft] = useState(() => new Date());

  const [draftStart, setDraftStart] = useState<Date | null>(null);

  const openRangePicker = useCallback(() => {
    setDraft(customRange?.start ?? new Date());
    setDraftStart(null);
    setPicking('start');
  }, [customRange]);

  const selectTimeframe = useCallback(
    (index: number, isCustom: boolean) => {
      setTimeframe(index);

      if (isCustom) {
        // Tapping Custom (even when already active) restarts range selection.
        openRangePicker();
      } else {
        // Leaving Custom closes any open picker.
        setPicking(null);
      }
    },
    [openRangePicker]
  );

  const cancel = useCallback(() => {
    setPicking(null);

    // Abandoned before ever configuring a range → fall back to the first option.
    if (!customRange) setTimeframe(0);
  }, [customRange]);

  const reset = useCallback(() => {
    setCustomRange(null);
    setPicking(null);
    setTimeframe(0);
  }, []);

  const commit = useCallback(
    (value: Date) => {
      if (picking === 'start') {
        setDraftStart(value);
        setDraft(value);
        setPicking('end');
      } else if (picking === 'end') {
        const start = draftStart ?? value;

        // Guard against an end earlier than start by swapping.
        const range =
          value < start ? { start: value, end: start } : { start, end: value };

        setCustomRange(range);
        setPicking(null);
      }
    },
    [picking, draftStart]
  );

  const handleChange = useCallback(
    (event: { type?: string }, selected?: Date) => {
      if (Platform.OS === 'android') {
        if (event?.type === 'dismissed' || !selected) {
          cancel();

          return;
        }

        commit(selected);

        return;
      }

      if (selected) setDraft(selected);
    },
    [cancel, commit]
  );

  return {
    timeframe,
    customRange,
    picking,
    draft,
    selectTimeframe,
    reset,
    cancel,
    handleChange,
    commit,
  };
}
