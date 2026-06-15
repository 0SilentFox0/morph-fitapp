import { act, renderHook } from '@testing-library/react-native';

import { useSessionForm } from '../../screens/home/screens/SessionForm/useSessionForm';
import { useProgramsStore } from '../../store/programsStore';
import { useSessionsStore } from '../../store/sessionsStore';

describe('useSessionForm', () => {
  beforeEach(() => {
    useProgramsStore.setState({
      programs: [
        { id: 'p1', name: 'Leg Day', tag: 'HIIT', exercises: [] },
      ] as never,
    });
  });

  it('creates a pending session and signals completion on a valid submit', async () => {
    const addSession = jest.fn();

    useSessionsStore.setState({ addSession });

    const onComplete = jest.fn();

    const { result } = await renderHook(() =>
      useSessionForm(undefined, onComplete)
    );

    await act(async () => {
      result.current.setValue('title', 'Morning session');
      result.current.setValue('programId', 'p1');
    });
    await act(async () => {
      await result.current.submit();
    });

    expect(addSession).toHaveBeenCalledTimes(1);
    expect(addSession.mock.calls[0]![0]).toMatchObject({
      title: 'Morning session',
      programId: 'p1',
      status: 'pending',
    });
    expect(onComplete).toHaveBeenCalled();
  });

  it('does not submit (or complete) when required fields are missing', async () => {
    const addSession = jest.fn();

    useSessionsStore.setState({ addSession });

    const onComplete = jest.fn();

    const { result } = await renderHook(() =>
      useSessionForm(undefined, onComplete)
    );

    await act(async () => {
      await result.current.submit(); // title/programId empty → invalid
    });

    expect(addSession).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
