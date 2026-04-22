const CATALOG_COLORS = {
  primary: "#29468B",
  success: "#2A8B4B",
  warning: "#F59E0B",
  danger: "#EF4444",
  border: "#CBD5E1",
  surface: "#F9F9FA",
  textMain: "#1E293B",
};

const CATALOG_FONTS = {
  base: "Inter, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const CATALOG_RADIUS = "4px";

export const WIDGET_CATALOG = [
  // ─────────────────────────────────────────────────────────────────
  // GAUGES (Medidores)
  // ─────────────────────────────────────────────────────────────────
  { 
    type: "temp-gauge", 
    group: "gauges", 
    label: "Temp Gauge", 
    icon: "gauge", 
    size: { w: 160, h: 160 }, 
    defaults: { 
      initialValue: 70, 
      color: CATALOG_COLORS.danger, 
      fontFamily: CATALOG_FONTS.mono 
    } 
  },
  { 
    type: "hmi-scada-gauge", 
    group: "gauges", 
    label: "SCADA Gauge", 
    icon: "gauge", 
    size: { w: 220, h: 220 }, 
    defaults: { 
      initialValue: 140, 
      primaryColor: CATALOG_COLORS.primary, 
      fontFamily: CATALOG_FONTS.mono 
    } 
  },
  { 
    type: "hmi-horizontal-gauge", 
    group: "gauges", 
    label: "Horizontal Gauge", 
    icon: "gauge", 
    size: { w: 240, h: 140 }, 
    defaults: { 
      initialValue: 4.2, 
      accentColor: CATALOG_COLORS.primary, 
      fontFamily: CATALOG_FONTS.mono 
    } 
  },

  // ─────────────────────────────────────────────────────────────────
  // BARRAS Y NIVELES
  // ─────────────────────────────────────────────────────────────────
  { 
    type: "hmi-progress-bar", 
    group: "barras", 
    label: "Progress Bar", 
    icon: "gauge", 
    size: { w: 230, h: 60 }, 
    defaults: { 
      initialValue: 66, 
      color: CATALOG_COLORS.primary 
    } 
  },
  { 
    type: "hmi-tank-level", 
    group: "barras", 
    label: "Tank Level", 
    icon: "tank", 
    size: { w: 150, h: 200 }, 
    defaults: { 
      initialValue: 50, 
      color: CATALOG_COLORS.primary, 
      bgColor: CATALOG_COLORS.surface 
    } 
  },

  // ─────────────────────────────────────────────────────────────────
  // TARJETAS
  // ─────────────────────────────────────────────────────────────────
  { 
    type: "hmi-status-card", 
    group: "tarjetas", 
    label: "Status Card", 
    icon: "status", 
    size: { w: 280, h: 90 }, 
    defaults: { 
      status: "ok", 
      okColor: CATALOG_COLORS.success, 
      warningColor: CATALOG_COLORS.warning, 
      dangerColor: CATALOG_COLORS.danger 
    } 
  },
  { 
    type: "hmi-energy-summary", 
    group: "tarjetas", 
    label: "Energy Summary", 
    icon: "card", 
    size: { w: 380, h: 140 }, 
    defaults: { 
      primaryColor: CATALOG_COLORS.primary, 
      fontFamily: CATALOG_FONTS.base 
    } 
  },
  { 
    type: "hmi-trend-card", 
    group: "tarjetas", 
    label: "Trend Card", 
    icon: "chart", 
    size: { w: 400, h: 220 }, 
    defaults: { 
      lineColor: CATALOG_COLORS.primary, 
      fontFamily: CATALOG_FONTS.mono 
    } 
  },

  // ─────────────────────────────────────────────────────────────────
  // GRÁFICAS
  // ─────────────────────────────────────────────────────────────────
  { type: "chart-basic", group: "graficas", label: "Basic Chart", icon: "chart", size: { w: 320, h: 240 }, defaults: { color: CATALOG_COLORS.primary } },
  { type: "chart-high-low", group: "graficas", label: "High Low", icon: "chart", size: { w: 320, h: 240 }, defaults: { color: CATALOG_COLORS.primary } },
  { type: "chart-stock-area", group: "graficas", label: "Stock Area", icon: "chart", size: { w: 360, h: 240 }, defaults: { color: CATALOG_COLORS.primary } },
  { type: "chart-realtime", group: "graficas", label: "Realtime", icon: "chart", size: { w: 340, h: 200 }, defaults: { color: CATALOG_COLORS.success } },
  { type: "chart-page-stats", group: "graficas", label: "Page Stats", icon: "chart", size: { w: 360, h: 240 }, defaults: { color: CATALOG_COLORS.primary } },
  { type: "chart-social-group", group: "graficas", label: "Social Group", icon: "chart", size: { w: 360, h: 360 }, defaults: {} },
  { type: "energy-bar-chart", group: "graficas", label: "Energy Bar", icon: "chart", size: { w: 100, h: 150 }, defaults: { color: CATALOG_COLORS.primary } },
  { type: "temperature-line-chart", group: "graficas", label: "Temperature Line", icon: "chart", size: { w: 400, h: 250 }, defaults: { color: CATALOG_COLORS.danger } },
  { type: "luxuries-stacked-bar", group: "graficas", label: "Stacked Bar", icon: "chart", size: { w: 600, h: 340 }, defaults: {} },

  // ─────────────────────────────────────────────────────────────────
  // MINIS
  // ─────────────────────────────────────────────────────────────────
  { type: "mini-ring", group: "minis", label: "Ring", icon: "gauge", size: { w: 120, h: 120 }, defaults: { initialValue: 65, color: CATALOG_COLORS.primary } },
  { type: "mini-needle", group: "minis", label: "Needle", icon: "gauge", size: { w: 120, h: 120 }, defaults: { initialValue: 40, color: CATALOG_COLORS.primary } },
  { type: "mini-donut", group: "minis", label: "Donut", icon: "gauge", size: { w: 120, h: 120 }, defaults: { initialValue: 75, color: CATALOG_COLORS.primary } },
  { type: "mini-horizontal", group: "minis", label: "Mini Bar", icon: "gauge", size: { w: 160, h: 60 }, defaults: { initialValue: 55, color: CATALOG_COLORS.primary } },
  { type: "mini-bubble", group: "minis", label: "Bubble", icon: "gauge", size: { w: 100, h: 100 }, defaults: { initialValue: 42, color: CATALOG_COLORS.primary } },
  { type: "mini-lamp", group: "minis", label: "Lamp", icon: "status_ok", size: { w: 80, h: 80 }, defaults: { initialValue: true, activeColor: CATALOG_COLORS.success, inactiveColor: CATALOG_COLORS.border } },
  { type: "mini-table", group: "minis", label: "Mini Table", icon: "table", size: { w: 220, h: 160 }, defaults: { fontFamily: CATALOG_FONTS.base } },

  // ─────────────────────────────────────────────────────────────────
  // PROCESO
  // ─────────────────────────────────────────────────────────────────
  { 
    type: "process-value-card", 
    group: "proceso", 
    label: "Process Value", 
    icon: "temperature", 
    size: { w: 200, h: 120 }, 
    defaults: { 
      initialValue: 75, 
      color: CATALOG_COLORS.textMain, 
      fontFamily: CATALOG_FONTS.mono 
    } 
  },
  { 
    type: "process-status-badge", 
    group: "proceso", 
    label: "Process Status", 
    icon: "motor", 
    size: { w: 160, h: 130 }, 
    defaults: { 
      initialValue: "running", 
      activeColor: CATALOG_COLORS.success 
    } 
  },
  { 
    type: "process-level-card", 
    group: "proceso", 
    label: "Process Level", 
    icon: "tank", 
    size: { w: 160, h: 200 }, 
    defaults: { 
      initialValue: 60, 
      color: CATALOG_COLORS.primary 
    } 
  },

  // ─────────────────────────────────────────────────────────────────
  // OTROS
  // ─────────────────────────────────────────────────────────────────
  { 
    type: "image-widget", 
    group: "otros", 
    label: "Imagen", 
    icon: "image", 
    size: { w: 200, h: 200 }, 
    defaults: { borderRadius: CATALOG_RADIUS } 
  },
];
