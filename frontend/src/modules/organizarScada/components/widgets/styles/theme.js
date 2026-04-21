// src/modules/organizarScada/components/widgets/styles/theme.js

export const HMI_THEME = {
  // Configuración de colores globales
  colors: {
    primary: "#0ea5e9",      // Azul profesional (Sky-500)
    success: "#10b981",      // Verde (Emerald-500)
    warning: "#f59e0b",      // Ámbar (Amber-500)
    danger: "#f43f5e",       // Rojo técnico (Rose-500)
    
    // Superficies y bordes
    bgWidget: "#ffffff",     // Fondo de los widgets
    bgPreview: "#f8fafc",    // Fondo sutil para las previsualizaciones laterales
    border: "#e2e8f0",       // Bordes sutiles
    borderHover: "#0ea5e9",  // Borde al seleccionar o pasar el ratón
    
    // Tipografía
    textMain: "#1e293b",     // Slate-800
    textDim: "#64748b",      // Slate-500
  },
  
  // Fuentes técnicas
  fonts: {
    base: "Inter, sans-serif",
    mono: "'JetBrains Mono', 'Roboto Mono', monospace",
  },

  // Decoración unificada
  radius: "12px",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
};