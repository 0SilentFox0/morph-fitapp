import { renderHook, act } from '@testing-library/react-native';
import { useDisclosure } from '../../hooks/useDisclosure';

describe('useDisclosure', () => {
  it('defaults to closed', async () => {
    const { result } = await renderHook(() => useDisclosure());
    expect(result.current.visible).toBe(false);
  });

  it('honors the initial value', async () => {
    const { result } = await renderHook(() => useDisclosure(true));
    expect(result.current.visible).toBe(true);
  });

  it('open / close / toggle update visibility', async () => {
    const { result } = await renderHook(() => useDisclosure());

    await act(async () => result.current.open());
    expect(result.current.visible).toBe(true);

    await act(async () => result.current.close());
    expect(result.current.visible).toBe(false);

    await act(async () => result.current.toggle());
    expect(result.current.visible).toBe(true);
  });

  it('keeps handler identities stable across renders', async () => {
    const { result, rerender } = await renderHook(() => useDisclosure());
    const first = result.current;
    rerender({});
    expect(result.current.open).toBe(first.open);
    expect(result.current.close).toBe(first.close);
    expect(result.current.toggle).toBe(first.toggle);
  });
});
