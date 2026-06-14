import { normalizeQuery, searchItems, searchByName } from '../../utils/search';

describe('normalizeQuery', () => {
  it('trims and lowercases', () => {
    expect(normalizeQuery('  HeLLo  ')).toBe('hello');
  });
});

describe('searchByName', () => {
  const items = [{ name: 'Marcus Reed' }, { name: 'Sofia Marenko' }, { name: 'Daniel Cho' }];

  it('returns all items for an empty/whitespace query', () => {
    expect(searchByName('   ', items)).toBe(items);
  });

  it('matches case-insensitively on a substring', () => {
    expect(searchByName('mar', items)).toEqual([{ name: 'Marcus Reed' }, { name: 'Sofia Marenko' }]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchByName('zzz', items)).toEqual([]);
  });
});

describe('searchItems', () => {
  const sessions = [
    { title: 'Leg day', type: 'Personal', participants: [{ name: 'Anna' }] },
    { title: 'Cardio', type: 'Group', participants: [{ name: 'Bob' }, { name: 'Cara' }] },
  ];
  const select = (s: (typeof sessions)[number]) => [
    s.title,
    s.type,
    ...s.participants.map((p) => p.name),
  ];

  it('matches across flat and nested fields', () => {
    expect(searchItems('cara', sessions, select)).toEqual([sessions[1]]);
    expect(searchItems('personal', sessions, select)).toEqual([sessions[0]]);
  });

  it('ignores null/undefined field values', () => {
    const data = [{ a: 'keep' }, { a: undefined }];
    expect(searchItems('keep', data, (d) => [d.a])).toEqual([{ a: 'keep' }]);
  });
});
