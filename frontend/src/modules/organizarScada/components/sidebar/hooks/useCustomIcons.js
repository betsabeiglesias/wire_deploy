// hooks/useCustomIcons.js
//
// Gestiona la librería de iconos personalizados (localStorage).
// Extraído de UnifiedSidebar sin cambios funcionales.
//
import { useEffect, useRef, useState } from "react";

const CUSTOM_ICONS_STORAGE_KEY = "organizarScada.customIcons.library";
const MAX_IMAGE_DIMENSION = 1200;
const MAX_IMAGE_BYTES = 500 * 1024;

// ─── Helpers internos ──────────────────────────────────────────────────────────

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadImageFromUrl = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const estimateDataUrlSize = (dataUrl = "") => {
  const payload = dataUrl.split(",")[1] || "";
  return Math.ceil((payload.length * 3) / 4);
};

const optimizeRasterToBase64 = async (file) => {
  const inputDataUrl = await readFileAsDataURL(file);
  const image = await loadImageFromUrl(inputDataUrl);
  const largestSide = Math.max(image.width, image.height);
  const scale =
    largestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / largestSide : 1;
  const targetWidth  = Math.max(1, Math.round(image.width  * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width  = targetWidth;
  canvas.height = targetHeight;
  canvas.getContext("2d").drawImage(image, 0, 0, targetWidth, targetHeight);

  const isPng = file.type === "image/png";
  const mimeType = isPng ? "image/png" : "image/jpeg";
  let quality = 0.9;
  let output  = canvas.toDataURL(mimeType, quality);

  while (!isPng && estimateDataUrlSize(output) > MAX_IMAGE_BYTES && quality > 0.45) {
    quality -= 0.1;
    output = canvas.toDataURL(mimeType, quality);
  }

  return { base64: output, width: targetWidth, height: targetHeight };
};

const optimizeAndEncodeAsset = async (file) => {
  if (file.type === "image/svg+xml") {
    return { base64: await readFileAsDataURL(file), width: 240, height: 180 };
  }
  return optimizeRasterToBase64(file);
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export default function useCustomIcons() {
  const [customIcons, setCustomIcons]               = useState([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const uploadInputRef = useRef(null);

  // Carga inicial desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_ICONS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setCustomIcons(parsed);
    } catch {
      setCustomIcons([]);
    }
  }, []);

  const persistCustomIcons = (next) => {
    setCustomIcons(next);
    try {
      localStorage.setItem(CUSTOM_ICONS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  };

  /** Convierte un icono de la librería en un template arrastra-y-suelta. */
  const iconToTemplate = (icon) => ({
    id: `tpl-custom-${icon.id}`,
    data: {
      type: "image-widget",
      label: icon.name,
      width:  Math.min(Number(icon.width)  || 220, 320),
      height: Math.min(Number(icon.height) || 180, 260),
      settings: {
        imageBase64:     icon.base64,
        opacity:         100,
        lockAspectRatio: true,
        layer_alias:     icon.name,
      },
    },
  });

  const handleDeleteCustomIcon = (id) =>
    persistCustomIcons(customIcons.filter((i) => i.id !== id));

  const handleUploadCustomIcon = async (event) => {
    const file = event?.target?.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      window.alert("Formato no soportado. Usa PNG, JPG o SVG.");
      return;
    }
    setIsProcessingUpload(true);
    try {
      const processed = await optimizeAndEncodeAsset(file);
      const item = {
        id:        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name:      (file.name || "icono").replace(/\.[^.]+$/, ""),
        base64:    processed.base64,
        width:     processed.width,
        height:    processed.height,
        createdAt: new Date().toISOString(),
      };
      persistCustomIcons([item, ...customIcons].slice(0, 80));
    } catch (err) {
      console.error("No se pudo procesar el icono personalizado", err);
      window.alert("No se pudo procesar la imagen.");
    } finally {
      setIsProcessingUpload(false);
    }
  };

  return {
    customIcons,
    isProcessingUpload,
    uploadInputRef,
    iconToTemplate,
    handleDeleteCustomIcon,
    handleUploadCustomIcon,
  };
}
