// hooks/useLayers.js
//
// Deriva la lista de capas (layers) del canvas y gestiona
// rename + drag-and-drop reorder.
// Extraído de UnifiedSidebar sin cambios funcionales.
//
import { useMemo, useState } from "react";

export default function useLayers({
  canvasElements = [],
  onRenameElementLayer,
  onReorderLayers,
}) {
  const [editingLayerId,   setEditingLayerId]   = useState(null);
  const [editingLayerName, setEditingLayerName] = useState("");
  const [draggingLayerId,  setDraggingLayerId]  = useState(null);

  const layers = useMemo(() => {
    return [...canvasElements]
      .map((el, idx) => {
        const s = el?.data?.settings || {};
        const zIndex = Number.isFinite(Number(s.z_index)) ? Number(s.z_index) : idx + 1;
        return {
          id:          el.id,
          zIndex,
          isVisible:   s.is_visible !== false,
          isLocked:    s.is_locked  === true,
          displayName: s.layer_alias || s.attributeLabel || el?.data?.name || el?.data?.label || el?.data?.type || `Elemento ${idx + 1}`,
          fallbackName: el?.data?.type || "widget",
          idx,
        };
      })
      .sort((a, b) => b.zIndex - a.zIndex || b.idx - a.idx);
  }, [canvasElements]);

  // ── Rename ────────────────────────────────────────────────────────────────
  const startLayerRename = (layer) => {
    setEditingLayerId(layer.id);
    setEditingLayerName(layer.displayName);
  };

  const commitLayerRename = (layerId) => {
    const next = String(editingLayerName || "").trim();
    if (next) onRenameElementLayer?.(layerId, next);
    setEditingLayerId(null);
    setEditingLayerName("");
  };

  const cancelLayerRename = () => {
    setEditingLayerId(null);
    setEditingLayerName("");
  };

  // ── Drag & Drop reorder ───────────────────────────────────────────────────
  const handleLayerDragStart = (e, layerId) => {
    setDraggingLayerId(layerId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(layerId));
  };

  const handleLayerDrop = (targetLayerId) => {
    if (!draggingLayerId || draggingLayerId === targetLayerId) {
      setDraggingLayerId(null);
      return;
    }
    const orderedIds = layers.map((l) => l.id);
    const si = orderedIds.findIndex((id) => id === draggingLayerId);
    const ti = orderedIds.findIndex((id) => id === targetLayerId);
    if (si < 0 || ti < 0) {
      setDraggingLayerId(null);
      return;
    }
    const next = [...orderedIds];
    const [moved] = next.splice(si, 1);
    next.splice(ti, 0, moved);
    onReorderLayers?.(next);
    setDraggingLayerId(null);
  };

  return {
    layers,
    editingLayerId,
    editingLayerName,
    setEditingLayerName,
    draggingLayerId,
    startLayerRename,
    commitLayerRename,
    cancelLayerRename,
    handleLayerDragStart,
    handleLayerDrop,
  };
}
