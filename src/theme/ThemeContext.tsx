import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ThemeColors } from './themes';
import { darkTheme } from './themes';

type ThemeContextValue = {
  colors: ThemeColors;
  themeName: string;
  setTheme: (name: string, theme: ThemeColors) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkTheme,
  themeName: 'dark',
  setTheme: () => {},
});

type ThemeProviderProps = {
  initial?: ThemeColors;
  initialName?: string;
  children: React.ReactNode;
};

export function ThemeProvider({
  children,
  initial = darkTheme,
  initialName = 'dark',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeColors>(initial);
  const [themeName, setThemeName] = useState(initialName);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: theme,
      themeName,
      setTheme: (name: string, next: ThemeColors) => {
        setThemeName(name);
        setThemeState(next);
      },
    }),
    [theme, themeName],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
