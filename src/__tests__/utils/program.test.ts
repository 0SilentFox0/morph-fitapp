import { programMeta, participantIdForName, buildParticipants } from '../../utils/program';

describe('programMeta', () => {
  it('uses the exercise count when exercises are present', () => {
    expect(programMeta({ tag: 'Strength', videoCount: 3, exercises: [{}, {}] as never })).toBe(
      'Strength · 2 exercises',
    );
  });

  it('falls back to videoCount when exercises are absent', () => {
    expect(programMeta({ tag: 'Cardio', videoCount: 5 })).toBe('Cardio · 5 exercises');
  });
});

describe('participantIdForName', () => {
  it('slugifies the name', () => {
    expect(participantIdForName('Marcus Reed')).toBe('p-marcus-reed');
  });
});

describe('buildParticipants', () => {
  it('creates ids for new names', () => {
    expect(buildParticipants(['Anna Lee'])).toEqual([{ id: 'p-anna-lee', name: 'Anna Lee' }]);
  });

  it('preserves id and avatar of existing participants', () => {
    const existing = [{ id: 'x1', name: 'Anna Lee', avatar: 'a.png' }];
    expect(buildParticipants(['Anna Lee'], existing)).toEqual([
      { id: 'x1', name: 'Anna Lee', avatar: 'a.png' },
    ]);
  });
});
