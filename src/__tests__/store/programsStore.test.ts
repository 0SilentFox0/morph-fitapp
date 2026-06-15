import { useProgramsStore } from '../../store/programsStore';

const initialPrograms = useProgramsStore.getState().programs;

beforeEach(() => {
  useProgramsStore.setState({ programs: [...initialPrograms] });
});

describe('useProgramsStore', () => {
  it('addProgram prepends a new program with an id and returns it', () => {
    const before = useProgramsStore.getState().programs.length;

    const created = useProgramsStore.getState().addProgram({
      name: 'New One',
      tag: 'HIIT',
      videoCount: 3,
      views: 0,
      likes: 0,
    });

    const programs = useProgramsStore.getState().programs;

    expect(programs).toHaveLength(before + 1);
    expect(programs[0]!.id).toBe(created.id);
    expect(typeof created.id).toBe('string');
    expect(created.thumbnail).toBeTruthy(); // falls back to a stock image
  });

  it('addProgramFromDraft maps draft fields with sensible defaults', () => {
    const created = useProgramsStore.getState().addProgramFromDraft({
      title: '',
      tag: '',
      description: 'desc',
      exercises: [
        {
          id: 1,
          name: 'Squat',
          category: 'Legs',
          imageUrl: null,
          sets: [{ weight: 20, reps: 10 }],
        },
      ],
    });

    expect(created.name).toBe('New Program');
    expect(created.tag).toBe('HIIT');
    expect(created.videoCount).toBe(1);
    expect(created.views).toBe(0);
  });

  it('updateProgram merges and deleteProgram removes', () => {
    const created = useProgramsStore.getState().addProgram({
      name: 'Temp',
      tag: 'Yoga',
      videoCount: 1,
      views: 0,
      likes: 0,
    });

    useProgramsStore.getState().updateProgram(created.id, { name: 'Updated' });
    expect(useProgramsStore.getState().getProgram(created.id)!.name).toBe(
      'Updated'
    );

    useProgramsStore.getState().deleteProgram(created.id);
    expect(useProgramsStore.getState().getProgram(created.id)).toBeUndefined();
  });

  it('searchPrograms matches name or tag; empty query returns all', () => {
    useProgramsStore.setState({
      programs: [
        {
          id: '1',
          name: 'HIIT Power',
          tag: 'HIIT',
          videoCount: 1,
          views: 0,
          likes: 0,
        },
        {
          id: '2',
          name: 'Yoga Flow',
          tag: 'Yoga',
          videoCount: 1,
          views: 0,
          likes: 0,
        },
      ],
    });

    expect(
      useProgramsStore
        .getState()
        .searchPrograms('yoga')
        .map((p) => p.id)
    ).toEqual(['2']);
    expect(
      useProgramsStore
        .getState()
        .searchPrograms('hiit')
        .map((p) => p.id)
    ).toEqual(['1']);
    expect(useProgramsStore.getState().searchPrograms('')).toHaveLength(2);
  });
});
