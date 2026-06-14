import { renderHook, act } from '@testing-library/react-native';
import { useMirror } from '../../hooks/useMirror';

describe('useMirror', () => {
  it('pushes the value to the setter when enabled', async () => {
    const setter = jest.fn();
    await renderHook(() => useMirror('a', true, setter));
    expect(setter).toHaveBeenCalledWith('a');
  });

  it('does nothing when disabled', async () => {
    const setter = jest.fn();
    await renderHook(() => useMirror('a', false, setter));
    expect(setter).not.toHaveBeenCalled();
  });

  it('re-syncs when the value changes', async () => {
    const setter = jest.fn();
    const { rerender } = await renderHook(({ v }: { v: string }) => useMirror(v, true, setter), {
      initialProps: { v: 'a' },
    });
    setter.mockClear();
    await act(async () => rerender({ v: 'b' }));
    expect(setter).toHaveBeenCalledWith('b');
  });
});
