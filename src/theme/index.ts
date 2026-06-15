import { createChartConfig } from './chartConfig';
import { colors, heatColors } from './colors';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export { createChartConfig } from './chartConfig';
export type { ColorToken } from './colors';
export { colors, heatColors } from './colors';
export { radius } from './radius';
export { spacing } from './spacing';
export { ThemeProvider, useTheme } from './ThemeContext';
export type { ThemeColors } from './themes';
export { darkTheme } from './themes';
export { typography } from './typography';

/**
 * Aggregated design tokens for grouped consumption:
 *
 *   import theme from '../../theme';
 *   const { colors, spacing, typography, radius } = theme;
 */
const theme = {
  colors,
  heatColors,
  typography,
  spacing,
  radius,
  createChartConfig,
};

export default theme;
