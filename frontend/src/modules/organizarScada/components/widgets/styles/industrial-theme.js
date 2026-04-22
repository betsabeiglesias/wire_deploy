export const INDUSTRIAL_THEME = {
  id: "industrial",

  colors: {
    // 🔵 Color principal (tu azul real)
    primary: "#29468b",

    // 🟢 Estados (basado en tu UI)
    success: "#2a8b4b",
    warning: "#d97706",
    danger: "#b91c1c",

    // 🧱 Fondos (calcados de tu layout)
    bgWidget: "#f9f9fa",
    bgPreview: "#efefef",

    // 🧩 Bordes
    border: "#cfd5df",
    borderHover: "#29468b",

    // 📝 Texto
    textMain: "#1e293b",
    textDim: "#64748b",

    // ➕ Extras (MUY útiles para widgets)
    grid: "#d8dce2",
    axis: "#94a3b8",
  },

  fonts: {
    base: "Inter, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  // 🔲 Bordes industriales → poco redondeo
  radius: "4px",

  // 🌫️ Sombra muy sutil (como en tu app)
  shadow: "0 1px 2px rgba(0,0,0,0.06)",

  // ⚡ Transición rápida (UI técnica)
  transition: "all 0.2s ease",
};