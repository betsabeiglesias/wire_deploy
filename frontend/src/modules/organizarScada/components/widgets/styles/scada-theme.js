export const SCADA_THEME = {
  id: "scada",

  colors: {
    // Azul corporativo (usado en header y elementos activos)
    primary: "#2f4f7f",
    primaryHover: "#263f66",

    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",

    // Fondos
    bgPreview: "#f3f4f6",     // fondo general gris claro neutro
    bgWidget: "#ffffff",

    // 🔥 CLAVE: Sidebar claro (NO azul)
    bgSidebar: "#f1f5f9",     // gris muy claro como en tu imagen 1

    // 🔥 NUEVO: Header separado del sidebar
    bgHeader: "#2f4f7f",      // azul oscuro superior (la barra horizontal)

    // Bordes
    border: "#e5e7eb",
    borderHover: "#d1d5db",

    // Texto
    textMain: "#1f2937",
    textDim: "#6b7280",

    // 🔥 Sidebar icons/text (azul oscuro sobre fondo claro)
    textSidebar: "#2f4f7f",

    // 🔥 Header text (blanco sobre azul)
    textHeader: "#ffffff",

    // Mantienes este para compatibilidad
    textInverted: "#ffffff",
  },

  fonts: {
    base: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  // En el video no son tan redondeados
  radius: "6px",

  shadow: "0 1px 2px rgba(0,0,0,0.06)",

  transition: "all 0.2s ease",
};