import {
  displayToKg,
  formatWeight,
  kgToDisplay,
  weightUnitLabel,
} from '../../utils/format/units';

describe('weight units', () => {
  it('metric is a pass-through', () => {
    expect(kgToDisplay(52.5, 'metric')).toBe(52.5);
    expect(displayToKg(52.5, 'metric')).toBe(52.5);
    expect(weightUnitLabel('metric')).toBe('kg');
    expect(formatWeight(52.5, 'metric')).toBe('52.5kg');
  });

  it('imperial converts kg ↔ lb and rounds display to 0.1', () => {
    expect(kgToDisplay(100, 'imperial')).toBe(220.5);
    expect(weightUnitLabel('imperial')).toBe('lb');
    expect(formatWeight(100, 'imperial')).toBe('220.5lb');
  });

  it('round-trips an entered imperial value back to kg', () => {
    const kg = displayToKg(220.5, 'imperial');

    expect(Math.round(kg)).toBe(100);
  });
});
