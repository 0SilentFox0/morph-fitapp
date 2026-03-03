export const colors = {
  Accent1: '#A65F62',
  Accent2: '#291113',
  /** Active day cell (Figma primary-3, node 1-11030) */
  primary3: '#401F21',
  primary7: '#BC8184', // notification dot, lighter accent
  Secondary1: '#141414',
  Secondary2: '#1D1D1D',
  /** Figma app background (node 1-10851) */
  screenBg: '#0D0D0D',
  /** Top-right corner shadow (Figma error-4) */
  screenShadow: '#791A1F',
  Success: '#8BBB11',
  Warning: '#E89A3C',
  Error: '#F37370',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2D2D2D',
  // Figma neutrals
  neutral5: '#434343', // Input/card border (Figma 1-11042, session form)
  neutral7: '#7D7D7D',
  neutral8: '#ACACAC',
  neutral9: '#DBDBDB',
} as const;

export type ColorToken = keyof typeof colors;
