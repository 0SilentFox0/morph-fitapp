import { Dimensions } from 'react-native';

import theme from '../../theme';

const { spacing } = theme;

/**
 * Width for a chart that fills a screen padded by `spacing.lg` on each side.
 * `inset` subtracts any extra horizontal padding from the enclosing card so the
 * chart never overflows. Computed from the current window width (not reactive to
 * orientation changes, matching prior call-site behavior).
 */
export function getChartWidth(inset = 0): number {
  return Dimensions.get('window').width - spacing.lg * 2 - inset;
}
