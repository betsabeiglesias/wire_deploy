import { LIGHT_THEME } from "./light-theme";
import { DARK_THEME } from "./dark-theme";

// Diccionario de temas para poder seleccionarlos por nombre si fuera necesario
export const THEMES = {
  light: LIGHT_THEME,
  dark: DARK_THEME
};

/**
 * CAMBIO DE TEMA MANUAL:
 * Solo tienes que cambiar la referencia aquí abajo.
 * Tus widgets e interfaz usan siempre "HMI_THEME", por lo que el cambio es transparente.
 */
export const HMI_THEME = THEMES.light; // <--- Cambia 'dark' por 'light' y listo.