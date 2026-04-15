import ImageWidget from "../standard/ImageWidget";

export default {
  type:        "image-widget",
  label:       "Imagen personalizada",
  category:    "elementos",
  icon:        "layer",
  defaultSize: { w: 220, h: 180 },

  buildProps({ settings, width, height }) {
    return {
      src:     settings.imageBase64 || null,
      opacity: settings.opacity ?? 100,
      width,
      height,
    };
  },

  styleSchema: [],

  resolveStyle() {
    return {};
  },

  component: ImageWidget,
};
