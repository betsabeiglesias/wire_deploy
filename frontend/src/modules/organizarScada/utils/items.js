// C:\Users\aroa.banuelos\Desktop\wire_deploy\frontend\src\modules\organizarScada\utils\items.js

export const getButtonsLabelsItems = (theme) => [
  {
    id: "btn-primary",
    label: "Boton",
    kind: "button",
    style: {
      backgroundColor: theme.colors.primary || "#0284c7",
      color: "#ffffff",
    },
    previewClass: "text-[11px] px-3 py-1 rounded-md shadow-sm flex items-center justify-center",
  },
  {
    id: "btn-outline",
    label: "Boton",
    kind: "button",
    style: {
      border: `1px solid ${theme.colors.primary || "#0ea5e9"}`,
      color: theme.colors.primary || "#0ea5e9",
      backgroundColor: "transparent",
    },
    previewClass: "text-[11px] px-3 py-1 rounded-md flex items-center justify-center border",
  },
  {
    id: "label-pill",
    label: "Label pill",
    kind: "label",
    style: {
      backgroundColor: theme.colors.successLight || "#ecfdf5",
      color: theme.colors.success || "#047857",
      borderColor: theme.colors.successBorder || "#d1fae5",
    },
    previewClass: "inline-flex items-center rounded-full text-[11px] px-3 py-0.5 border",
  },
  {
    id: "label-badge",
    label: "Label badge",
    kind: "label",
    style: {
      backgroundColor: theme.colors.text || "#1e293b",
      color: theme.colors.bgWidget || "#f8fafc",
    },
    previewClass: "inline-flex items-center rounded text-[10px] px-2 py-0.5 uppercase tracking-wide",
  },
  {
    id: "card-soft",
    kind: "card",
    style: {
      backgroundColor: theme.colors.bgWidget || "#f8fafc",
      borderColor: theme.colors.border || "#e2e8f0",
    },
    previewClass: "rounded-lg border text-[11px] px-3 py-2 shadow-sm",
  },
  {
    id: "card-elevated",
    kind: "card",
    style: {
      backgroundColor: theme.colors.bgWidget || "#ffffff",
      borderColor: theme.colors.border || "#e2e8f0",
    },
    previewClass: "rounded-lg border text-[11px] px-3 py-2 shadow-md",
  },
  {
    id: "shape-rect",
    label: "Recuadro",
    kind: "shape",
    style: {
      borderColor: theme.colors.border || "#94a3b8",
      backgroundColor: theme.colors.bgPreview || "#f1f5f9",
    },
    previewClass: "w-full h-10 rounded-md border-2",
  },
  {
    id: "shape-circle",
    label: "Circulo",
    kind: "shape",
    style: {
      borderColor: theme.colors.border || "#94a3b8",
      backgroundColor: theme.colors.bgPreview || "#f1f5f9",
    },
    previewClass: "w-10 h-10 rounded-full border-2 mx-auto",
  },
  {
    id: "shape-triangle",
    label: "Triangulo",
    kind: "shape",
    style: {
      borderBottomColor: theme.colors.border || "#cbd5e1",
    },
    previewClass: "w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[32px] mx-auto",
  },
];