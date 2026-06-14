import { renderHook, act } from '@testing-library/react-native';
import { useDateRangePicker } from '../../hooks/useDateRangePicker';

const d = (iso: string) => new Date(iso);

describe('useDateRangePicker', () => {
  it('starts on the first timeframe with no range and no open picker', async () => {
    const { result } = await renderHook(() => useDateRangePicker());
    expect(result.current.timeframe).toBe(0);
    expect(result.current.customRange).toBeNull();
    expect(result.current.picking).toBeNull();
  });

  it('selecting a non-custom timeframe closes the picker', async () => {
    const { result } = await renderHook(() => useDateRangePicker());
    await act(async () => result.current.selectTimeframe(2, true));
    expect(result.current.picking).toBe('start');

    await act(async () => result.current.selectTimeframe(1, false));
    expect(result.current.timeframe).toBe(1);
    expect(result.current.picking).toBeNull();
  });

  it('walks start → end and stores the committed range', async () => {
    const { result } = await renderHook(() => useDateRangePicker());

    await act(async () => result.current.selectTimeframe(2, true));
    expect(result.current.picking).toBe('start');

    await act(async () => result.current.commit(d('2026-01-10')));
    expect(result.current.picking).toBe('end');

    await act(async () => result.current.commit(d('2026-01-20')));
    expect(result.current.picking).toBeNull();
    expect(result.current.customRange).toEqual({ start: d('2026-01-10'), end: d('2026-01-20') });
  });

  it('swaps bounds picked out of order', async () => {
    const { result } = await renderHook(() => useDateRangePicker());
    await act(async () => result.current.selectTimeframe(2, true));
    await act(async () => result.current.commit(d('2026-01-20')));
    await act(async () => result.current.commit(d('2026-01-10')));
    expect(result.current.customRange).toEqual({ start: d('2026-01-10'), end: d('2026-01-20') });
  });

  it('cancel before any range falls back to the first timeframe', async () => {
    const { result } = await renderHook(() => useDateRangePicker());
    await act(async () => result.current.selectTimeframe(2, true));
    await act(async () => result.current.cancel());
    expect(result.current.picking).toBeNull();
    expect(result.current.timeframe).toBe(0);
    expect(result.current.customRange).toBeNull();
  });

  it('reset clears the range and returns to the first timeframe', async () => {
    const { result } = await renderHook(() => useDateRangePicker());
    await act(async () => result.current.selectTimeframe(2, true));
    await act(async () => result.current.commit(d('2026-01-10')));
    await act(async () => result.current.commit(d('2026-01-20')));

    await act(async () => result.current.reset());
    expect(result.current.customRange).toBeNull();
    expect(result.current.timeframe).toBe(0);
    expect(result.current.picking).toBeNull();
  });
});
