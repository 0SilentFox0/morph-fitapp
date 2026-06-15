/** Format a weight/volume in kg: "1.5t" at/above 1000kg, otherwise "999kg". */
export function formatKg(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)}kg`;
}
