import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAsyncResource } from '../../hooks/data/useAsyncResource';

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useAsyncResource', () => {
  it('starts loading then resolves to success with data', async () => {
    const def = deferred<number>();
    const { result } = await renderHook(() => useAsyncResource(() => def.promise));
    expect(result.current.status).toBe('loading');

    await act(async () => {
      def.resolve(42);
      await def.promise;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe(42);
  });

  it('transitions to error and exposes the error', async () => {
    const def = deferred<number>();
    const { result } = await renderHook(() => useAsyncResource(() => def.promise));

    await act(async () => {
      def.reject(new Error('nope'));
      await def.promise.catch(() => {});
    });

    expect(result.current.status).toBe('error');
    expect((result.current.error as Error).message).toBe('nope');
  });

  it('refetch re-runs the fetcher', async () => {
    const fetcher = jest.fn((): Promise<number> => Promise.resolve(fetcher.mock.calls.length));
    const { result } = await renderHook(() => useAsyncResource(fetcher));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toBe(1);

    await act(async () => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.data).toBe(2));
  });

  it('aborts the in-flight signal when unmounted', async () => {
    let captured: AbortSignal | undefined;
    const def = deferred<number>();
    const { unmount } = await renderHook(() =>
      useAsyncResource((signal) => {
        captured = signal;
        return def.promise;
      }),
    );
    expect(captured?.aborted).toBe(false);
    await act(async () => {
      unmount();
    });
    expect(captured?.aborted).toBe(true);
  });

  it('ignores a resolution that arrives after the signal was aborted', async () => {
    const def = deferred<number>();
    const { result, unmount } = await renderHook(() => useAsyncResource(() => def.promise));
    unmount();
    await act(async () => {
      def.resolve(99);
      await def.promise;
    });
    // State must not have advanced to success after unmount.
    expect(result.current.status).toBe('loading');
  });
});
