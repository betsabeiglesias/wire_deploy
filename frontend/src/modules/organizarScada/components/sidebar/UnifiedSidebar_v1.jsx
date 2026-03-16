// src/modules/organizarScada/components/sidebar/UnifiedSidebar.jsx
//
// Sidebar del designer SCADA.
// - Sin useRealtime / allTags: eliminado el árbol ISA-95 en tiempo real.
// - Sección "Dispositivos" abre DeviceManagerModal (tags desde API REST).
// - El resto de secciones sin cambios respecto al original.
//
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Lock, Unlock } from "lucide-react";
import { elementos_scada } from "@/modules/organizarScada/templates/elementos_scada";
import { buttons_labels_items } from "@/modules/organizarScada/utils/items";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import ProjectVariableModal from "../devices/ProjectVariableModal";
import api from "../../../../services/api";

// ─── Image helpers ─────────────────────────────────────────────────────────────
const CUSTOM_ICONS_STORAGE_KEY = "organizarScada.customIcons.library";
const MAX_IMAGE_DIMENSION = 1200;
const MAX_IMAGE_BYTES = 500 * 1024;

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
// ──────────────────────────────────────────────────────────────────────────────

const UnifiedSidebar = ({
  layoutId = null,
  projectName = "",
  onProjectNameChange,
  onSaveProject,        // () => Promise<void> — guarda el proyecto sin validar canvas
  views = [],
  selectedViewId,
  onCreateView,
  onSelectView,
  onRenameView,
  onDeleteView,
  addComponentToCanvas,
  canvasElements = [],
  selectedElementId = null,
  onSelectElement,
  onToggleElementVisibility,
  onToggleElementLock,
  onRenameElementLayer,
  onReorderLayers,
  viewsLoading = false,
  viewsError = "",
  onRefreshViews,
}) => {
  const [isMainOpen,           setIsMainOpen]           = useState(true);
  const [activeSection,        setActiveSection]        = useState("pantallas");
  const [showDevices,          setShowDevices]          = useState(false);
  const [isSavingProject,      setIsSavingProject]      = useState(false);
  // ── Variables tree ────────────────────────────────────────────────────────
  const [variables,            setVariables]            = useState([]);
  const [varsLoading,          setVarsLoading]          = useState(false);
  const [expandedTables,       setExpandedTables]       = useState({});  // { tableName: bool }

  const fetchVariables = useCallback(async () => {
    if (!layoutId) return;
    setVarsLoading(true);
    try {
      const res = await api.get(`/api/scada-manager/layouts/${layoutId}/variables/`);
      setVariables(res.data || []);
    } catch {
      setVariables([]);
    } finally {
      setVarsLoading(false);
    }
  }, [layoutId]);

  useEffect(() => {
    if (layoutId) fetchVariables();
    else setVariables([]);
  }, [layoutId, fetchVariables]);

  // Group variables by source for tree display
  // tree: { "Conexión": [...vars], "Local": [...vars] }
  const variableTree = useMemo(() => {
    const conn  = variables.filter(v => v.source === "connection");
    const local = variables.filter(v => v.source === "local");
    return { conn, local };
  }, [variables]);

  const toggleTable = (key) =>
    setExpandedTables(prev => ({ ...prev, [key]: !prev[key] }));
  const [customIcons,          setCustomIcons]          = useState([]);
  const [isProcessingUpload,   setIsProcessingUpload]   = useState(false);
  const [editingViewId,        setEditingViewId]        = useState(null);
  const [editingName,          setEditingName]          = useState("");
  const [editingLayerId,       setEditingLayerId]       = useState(null);
  const [editingLayerName,     setEditingLayerName]     = useState("");
  const [draggingLayerId,      setDraggingLayerId]      = useState(null);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [projectNameDraft,     setProjectNameDraft]     = useState(projectName || "");
  const uploadInputRef = useRef(null);

  const sidebarSections = [
    {
      id: "main",
      items: [
        { id: "pantallas",    label: "Pantallas"             },
        { id: "devices",      label: "Dispositivos"          },
        { id: "elements",     label: "Iconos hmi"            },
        { id: "buttons",      label: "Iconos basicos"        },
        { id: "custom-icons", label: "Iconos personalizados" },
      ],
    },
  ];

  const handleSectionClick = (id) => {
    setActiveSection((prev) => (prev === id ? null : id));
    // Refrescar variables al abrir la sección de dispositivos
    if (id === "devices" && layoutId) fetchVariables();
  };

  // ── Project name ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEditingProjectName) setProjectNameDraft(projectName || "");
  }, [projectName, isEditingProjectName]);

  const commitProjectName = () => {
    onProjectNameChange?.(projectNameDraft.trim() || "Sin nombre");
    setIsEditingProjectName(false);
  };
  const cancelProjectName = () => {
    setProjectNameDraft(projectName || "");
    setIsEditingProjectName(false);
  };

  // ── Custom icons ──────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_ICONS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setCustomIcons(parsed);
    } catch { setCustomIcons([]); }
  }, []);

  const persistCustomIcons = (next) => {
    setCustomIcons(next);
    try { localStorage.setItem(CUSTOM_ICONS_STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

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

  const handlePickCustomIcon   = (icon) => addComponentToCanvas?.(iconToTemplate(icon).data);
  const handleDeleteCustomIcon = (id)   => persistCustomIcons(customIcons.filter((i) => i.id !== id));

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

  // ── Templates ─────────────────────────────────────────────────────────────────
  const handleTemplateDragStart = (e, tpl) => {
    e.dataTransfer.setData("application/x-scada-template", JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = "copy";
  };

  const renderTemplatePreview = (tpl) =>
    renderWidget({
      data: tpl.data,
      live: { value: undefined, unit: tpl.data?.settings?.unit },
      width: 120, height: 90, theme: "theme-clean", valueHistory: [],
    });

  const handlePickTemplate = (tpl) => addComponentToCanvas?.(tpl.data);

  // ── Buttons / labels ──────────────────────────────────────────────────────────
  const getButtonBaseData = (item) => {
    if (item.kind === "button") return { type: "nav-button", variant: item.id, label: item.label, targetViewId: null, width: 160, height: 48 };
    if (item.kind === "label")  return { type: item.id, label: item.label, width: 160, height: 40 };
    return { type: item.id, label: item.label, width: 200, height: 120 };
  };
  const handleButtonDragStart = (e, item) =>
    handleTemplateDragStart(e, { id: `tpl-${item.id}`, data: getButtonBaseData(item) });
  const handlePickButton = (item) => addComponentToCanvas?.(getButtonBaseData(item));

  // ── Layers ────────────────────────────────────────────────────────────────────
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

  const commitLayerRename = (layerId) => {
    const next = String(editingLayerName || "").trim();
    if (next) onRenameElementLayer?.(layerId, next);
    setEditingLayerId(null);
    setEditingLayerName("");
  };
  const cancelLayerRename = () => { setEditingLayerId(null); setEditingLayerName(""); };

  const handleLayerDragStart = (e, layerId) => {
    setDraggingLayerId(layerId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(layerId));
  };
  const handleLayerDrop = (targetLayerId) => {
    if (!draggingLayerId || draggingLayerId === targetLayerId) { setDraggingLayerId(null); return; }
    const orderedIds = layers.map((l) => l.id);
    const si = orderedIds.findIndex((id) => id === draggingLayerId);
    const ti = orderedIds.findIndex((id) => id === targetLayerId);
    if (si < 0 || ti < 0) { setDraggingLayerId(null); return; }
    const next = [...orderedIds];
    const [moved] = next.splice(si, 1);
    next.splice(ti, 0, moved);
    onReorderLayers?.(next);
    setDraggingLayerId(null);
  };

  // ── Views ─────────────────────────────────────────────────────────────────────
  const startInlineRename  = (view) => { setEditingViewId(view.id); setEditingName(view.name); };
  const commitInlineRename = (viewId) => {
    if (editingName?.trim()) onRenameView?.(viewId, editingName.trim());
    setEditingViewId(null);
    setEditingName("");
  };
  const cancelInlineRename = () => { setEditingViewId(null); setEditingName(""); };

  // ── Section content ───────────────────────────────────────────────────────────
  const renderSectionContent = (sectionId) => {

    // ── Pantallas + Capas ──────────────────────────────────────────────────────
    if (sectionId === "pantallas") {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-[11px] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Pantallas</h3>
            <button
              onClick={onCreateView}
              className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
            >
              + Nueva pantalla
            </button>
          </div>

          {viewsError && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] text-amber-700">
              {viewsError}
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {viewsLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-md border border-slate-200 bg-white px-3 py-3">
                    <div className="flex items-center gap-2">
                      <SkeletonBlock width="w-32" height="h-3.5" />
                      <SkeletonBlock width="w-4" height="h-4" rounded="rounded-full" />
                    </div>
                    <div className="mt-2"><SkeletonBlock width="w-16" height="h-2.5" /></div>
                  </div>
                ))}
              </div>
            )}

            {!viewsLoading && views.length === 0 && (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-700">Aún no tienes vistas.</p>
                <p className="mt-1 text-slate-500">Crea tu primera vista o importa un JSON existente.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={onCreateView}
                    className="rounded border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:border-sky-400"
                  >
                    + Crear vista
                  </button>
                  <button
                    onClick={onRefreshViews}
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400"
                  >
                    Reintentar carga
                  </button>
                </div>
              </div>
            )}

            {!viewsLoading && views.map(view => {
              const isSelected = view.id === selectedViewId;
              return (
                <div
                  key={view.id}
                  className={[
                    "flex items-center justify-between rounded-md border px-3 py-2 transition",
                    isSelected ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-2 w-full">
                    <button onClick={() => onSelectView(view.id)} className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        {editingViewId === view.id ? (
                          <input
                            autoFocus
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onBlur={() => commitInlineRename(view.id)}
                            onKeyDown={e => {
                              if (e.key === "Enter")  commitInlineRename(view.id);
                              if (e.key === "Escape") cancelInlineRename();
                            }}
                            className="w-full rounded border border-sky-300 px-2 py-1 text-[12px] text-slate-800 focus:outline-none"
                          />
                        ) : (
                          <span className={isSelected ? "text-sky-800 font-semibold" : "text-slate-700"}>
                            {view.name}
                          </span>
                        )}
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {view.elements?.length || 0} elementos
                      </div>
                    </button>
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => startInlineRename(view)}
                        className="p-1 text-slate-400 hover:text-sky-600"
                        title="Renombrar"
                      >✏️</button>
                      <button
                        onClick={() => { if (confirm(`¿Eliminar vista "${view.name}"?`)) onDeleteView(view.id); }}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Eliminar"
                      >🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Capas */}
          <div className="border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Capas</h4>
              <span className="text-[10px] text-slate-400">{layers.length} elementos</span>
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-1">
              {layers.length === 0 && (
                <div className="rounded bg-white px-2 py-2 text-[10px] text-slate-500">
                  No hay elementos en el canvas.
                </div>
              )}
              {layers.map((layer) => {
                const isSelected = selectedElementId === layer.id;
                const isEditing  = editingLayerId    === layer.id;
                return (
                  <div
                    key={layer.id}
                    draggable
                    onDragStart={e => handleLayerDragStart(e, layer.id)}
                    onDragOver={e  => e.preventDefault()}
                    onDrop={() => handleLayerDrop(layer.id)}
                    onClick={() => onSelectElement?.(layer.id)}
                    className={[
                      "group flex items-center gap-1 rounded border px-1.5 py-1 text-[11px] transition cursor-pointer",
                      isSelected      ? "border-sky-400 bg-sky-50 text-sky-900" : "border-transparent bg-white text-slate-700 hover:border-slate-300",
                      draggingLayerId === layer.id ? "opacity-60" : "",
                    ].join(" ")}
                    title={`${layer.fallbackName} • z:${layer.zIndex}`}
                  >
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                      onClick={e => { e.stopPropagation(); onToggleElementVisibility?.(layer.id); }}
                    >
                      {layer.isVisible ? <Eye size={12} /> : <EyeOff size={12} className="text-slate-400" />}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                      onClick={e => { e.stopPropagation(); onToggleElementLock?.(layer.id); }}
                    >
                      {layer.isLocked ? <Lock size={12} /> : <Unlock size={12} className="text-slate-400" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingLayerName}
                          onChange={e => setEditingLayerName(e.target.value)}
                          onBlur={() => commitLayerRename(layer.id)}
                          onKeyDown={e => {
                            if (e.key === "Enter")  commitLayerRename(layer.id);
                            if (e.key === "Escape") cancelLayerRename();
                          }}
                          className="w-full rounded border border-sky-300 px-1 py-0.5 text-[11px] focus:outline-none"
                        />
                      ) : (
                        <p
                          className={[
                            "truncate",
                            !layer.isVisible ? "text-slate-400 line-through" : "",
                            layer.isLocked   ? "text-amber-700" : "",
                          ].join(" ")}
                          onDoubleClick={e => {
                            e.stopPropagation();
                            setEditingLayerId(layer.id);
                            setEditingLayerName(layer.displayName);
                          }}
                        >
                          {layer.displayName}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">z:{layer.zIndex}</span>
                    <span className="text-slate-300 group-hover:text-slate-500">
                      <GripVertical size={12} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // ── Dispositivos ────────────────────────────────────────────────────────────
    if (sectionId === "devices") {
      // Sin proyecto guardado: formulario de nombre
      if (!layoutId) {
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-[11px] space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Variables</h3>
            <p className="text-[10px] text-slate-500">
              Para gestionar variables el proyecto necesita un nombre y estar guardado.
            </p>
            <div className="space-y-2">
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-[12px] focus:border-sky-400 focus:outline-none"
                placeholder="Nombre del proyecto…"
                value={projectNameDraft}
                onChange={(e) => setProjectNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitProjectName(); }}
              />
              <button
                type="button"
                disabled={!projectNameDraft.trim() || isSavingProject}
                onClick={async () => {
                  const name = projectNameDraft.trim();
                  if (!name) return;
                  onProjectNameChange?.(name);
                  setIsSavingProject(true);
                  try {
                    await onSaveProject?.(name);
                  } finally {
                    setIsSavingProject(false);
                  }
                }}
                className="w-full rounded border border-sky-400 bg-sky-50 px-2 py-1.5 text-[12px] font-medium text-sky-700 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSavingProject ? "Guardando…" : "Guardar y continuar"}
              </button>
            </div>
          </div>
        );
      }

      // Con proyecto guardado: árbol + botón gestor
      const { conn, local } = variableTree;
      const totalVars = variables.length;

      const TreeSection = ({ label, items, treeKey, emptyText }) => {
        const isOpen = expandedTables[treeKey] ?? true;
        return (
          <div>
            <button
              type="button"
              onClick={() => toggleTable(treeKey)}
              className="flex w-full items-center gap-1 rounded px-1 py-1 hover:bg-slate-100 text-left"
            >
              {isOpen
                ? <ChevronDown size={11} className="shrink-0 text-slate-400" />
                : <ChevronRight size={11} className="shrink-0 text-slate-400" />}
              <span className="flex-1 text-[11px] font-semibold text-slate-700 truncate">
                {label}
              </span>
              <span className="shrink-0 text-[10px] text-slate-400">{items.length}</span>
            </button>

            {isOpen && (
              <div className="ml-3 border-l border-slate-200 pl-2 space-y-0.5 pb-1">
                {items.length === 0 ? (
                  <p className="text-[10px] text-slate-400 py-1">{emptyText}</p>
                ) : (
                  items.map(v => (
                    <div key={v.id}
                      className="flex items-center justify-between gap-1 rounded px-1 py-0.5 hover:bg-slate-50"
                      title={v.source === "connection"
                        ? `${v.equipment} › ${v.variable}`
                        : `Local · ${v.datatype}${v.initial_value != null ? ` = ${v.initial_value}` : ""}`}
                    >
                      <span className="truncate text-[11px] text-slate-700">{v.name}</span>
                      <div className="flex shrink-0 items-center gap-1">
                        {v.source === "connection" && v.equipment && (
                          <span className="text-[9px] text-slate-400 truncate max-w-[60px]">
                            {v.equipment}
                          </span>
                        )}
                        <span className="rounded bg-slate-100 px-1 text-[9px] text-slate-500">
                          {v.datatype || "—"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      };

      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-[11px] space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Variables
              {totalVars > 0 && (
                <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                  ({totalVars})
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowDevices(true)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
            >
              Gestionar
            </button>
          </div>

          {/* Árbol */}
          {varsLoading ? (
            <div className="space-y-1 pt-1">
              {[1, 2, 3].map(i => <SkeletonBlock key={i} width="w-full" height="h-4" />)}
            </div>
          ) : totalVars === 0 ? (
            <p className="text-[10px] text-slate-400">
              Sin variables. Usa "Gestionar" para añadirlas.
            </p>
          ) : (
            <div className="space-y-0.5 max-h-72 overflow-y-auto">
              <TreeSection
                label="Conexión"
                items={conn}
                treeKey="conn"
                emptyText="Sin variables de conexión."
              />
              <TreeSection
                label="Local"
                items={local}
                treeKey="local"
                emptyText="Sin variables locales."
              />
            </div>
          )}
        </div>
      );
    }

    // ── Iconos HMI ──────────────────────────────────────────────────────────────
    if (sectionId === "elements") {
      const scadaGroups = [
        { id: "gauges",   label: "Gauges",   items: elementos_scada.gauges   || [] },
        { id: "barras",   label: "Barras",   items: elementos_scada.barras   || [] },
        { id: "tarjetas", label: "Tarjetas", items: elementos_scada.tarjetas || [] },
        { id: "graficas", label: "Gráficas", items: elementos_scada.graficas || [] },
        { id: "minis",    label: "Mini",     items: elementos_scada.minis    || [] },
      ];
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
            Plantillas SCADA
          </p>
          <div className="space-y-3">
            {scadaGroups.map(group =>
              group.items.length ? (
                <div key={group.id}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {group.items.map(tpl => (
                      <div
                        key={tpl.id}
                        draggable
                        onDragStart={e => handleTemplateDragStart(e, tpl)}
                        onClick={() => handlePickTemplate(tpl)}
                        className="cursor-grab select-none rounded-lg border border-slate-200 bg-white shadow-sm hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
                        title="Arrastra al canvas"
                      >
                        <div className="h-20 w-full overflow-hidden flex items-center justify-center">
                          <div className="pointer-events-none scale-[0.85] origin-center">
                            {renderTemplatePreview(tpl)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      );
    }

    // ── Iconos básicos ──────────────────────────────────────────────────────────
    if (sectionId === "buttons") {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
            Buttons & Labels
          </p>
          <div className="grid grid-cols-2 gap-3">
            {buttons_labels_items.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleButtonDragStart(e, item)}
                onClick={() => handlePickButton(item)}
                className="cursor-grab select-none rounded-md border border-slate-200 bg-white px-2 py-2 text-[10px] text-slate-700 hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
              >
                <div className={item.previewClass}>
                  {item.kind === "button" ? "Button" : item.kind === "label" ? "Label" : "Caja"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── Iconos personalizados ───────────────────────────────────────────────────
    if (sectionId === "custom-icons") {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Libreria de imagenes
            </p>
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={isProcessingUpload}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50 disabled:opacity-50"
            >
              {isProcessingUpload ? "Procesando..." : "Subir icono"}
            </button>
            <input
              ref={uploadInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={handleUploadCustomIcon}
            />
          </div>

          <p className="text-[10px] text-slate-500">
            PNG, JPG o SVG. Se optimiza en cliente y se guarda como Base64.
          </p>

          {customIcons.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-2 py-3 text-[11px] text-slate-500">
              No hay iconos personalizados todavia.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {customIcons.map((icon) => {
                const tpl = iconToTemplate(icon);
                return (
                  <div
                    key={icon.id}
                    draggable
                    onDragStart={e => handleTemplateDragStart(e, tpl)}
                    onClick={() => handlePickCustomIcon(icon)}
                    className="group relative cursor-grab rounded-md border border-slate-200 bg-white p-1.5 shadow-sm hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
                    title={icon.name}
                  >
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleDeleteCustomIcon(icon.id); }}
                      className="absolute right-1 top-1 z-10 hidden h-5 w-5 items-center justify-center rounded bg-white/90 text-[11px] text-rose-600 shadow group-hover:inline-flex"
                      title="Eliminar icono"
                    >×</button>
                    <div className="flex h-20 items-center justify-center overflow-hidden rounded border border-slate-100 bg-slate-50">
                      <img
                        src={icon.base64}
                        alt={icon.name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-1 truncate text-[10px] text-slate-600">{icon.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ── Shell ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex h-full bg-slate-100 text-slate-800 text-[13px]">
        <aside
          className={`flex flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-200 ${
            isMainOpen ? "w-64" : "w-12"
          }`}
        >
          <div className="flex items-center justify-between h-10 px-2 border-b border-slate-200 bg-slate-50">
            {isMainOpen && (
              <span className="ml-2 text-xs font-semibold tracking-wide text-slate-700">
                Componentes
              </span>
            )}
          </div>

          {isMainOpen && (
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {/* Nombre proyecto */}
              <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Proyecto
                </p>
                {isEditingProjectName ? (
                  <input
                    autoFocus
                    value={projectNameDraft}
                    onChange={e => setProjectNameDraft(e.target.value)}
                    onBlur={commitProjectName}
                    onKeyDown={e => {
                      if (e.key === "Enter")  commitProjectName();
                      if (e.key === "Escape") cancelProjectName();
                    }}
                    className="mt-1 w-full rounded border border-sky-300 px-2 py-1 text-[12px] font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingProjectName(true)}
                    className="mt-1 block w-full truncate rounded px-1 py-0.5 text-left text-[12px] font-semibold text-slate-800 hover:bg-slate-100"
                    title="Editar nombre del proyecto"
                  >
                    {projectName || "Sin nombre"}
                  </button>
                )}
              </div>

              {/* Secciones */}
              {sidebarSections.map(section => (
                <div key={section.id}>
                  <ul className="space-y-1">
                    {section.items.map(item => {
                      const isActive = activeSection === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleSectionClick(item.id)}
                            className={[
                              "flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-colors",
                              isActive
                                ? "bg-sky-100 text-sky-800 border border-sky-300"
                                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
                            ].join(" ")}
                          >
                            <span className="truncate">{item.label}</span>
                            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          </button>
                          {isActive && (
                            <div className="mt-2">
                              <div className="max-h-130 overflow-y-auto custom-scroll px-2">
                                {renderSectionContent(item.id)}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {showDevices && (
        <ProjectVariableModal
          open={showDevices}
          onClose={() => {
            setShowDevices(false);
            fetchVariables();   // refresca el árbol del sidebar
          }}
          layoutId={layoutId}
        />
      )}
    </>
  );
};

export default UnifiedSidebar;
