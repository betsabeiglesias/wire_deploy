import React, { createContext, useContext, useState, useMemo } from 'react';
import { THEMES } from './theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState('light');

  const theme = useMemo(() => THEMES[themeId], [themeId]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId, allThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useHmiTheme = () => useContext(ThemeContext);