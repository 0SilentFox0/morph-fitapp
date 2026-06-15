import React from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncResource<T> {
  data: T | undefined;
  status: AsyncStatus;
  error: unknown;
  /** Re-run the fetcher (e.g. from a "Retry" button). */
  refetch: () => void;
}

interface State<T> {
  status: AsyncStatus;
  data: T | undefined;
  error: unknown;
}

/**
 * Standard async-data hook: runs `fetcher` on mount and whenever `deps` change,
 * tracks loading/success/error, and cancels stale work via an AbortSignal so a
 * late response can never overwrite fresher state (no setState-after-unmount).
 *
 * The fetcher receives an AbortSignal — forward it to the request/fetch so the
 * network call is actually torn down, not just ignored.
 */
export function useAsyncResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = [],
): AsyncResource<T> {
  const [state, setState] = React.useState<State<T>>({
    status: 'loading',
    data: undefined,
    error: undefined,
  });
  const [tick, setTick] = React.useState(0);

  // Always call the latest fetcher without making its identity a dependency.
  const fetcherRef = React.useRef(fetcher);
  fetcherRef.current = fetcher;

  React.useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading', error: undefined }));
    fetcherRef.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data, error: undefined });
      },
      (error) => {
        if (!controller.signal.aborted) setState({ status: 'error', data: undefined, error });
      },
    );
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const refetch = React.useCallback(() => setTick((t) => t + 1), []);

  return { ...state, refetch };
}
