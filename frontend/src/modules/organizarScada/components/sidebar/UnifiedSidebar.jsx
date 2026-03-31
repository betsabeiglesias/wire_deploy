// src/modules/organizarScada/components/sidebar/UnifiedSidebar.jsx
//
// Sidebar del designer SCADA.
// - Sin useRealtime / allTags: eliminado el ?rbol ISA-95 en tiempo real.
// - Secci?n "Dispositivos" abre DeviceManagerModal (tags desde API REST).
// - El resto de secciones sin cambios respecto al original.
//
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  Pencil,
  Trash2,
  Unlock,
} from "lucide-react";
import { elementos_scada } from "@/modules/organizarScada/templates/elementos_scada";
import { buttons_labels_items } from "@/modules/organizarScada/utils/items";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import ProjectVariableModal from "../devices/ProjectVariableModal";
import api from "../../../../services/api";

// --- Image helpers -------------------------------------------------------------
const CUSTOM_ICONS_STORAGE_KEY = "organizarScada.customIcons.library";
const MAX_IMAGE_DIMENSION = 1200;
const MAX_IMAGE_BYTES = 500 * 1024;
const cls = (...parts) => parts.filter(Boolean).join(" ");
const editorPanelClass =
  "rounded-2xl border border-[#28486f] bg-[linear-gradient(180deg,rgba(9,21,47,0.96)_0%,rgba(13,29,64,0.98)_100%)] p-3 text-[11px] text-[#d6e4f5] shadow-[0_18px_40px_-30px_rgba(3,10,24,0.75)]";
const editorSectionTitleClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]";
const editorInputClass =
  "w-full rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.06)] px-2.5 py-2 text-[12px] text-[#eef4ff] placeholder:text-[#7f90a5] focus:border-[#7ec8ff] focus:outline-none";
const editorGhostButtonClass =
  "rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 text-[11px] text-[#d6e4f5] transition hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.12)]";
const editorActionButtonClass =
  "rounded-xl border border-[#2d6284] bg-[linear-gradient(180deg,#215f82_0%,#194b68_100%)] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-[0_12px_24px_-18px_rgba(25,75,104,0.65)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";
const editorCardClass =
  "rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.05)]";
const editorScrollClass =
  "max-h-72 overflow-y-auto rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.04)] p-1";

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
// ------------------------------------------------------------------------------

const UnifiedSidebar = ({
  layoutId = null,
  projectName = "",
  onProjectNameChange,
  onSaveProject,        // () => Promise<void> ? guarda el proyecto sin validar canvas
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
  // -- Variables tree --------------------------------------------------------
  const [variables,            setVariables]            = useState([]);
  const [varsLoading,          setVarsLoading]          = useState(false);
  const [expandedTables,       setExpandedTables]       = useState({});  // { tableName: bool }

  const fetchVariables = useCallback(async () => {
    if (!layoutId) return;
    setVarsLoading(true);
    try {
      const res = await api.get(`/api/scada/layouts/${layoutId}/tables/`);
      setVariables(res.data || []);  // ahora es array de tablas con variables anidadas
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

  // variables is now array of VariableTable objects with nested .variables[]
  const totalVarsCount = useMemo(() =>
    variables.reduce((acc, t) => acc + (t.variables?.length || 0), 0),
    [variables]
  );

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
    // Refrescar variables al abrir la secci?n de dispositivos
    if (id === "devices" && layoutId) fetchVariables();
  };

  // -- Project name -------------------------------------------------------------
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

  // -- Custom icons --------------------------------------------------------------
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

  // -- Templates -----------------------------------------------------------------
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

  // -- Buttons / labels ----------------------------------------------------------
  const getButtonBaseData = (item) => {
    if (item.kind === "button") return { type: "nav-button", variant: item.id, label: item.label, targetViewId: null, width: 160, height: 48 };
    if (item.kind === "label")  return { type: item.id, label: item.label, width: 160, height: 40 };
    return { type: item.id, label: item.label, width: 200, height: 120 };
  };
  const handleButtonDragStart = (e, item) =>
    handleTemplateDragStart(e, { id: `tpl-${item.id}`, data: getButtonBaseData(item) });
  const handlePickButton = (item) => addComponentToCanvas?.(getButtonBaseData(item));

  // -- Layers --------------------------------------------------------------------
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

  // -- Views ---------------------------------------------------------------------
  const startInlineRename  = (view) => { setEditingViewId(view.id); setEditingName(view.name); };
  const commitInlineRename = (viewId) => {
    if (editingName?.trim()) onRenameView?.(viewId, editingName.trim());
    setEditingViewId(null);
    setEditingName("");
  };
  const cancelInlineRename = () => { setEditingViewId(null); setEditingName(""); };

  // -- Section content -----------------------------------------------------------
  const renderSectionContent = (sectionId) => {

    // -- Pantallas + Capas ------------------------------------------------------
    if (sectionId === "pantallas") {
      return (
        <div className={cls(editorPanelClass, "space-y-3")}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Pantallas</h3>
            <button
              onClick={onCreateView}
              className={editorActionButtonClass}
            >
              + Nueva pantalla
            </button>
          </div>

          {viewsError && (
            <div className="rounded-xl border border-[#8f6a18] bg-[rgba(233,196,106,0.12)] px-2 py-2 text-[11px] text-[#f6d78a]">
              {viewsError}
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {viewsLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.05)] px-3 py-3">
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
              <div className="rounded-xl border border-dashed border-[#355780] bg-[rgba(255,255,255,0.04)] px-3 py-3 text-[11px] text-[#a9bdd7]">
                <p className="font-semibold text-white">A?n no tienes vistas.</p>
                <p className="mt-1 text-[#8ea9c8]">Crea tu primera vista o importa un JSON existente.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={onCreateView}
                    className={editorActionButtonClass}
                  >
                    + Crear vista
                  </button>
                  <button
                    onClick={onRefreshViews}
                    className={editorGhostButtonClass}
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
                    "flex items-center justify-between rounded-xl border px-3 py-2 transition",
                    isSelected
                      ? "border-[#7ec8ff] bg-[linear-gradient(180deg,rgba(34,86,120,0.95)_0%,rgba(25,75,104,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "border-[#355780] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(126,200,255,0.09)]",
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
                            className={editorInputClass}
                          />
                        ) : (
                          <span className={isSelected ? "font-semibold text-white" : "text-[#d6e4f5]"}>
                            {view.name}
                          </span>
                        )}
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <div className="mt-1 text-[10px] text-[#8ea9c8]">
                        {view.elements?.length || 0} elementos
                      </div>
                    </button>
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => startInlineRename(view)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 text-[#8ea9c8] transition hover:bg-[rgba(126,200,255,0.12)] hover:text-[#7ec8ff]"
                        title="Renombrar"
                        aria-label={`Renombrar vista ${view.name}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`?Eliminar vista "${view.name}"?`)) onDeleteView(view.id); }}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 text-[#8ea9c8] transition hover:bg-[rgba(175,71,97,0.14)] hover:text-[#f199ad]"
                        title="Eliminar"
                        aria-label={`Eliminar vista ${view.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Capas */}
          <div className="border-t border-[#28486f] pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8ea9c8]">Capas</h4>
              <span className="text-[10px] text-[#6f87a5]">{layers.length} elementos</span>
            </div>
            <div className={cls(editorScrollClass, "max-h-64 space-y-1")}>
              {layers.length === 0 && (
                <div className="rounded-lg bg-[rgba(255,255,255,0.05)] px-2 py-2 text-[10px] text-[#8ea9c8]">
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
                      "group flex items-center gap-1 rounded-xl border px-1.5 py-1 text-[11px] transition cursor-pointer",
                      isSelected
                        ? "border-[#7ec8ff] bg-[rgba(126,200,255,0.14)] text-white"
                        : "border-transparent bg-[rgba(255,255,255,0.04)] text-[#d6e4f5] hover:border-[#355780] hover:bg-[rgba(126,200,255,0.08)]",
                      draggingLayerId === layer.id ? "opacity-60" : "",
                    ].join(" ")}
                    title={`${layer.fallbackName} ? z:${layer.zIndex}`}
                  >
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-lg text-[#8ea9c8] hover:bg-[rgba(126,200,255,0.12)]"
                      onClick={e => { e.stopPropagation(); onToggleElementVisibility?.(layer.id); }}
                    >
                      {layer.isVisible ? <Eye size={12} /> : <EyeOff size={12} className="text-[#6f87a5]" />}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-lg text-[#8ea9c8] hover:bg-[rgba(126,200,255,0.12)]"
                      onClick={e => { e.stopPropagation(); onToggleElementLock?.(layer.id); }}
                    >
                      {layer.isLocked ? <Lock size={12} /> : <Unlock size={12} className="text-[#6f87a5]" />}
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
                          className={cls(editorInputClass, "px-1.5 py-1 text-[11px]")}
                        />
                      ) : (
                        <p
                          className={[
                            "truncate",
                            !layer.isVisible ? "text-[#6f87a5] line-through" : "",
                            layer.isLocked   ? "text-[#f6d78a]" : "",
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
                    <span className="text-[10px] text-[#6f87a5]">z:{layer.zIndex}</span>
                    <span className="text-[#4c6788] group-hover:text-[#8ea9c8]">
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

    // -- Dispositivos ------------------------------------------------------------
    if (sectionId === "devices") {
      // Sin proyecto guardado: formulario de nombre
      if (!layoutId) {
        return (
          <div className={cls(editorPanelClass, "space-y-3")}>
            <h3 className="text-sm font-semibold text-white">Variables</h3>
            <p className="text-[10px] text-[#8ea9c8]">
              Para gestionar variables el proyecto necesita un nombre y estar guardado.
            </p>
            <div className="space-y-2">
              <input
                className={editorInputClass}
                placeholder="Nombre del proyecto?"
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
                className={cls(editorActionButtonClass, "w-full py-2 text-[12px]")}
              >
                {isSavingProject ? "Guardando?" : "Guardar y continuar"}
              </button>
            </div>
          </div>
        );
      }

      // Con proyecto guardado: ?rbol tabla ? variables + bot?n gestor
      return (
        <div className={cls(editorPanelClass, "space-y-2")}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Variables
              {totalVarsCount > 0 && (
                <span className="ml-1.5 text-[10px] font-normal text-[#8ea9c8]">({totalVarsCount})</span>
              )}
            </h3>
            <button onClick={() => setShowDevices(true)}
              className={editorGhostButtonClass}>
              Gestionar
            </button>
          </div>

          {varsLoading ? (
            <div className="space-y-1 pt-1">
              {[1,2,3].map(i => <SkeletonBlock key={i} width="w-full" height="h-4" />)}
            </div>
          ) : variables.length === 0 ? (
            <p className="text-[10px] text-[#8ea9c8]">
              Sin tablas. Usa "Gestionar" para crear tablas y a?adir variables.
            </p>
          ) : (
            <div className="max-h-72 space-y-0.5 overflow-y-auto rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.04)] p-1.5">
              {variables.map(table => {
                const isOpen = expandedTables[table.id] ?? true;
                const tableVars = table.variables || [];
                return (
                  <div key={table.id}>
                    {/* Tabla ? rama */}
                    <button type="button" onClick={() => toggleTable(table.id)}
                      className="flex w-full items-center gap-1 rounded-xl px-2 py-1.5 text-left hover:bg-[rgba(126,200,255,0.08)]">
                      {isOpen
                        ? <ChevronDown size={11} className="shrink-0 text-[#8ea9c8]" />
                        : <ChevronRight size={11} className="shrink-0 text-[#8ea9c8]" />}
                      <span className="flex-1 truncate text-[11px] font-semibold text-[#eef4ff]">
                        {table.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-[#8ea9c8]">{tableVars.length}</span>
                    </button>

                    {/* Variables ? hojas */}
                    {isOpen && (
                      <div className="ml-3 space-y-0.5 border-l border-[#355780] pl-2 pb-1">
                        {tableVars.length === 0 ? (
                          <p className="py-0.5 text-[10px] text-[#8ea9c8]">Sin variables.</p>
                        ) : (
                          tableVars.map(v => (
                            <div key={v.id}
                              className="flex items-center justify-between gap-1 rounded-lg px-1.5 py-1 hover:bg-[rgba(126,200,255,0.08)]"
                              title={v.source === "connection"
                                ? `${v.equipment} ? ${v.variable}`
                                : `Local ? ${v.datatype}${v.initial_value != null ? ` = ${v.initial_value}` : ""}`}>
                              <span className="truncate text-[11px] text-[#d6e4f5]">{v.name}</span>
                              <div className="flex shrink-0 items-center gap-1">
                                {v.source === "connection" && v.equipment && (
                                  <span className="max-w-[60px] truncate text-[9px] text-[#8ea9c8]">
                                    {v.equipment}
                                  </span>
                                )}
                                <span className={cls(
                                  "rounded-full px-1.5 py-0.5 text-[9px]",
                                  v.source === "local"
                                    ? "bg-[rgba(143,106,24,0.18)] text-[#f6d78a]"
                                    : "bg-[rgba(126,200,255,0.12)] text-[#9dd7ff]"
                                )}>
                                  {v.datatype || "?"}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // -- Iconos HMI --------------------------------------------------------------
    if (sectionId === "elements") {
      const scadaGroups = [
        { id: "gauges",   label: "Gauges",   items: elementos_scada.gauges   || [] },
        { id: "barras",   label: "Barras",   items: elementos_scada.barras   || [] },
        { id: "tarjetas", label: "Tarjetas", items: elementos_scada.tarjetas || [] },
        { id: "graficas", label: "Gr?ficas", items: elementos_scada.graficas || [] },
        { id: "minis",    label: "Mini",     items: elementos_scada.minis    || [] },
      ];
      return (
        <div className={editorPanelClass}>
          <p className={cls(editorSectionTitleClass, "mb-3")}>
            Plantillas SCADA
          </p>
          <div className="space-y-3">
            {scadaGroups.map(group =>
              group.items.length ? (
                <div key={group.id}>
                  <div className={cls(editorSectionTitleClass, "mb-2")}>
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {group.items.map(tpl => (
                      <div
                        key={tpl.id}
                        draggable
                        onDragStart={e => handleTemplateDragStart(e, tpl)}
                        onClick={() => handlePickTemplate(tpl)}
                        className="cursor-grab select-none rounded-2xl border border-[#355780] bg-[rgba(255,255,255,0.05)] shadow-[0_16px_24px_-24px_rgba(3,10,24,0.7)] transition hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.1)] active:cursor-grabbing"
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

    // -- Iconos b?sicos ----------------------------------------------------------
    if (sectionId === "buttons") {
      return (
        <div className={editorPanelClass}>
          <p className={cls(editorSectionTitleClass, "mb-3")}>
            Buttons & Labels
          </p>
          <div className="grid grid-cols-2 gap-3">
            {buttons_labels_items.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleButtonDragStart(e, item)}
                onClick={() => handlePickButton(item)}
                className="cursor-grab select-none rounded-2xl border border-[#355780] bg-[rgba(255,255,255,0.05)] px-2 py-2 text-[10px] text-[#d6e4f5] transition hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.1)] active:cursor-grabbing"
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

    // -- Iconos personalizados ---------------------------------------------------
    if (sectionId === "custom-icons") {
      return (
        <div className={cls(editorPanelClass, "space-y-3")}>
          <div className="flex items-center justify-between">
            <p className={editorSectionTitleClass}>
              Libreria de imagenes
            </p>
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={isProcessingUpload}
              className={editorGhostButtonClass}
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

          <p className="text-[10px] text-[#8ea9c8]">
            PNG, JPG o SVG. Se optimiza en cliente y se guarda como Base64.
          </p>

          {customIcons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#355780] bg-[rgba(255,255,255,0.04)] px-2 py-3 text-[11px] text-[#8ea9c8]">
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
                    className="group relative cursor-grab rounded-2xl border border-[#355780] bg-[rgba(255,255,255,0.05)] p-1.5 shadow-[0_16px_24px_-24px_rgba(3,10,24,0.7)] transition hover:border-[#7ec8ff] hover:bg-[rgba(126,200,255,0.1)] active:cursor-grabbing"
                    title={icon.name}
                  >
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleDeleteCustomIcon(icon.id); }}
                      className="absolute right-1 top-1 z-10 hidden h-5 w-5 items-center justify-center rounded-full border border-[rgba(241,153,173,0.35)] bg-[rgba(9,21,47,0.92)] text-[11px] text-[#f199ad] shadow group-hover:inline-flex"
                      title="Eliminar icono"
                    >?</button>
                    <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl border border-[#355780] bg-[rgba(255,255,255,0.04)]">
                      <img
                        src={icon.base64}
                        alt={icon.name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-1 truncate text-[10px] text-[#d6e4f5]">{icon.name}</p>
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

  // -- Shell ---------------------------------------------------------------------
  return (
    <>
      <div className="flex h-full bg-transparent text-[13px] text-slate-800">
        <aside
          className={`relative flex flex-col overflow-hidden rounded-[24px] border border-[#1f3656] bg-[linear-gradient(180deg,#09152f_0%,#0d1d40_42%,#132857_100%)] text-[#d6e4f5] shadow-[0_24px_48px_-32px_rgba(3,10,24,0.8)] transition-all duration-200 ${
            isMainOpen ? "w-64" : "w-12"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(126,200,255,0.14),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[rgba(255,255,255,0.08)]" />

          <button
            type="button"
            onClick={() => setIsMainOpen((prev) => !prev)}
            className="absolute -right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#355780] bg-[linear-gradient(180deg,#163052_0%,#0d1d40_100%)] text-[#d6e4f5] shadow-[0_12px_24px_-16px_rgba(3,10,24,0.85)] transition hover:border-[#7ec8ff] hover:text-white"
            aria-label={isMainOpen ? "Cerrar sidebar" : "Abrir sidebar"}
            title={isMainOpen ? "Cerrar sidebar" : "Abrir sidebar"}
          >
            {isMainOpen ? "<" : ">"}
          </button>

          <div className="relative flex h-14 items-center justify-between border-b border-[#1f3656] px-3">
            {isMainOpen && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-[#355780] bg-[rgba(255,255,255,0.06)] text-[11px] font-semibold text-[#7ec8ff]">
                  UI
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8ea9c8]">
                    Editor
                  </span>
                  <span className="block text-sm font-semibold text-white">
                    Componentes
                  </span>
                </div>
              </div>
            )}
          </div>

          {isMainOpen && (
            <div className="relative flex-1 space-y-6 overflow-y-auto px-3 py-4">
              {/* Nombre proyecto */}
              <div className="rounded-2xl border border-[#28486f] bg-[rgba(255,255,255,0.05)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8ea9c8]">
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
                    className={cls(editorInputClass, "mt-2 font-semibold")}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingProjectName(true)}
                    className="mt-2 block w-full truncate rounded-xl px-2 py-1.5 text-left text-[12px] font-semibold text-white transition hover:bg-[rgba(126,200,255,0.08)]"
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
                              "flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[#7ec8ff] bg-[linear-gradient(180deg,rgba(34,86,120,0.96)_0%,rgba(25,75,104,0.98)_100%)] text-white shadow-[0_12px_24px_-20px_rgba(25,75,104,0.75)]"
                                : "border-transparent text-[#c8d8eb] hover:border-[#28486f] hover:bg-[rgba(255,255,255,0.05)] hover:text-white",
                            ].join(" ")}
                          >
                            <span className="truncate">{item.label}</span>
                            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                          </button>
                          {isActive && (
                            <div className="mt-2">
                              <div className="custom-scroll max-h-130 overflow-y-auto px-1">
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
            fetchVariables();   // refresca el ?rbol del sidebar
          }}
          layoutId={layoutId}
        />
      )}
    </>
  );
};

export default UnifiedSidebar;

