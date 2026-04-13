// WidgetStyleSchema.js
// Construye el mapa type → styleSchema leyendo directamente de WIDGET_REGISTRY.
// SidebarPropiedades consume esto igual que antes: widgetStyleSchema[type] || widgetStyleSchema.default

import { WIDGET_REGISTRY, DEFAULT_STYLE_SCHEMA } from "./index";

export const widgetStyleSchema = new Proxy(
  { default: DEFAULT_STYLE_SCHEMA },
  {
    get(target, type) {
      if (type in target) return target[type];
      return WIDGET_REGISTRY[type]?.styleSchema ?? DEFAULT_STYLE_SCHEMA;
    },
  }
);
