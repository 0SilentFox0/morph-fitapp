import { Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import { useDateTimePicker } from '../../hooks/datetime/useDateTimePicker';

describe('useDateTimePicker', () => {
  it('starts closed and exposes disclosure controls', async () => {
    const { result } = await renderHook(() => useDateTimePicker(jest.fn()));

    expect(result.current.visible).toBe(false);
    await act(async () => result.current.open());
    expect(result.current.visible).toBe(true);
  });

  it('forwards the selected value to onChange', async () => {
    const onChange = jest.fn();

    const { result } = await renderHook(() => useDateTimePicker(onChange));

    const picked = new Date('2026-02-01');

    await act(async () => result.current.handleChange({}, picked));
    expect(onChange).toHaveBeenCalledWith(picked);
  });

  it('ignores a change with no selected value', async () => {
    const onChange = jest.fn();

    const { result } = await renderHook(() => useDateTimePicker(onChange));

    await act(async () => result.current.handleChange({}, undefined));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes the picker on Android after a change', async () => {
    const original = Platform.OS;

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });
    try {
      const { result } = await renderHook(() => useDateTimePicker(jest.fn()));

      await act(async () => result.current.open());
      await act(async () =>
        result.current.handleChange({}, new Date('2026-02-01'))
      );
      expect(result.current.visible).toBe(false);
    } finally {
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        get: () => original,
      });
    }
  });
});
