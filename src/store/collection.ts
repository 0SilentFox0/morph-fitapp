/**
 * Immutable helpers for the `{ id }`-entity arrays held in zustand stores.
 * Replace the `items.map(x => x.id === id ? { ...x, ...updates } : x)` and
 * `items.filter(x => x.id !== id)` patterns repeated across stores.
 */

type Identifiable = { id: string | number };

/**
 * New array with the item matching `id` shallow-merged with `updates`.
 * `T` is inferred from `items` only (NoInfer), so a narrower `updates` type
 * such as `Partial<Omit<T, 'id'>>` at the call site doesn't widen `T`.
 */
export function updateById<T extends Identifiable>(
  items: T[],
  id: NoInfer<T>['id'],
  updates: Partial<NoInfer<T>>,
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

/** New array without the item matching `id`. */
export function removeById<T extends Identifiable>(items: T[], id: NoInfer<T>['id']): T[] {
  return items.filter((item) => item.id !== id);
}
