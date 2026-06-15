import { renderHook, act } from '@testing-library/react-native';
import { useProgramDraftForm } from '../../screens/home/screens/AddToLibraryForm/useProgramDraftForm';
import { useProgramsStore } from '../../store/programsStore';
import { useDraftProgramStore } from '../../store/draftProgramStore';

const nav = () => ({ goBack: jest.fn(), goToGallery: jest.fn(), goToLibrary: jest.fn() });

describe('useProgramDraftForm', () => {
  it('save-as-draft (create) adds the draft program and routes to the library', async () => {
    const addProgramFromDraft = jest.fn();
    useProgramsStore.setState({ addProgramFromDraft, updateProgram: jest.fn() });
    useDraftProgramStore.setState({ title: 'My Program', tag: 'Cardio', description: '', exercises: [] });
    const n = nav();

    const { result } = await renderHook(() => useProgramDraftForm(undefined, n));
    await act(async () => result.current.saveDraft());

    expect(addProgramFromDraft).toHaveBeenCalledTimes(1);
    expect(addProgramFromDraft.mock.calls[0]![0]).toMatchObject({ title: 'My Program', tag: 'Cardio' });
    expect(n.goToLibrary).toHaveBeenCalled();
  });

  it('submit (edit) updates the program and goes back', async () => {
    const updateProgram = jest.fn();
    useProgramsStore.setState({ updateProgram, addProgramFromDraft: jest.fn() });
    const program = { id: 'p1', name: 'Legs', tag: 'HIIT', description: '', exercises: [] } as never;
    const n = nav();

    const { result } = await renderHook(() => useProgramDraftForm(program, n));
    await act(async () => {
      await result.current.submit();
    });

    expect(updateProgram).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Legs', tag: 'HIIT' }));
    expect(n.goBack).toHaveBeenCalled();
  });
});
