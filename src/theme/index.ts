import { colors, heatColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { createChartConfig } from './chartConfig';

export { colors, heatColors } from './colors';
export type { ColorToken } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { radius } from './radius';
export { darkTheme } from './themes';
export type { ThemeColors } from './themes';
export { ThemeProvider, useTheme } from './ThemeContext';
export { createChartConfig } from './chartConfig';

/**
 * Aggregated design tokens for grouped consumption:
 *
 *   import theme from '../../theme';
 *   const { colors, spacing, typography, radius } = theme;
 */
const theme = { colors, heatColors, typography, spacing, radius, createChartConfig };
export default theme;
