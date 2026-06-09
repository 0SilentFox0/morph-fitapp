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

  /** Fixed white for content on colored surfaces (e.g. text on accent). */
  white: '#FFFFFF',
  /** Translucent scrim behind modals and bottom sheets. */
  overlay: 'rgba(0, 0, 0, 0.6)',
  /** Lighter scrim for less-intrusive popovers (anchored menus, dropdowns). */
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  /** Subtle white tint used for raised surfaces/cards on dark backgrounds. */
  surfaceSubtle: 'rgba(255, 255, 255, 0.05)',
} as const;

export type ColorToken = keyof typeof colors;
