import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useHmiTheme } from './widgets/styles/ThemeProvider';

const ThemeToggle = () => {
  const { themeMode, toggleTheme, theme } = useHmiTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 shadow-sm"
      style={{ 
        backgroundColor: theme.colors.bgWidget, 
        borderColor: theme.colors.border,
        color: theme.colors.textMain 
      }}
    >
      {themeMode === 'light' ? (
        <><Moon size={14} className="text-slate-500" /> <span className="text-xs font-bold">Modo Oscuro</span></>
      ) : (
        <><Sun size={14} className="text-yellow-400" /> <span className="text-xs font-bold">Modo Claro</span></>
      )}
    </button>
  );
};

export default ThemeToggle;