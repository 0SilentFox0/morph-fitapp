import { updateById, removeById } from '../../store/collection';

interface Item {
  id: string;
  name: string;
  count?: number;
}

const items: Item[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta', count: 1 },
];

describe('updateById', () => {
  it('merges updates into the matching item only', () => {
    const next = updateById(items, 'b', { count: 5 });
    expect(next).toEqual([
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta', count: 5 },
    ]);
  });

  it('returns a new array without mutating the input', () => {
    const next = updateById(items, 'a', { name: 'Changed' });
    expect(next).not.toBe(items);
    expect(items[0]!.name).toBe('Alpha');
  });

  it('leaves contents unchanged when no id matches', () => {
    expect(updateById(items, 'z', { name: 'Nope' })).toEqual(items);
  });

  it('matches numeric ids', () => {
    const nums = [{ id: 1, name: 'one' }, { id: 2, name: 'two' }];
    expect(updateById(nums, 2, { name: 'TWO' })[1]).toEqual({ id: 2, name: 'TWO' });
  });
});

describe('removeById', () => {
  it('drops the matching item', () => {
    expect(removeById(items, 'a')).toEqual([{ id: 'b', name: 'Beta', count: 1 }]);
  });

  it('returns a new array and keeps the rest when no id matches', () => {
    const next = removeById(items, 'z');
    expect(next).toEqual(items);
    expect(next).not.toBe(items);
  });
});
