/** Weight unit preference. Values are always STORED in kilograms; this only
 *  affects how they are entered and displayed. */
export type Units = 'metric' | 'imperial';

const KG_PER_LB = 0.45359237;

/** Convert a stored kg value to the user's display unit (rounded to 0.1). */
export function kgToDisplay(kg: number, units: Units): number {
  const value = units === 'imperial' ? kg / KG_PER_LB : kg;

  return Math.round(value * 10) / 10;
}

/** Convert an entered display value back to kg for storage. */
export function displayToKg(value: number, units: Units): number {
  return units === 'imperial' ? value * KG_PER_LB : value;
}

export function weightUnitLabel(units: Units): 'kg' | 'lb' {
  return units === 'imperial' ? 'lb' : 'kg';
}

/** Format a stored kg value for display, e.g. "52.5kg" / "115.7lb". */
export function formatWeight(kg: number, units: Units): string {
  return `${kgToDisplay(kg, units)}${weightUnitLabel(units)}`;
}
