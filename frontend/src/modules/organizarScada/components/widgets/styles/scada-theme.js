export const SCADA_THEME = {
  id: "scada",

  colors: {
    // Acentos basados en el video (Azules corporativos y verdes de estado)
    primary: "#2563eb",       // Azul vibrante para botones principales y selección
    primaryHover: "#1d4ed8",
    success: "#10b981",       // Verde esmeralda para KPIs positivos
    warning: "#f59e0b",
    danger: "#ef4444",

    // Fondos (La clave de esta estética)
    bgPreview: "#f8fafc",     // Fondo general del dashboard (Gris azulado muy claro)
    bgWidget: "#ffffff",      // Fondo de las cards/widgets (Blanco puro para resaltar)
    bgSidebar: "#8092bd",     // El azul oscuro profundo que se ve en el Rail/Header

    // Bordes y Divisiones
    border: "#e2e8f0",        // Gris suave para separar secciones sin ensuciar
    borderHover: "#cbd5e1",

    // Tipografía
    textMain: "#1e293b",      // Slate oscuro para lectura principal
    textDim: "#64748b",       // Slate medio para etiquetas y secundarios
    textInverted: "#ffffff",  // Para textos sobre fondos oscuros (Sidebar)
  },

  fonts: {
    base: "'Inter', system-ui, sans-serif", // Fuente limpia y profesional
    mono: "'JetBrains Mono', monospace",
  },

  radius: "10px",             // Bordes más redondeados que el industrial para un look más "SaaS"

  // Sombra suave y difusa, muy sutil
  shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",

  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
};