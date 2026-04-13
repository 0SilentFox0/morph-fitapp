import { darkTheme } from './themes';

export const colors = {
  ...darkTheme,

  // Semantic aliases
  text: darkTheme.neutral10,
  textSecondary: darkTheme.neutral8,
  textMuted: darkTheme.neutral7,
  border: darkTheme.neutral3,
  cardBg: darkTheme.neutral2,
  inputBg: darkTheme.neutral1,
  accent: darkTheme.primary6,
  Success: darkTheme.success6,
  Warning: darkTheme.warning7,
  Error: darkTheme.error8,
} as const;

export type ColorToken = keyof typeof colors;