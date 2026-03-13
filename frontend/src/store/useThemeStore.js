import { create } from "zustand";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("app-theme") || "dark";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem("app-theme", theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("app-theme", nextTheme);
      return { theme: nextTheme };
    }),
}));
