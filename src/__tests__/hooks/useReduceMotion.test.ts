// src/__tests__/hooks/useReduceMotion.test.ts
import { renderHook } from '@testing-library/react-native';
import { useReduceMotion } from '../../hooks/ui/useReduceMotion';

describe('useReduceMotion', () => {
  it('defaults to false before the async query resolves', async () => {
    const { result } = await renderHook(() => useReduceMotion());
    expect(result.current).toBe(false);
  });
});
