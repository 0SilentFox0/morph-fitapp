import { Dimensions } from 'react-native';
import { getChartWidth } from '../../utils/common/layout';
import { spacing } from '../../theme/spacing';

describe('getChartWidth', () => {
  const spy = jest
    .spyOn(Dimensions, 'get')
    .mockReturnValue({ width: 400, height: 800, scale: 1, fontScale: 1 });

  afterAll(() => spy.mockRestore());

  it('subtracts the screen padding (spacing.lg on each side) by default', () => {
    expect(getChartWidth()).toBe(400 - spacing.lg * 2);
  });

  it('subtracts an additional inset when given', () => {
    expect(getChartWidth(20)).toBe(400 - spacing.lg * 2 - 20);
    expect(getChartWidth(spacing.md * 2)).toBe(400 - spacing.lg * 2 - spacing.md * 2);
  });
});
