import { useOnboardingStore } from '../../store/onboardingStore';

const get = () => useOnboardingStore.getState();

beforeEach(() => {
  get().reset();
});

describe('useOnboardingStore', () => {
  it('setField updates an arbitrary field', () => {
    get().setField('name', 'Alex');
    get().setField('selfLevel', 'Amateur');
    expect(get().name).toBe('Alex');
    expect(get().selfLevel).toBe('Amateur');
  });

  describe('multi-select toggles', () => {
    it('toggleTrainingType adds then removes a value', () => {
      get().toggleTrainingType('Yoga');
      expect(get().trainingTypes).toEqual(['Yoga']);
      get().toggleTrainingType('Strength');
      expect(get().trainingTypes).toEqual(['Yoga', 'Strength']);
      get().toggleTrainingType('Yoga');
      expect(get().trainingTypes).toEqual(['Strength']);
    });

    it('toggleClientType and toggleLocation are independent', () => {
      get().toggleClientType('Beginners');
      get().toggleLocation('Online');
      expect(get().clientTypes).toEqual(['Beginners']);
      expect(get().locations).toEqual(['Online']);
    });

    it('toggleWorkDay starts from the Mon–Fri default', () => {
      expect(get().workDays).toEqual([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ]);
      get().toggleWorkDay('Saturday');
      expect(get().workDays).toContain('Saturday');
      get().toggleWorkDay('Monday');
      expect(get().workDays).not.toContain('Monday');
    });

    it('togglePreferredFormat adds then removes a value', () => {
      get().togglePreferredFormat('Online');
      get().togglePreferredFormat('In-person');
      expect(get().preferredFormat).toEqual(['Online', 'In-person']);
      get().togglePreferredFormat('Online');
      expect(get().preferredFormat).toEqual(['In-person']);
    });
  });

  describe('certifications', () => {
    it('adds and removes by uri', () => {
      get().addCertification({ name: 'a.pdf', uri: 'file://a' });
      get().addCertification({ name: 'b.pdf', uri: 'file://b' });
      expect(get().certifications).toHaveLength(2);
      get().removeCertification('file://a');
      expect(get().certifications).toEqual([
        { name: 'b.pdf', uri: 'file://b' },
      ]);
    });
  });

  it('reset restores the initial state', () => {
    get().setField('name', 'Alex');
    get().setField('hasInjuries', true);
    get().toggleTrainingType('Yoga');
    get().togglePreferredFormat('Online');

    get().reset();

    expect(get().name).toBe('');
    expect(get().hasInjuries).toBe(false);
    expect(get().trainingTypes).toEqual([]);
    expect(get().preferredFormat).toEqual([]);
    expect(get().selfLevel).toBe('');
  });
});
