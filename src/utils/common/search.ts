/**
 * Case-insensitive substring search helpers.
 * Replaces the `q.toLowerCase().includes(...)` pattern duplicated across
 * stores and screens.
 */

/** Trim + lowercase a raw search query. */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * Filter `items` by a case-insensitive match against the strings returned by
 * `fields`. An empty query returns the list unchanged. The selector form
 * handles flat fields, string arrays, and nested values alike, e.g.
 * `searchItems(q, sessions, (s) => [s.title, s.type, ...s.participants.map(p => p.name)])`.
 */
export function searchItems<T>(
  query: string,
  items: T[],
  fields: (item: T) => Array<string | null | undefined>
): T[] {
  const q = normalizeQuery(query);

  if (!q) return items;

  return items.filter((item) =>
    fields(item).some(
      (value) => value != null && value.toLowerCase().includes(q)
    )
  );
}

/** Convenience for the common `{ name: string }` case. */
export function searchByName<T extends { name: string }>(
  query: string,
  items: T[]
): T[] {
  return searchItems(query, items, (item) => [item.name]);
}
