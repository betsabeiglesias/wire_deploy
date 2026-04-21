import { LIGHT_THEME } from "./light-theme";
import { DARK_THEME } from "./dark-theme";
import { CYBER_THEME } from "./cyber-theme";
import { FOREST_THEME } from "./forest-theme";

export const THEMES = {
  light: { ...LIGHT_THEME, label: "Luminoso" },
  dark: { ...DARK_THEME, label: "Industrial" },
  cyber: { ...CYBER_THEME, label: "Cyberpunk" },
  forest: { ...FOREST_THEME, label: "Ecológico" }
};
export const HMI_THEME = THEMES.light;

export const DEFAULT_THEME = THEMES.light;