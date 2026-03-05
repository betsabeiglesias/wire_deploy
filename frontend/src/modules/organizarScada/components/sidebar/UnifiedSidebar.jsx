// UnifiedSidebar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  Unlock,
} from "lucide-react";
import { useRealtime } from "@/realtime/RealtimeProvider";
import { elementos_scada } from "@/modules/organizarScada/templates/elementos_scada";
import { buttons_labels_items } from "@/modules/organizarScada/utils/items";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import DeviceManagerModal from "@/modules/organizarScada/components/devices/DeviceManagerModal";

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
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const isPng = file.type === "image/png";
  const mimeType = isPng ? "image/png" : "image/jpeg";
  let quality = 0.9;
  let output = canvas.toDataURL(mimeType, quality);

  // Ajuste progresivo si sigue pesado (aplica sobre todo JPG).
  while (
    !isPng &&
    estimateDataUrlSize(output) > MAX_IMAGE_BYTES &&
    quality > 0.45
  ) {
    quality -= 0.1;
    output = canvas.toDataURL(mimeType, quality);
  }

  return {
    base64: output,
    width: targetWidth,
    height: targetHeight,
    originalWidth: image.width,
    originalHeight: image.height,
  };
};

const optimizeAndEncodeAsset = async (file) => {
  if (file.type === "image/svg+xml") {
    return {
      base64: await readFileAsDataURL(file),
      width: 240,
      height: 180,
      originalWidth: 240,
      originalHeight: 180,
    };
  }
  return optimizeRasterToBase64(file);
};

const UnifiedSidebar = ({
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
  const [isMainOpen, setIsMainOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("pantallas");
  const [showDevices, setShowDevices] = useState(false);
  const [customIcons, setCustomIcons] = useState([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const uploadInputRef = useRef(null);

  const { allTags } = useRealtime();
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [expandedLines, setExpandedLines] = useState({});
  const [expandedCells, setExpandedCells] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [editingViewId, setEditingViewId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [editingLayerName, setEditingLayerName] = useState("");
  const [draggingLayerId, setDraggingLayerId] = useState(null);

  const sidebarSections = [
    {
      id: "main",
      items: [
        { id: "pantallas", label: "Pantallas" },
        { id: "devices", label: "Dispositivos" },
        { id: "elements", label: "Iconos hmi" },
        { id: "buttons", label: "Iconos basicos" },
        { id: "custom-icons", label: "Iconos personalizados" },
      ],
    },
  ];

  const handleSectionClick = id => {
    setActiveSection(prev => (prev === id ? null : id));
  };

  const handleElementDragStart = (e, type) => {
    e.dataTransfer.setData("application/x-element-type", type);
  };

  const handleTemplateDragStart = (e, tpl) => {
    const tplWithEquipment = {
      ...tpl,
      data: {
        ...tpl.data,
        settings: {
          ...(tpl.data?.settings || {}),
          equipment: selectedEquipment || tpl.data?.settings?.equipment,
        },
      },
    };
    e.dataTransfer.setData(
      "application/x-scada-template",
      JSON.stringify(tplWithEquipment),
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const renderTemplatePreview = tpl =>
    renderWidget({
      data: tpl.data,
      live: { value: undefined, unit: tpl.data?.settings?.unit },
      width: 120,
      height: 90,
      theme: "theme-clean",
      valueHistory: [],
    });

  const getButtonBaseData = item => {
    if (item.kind === "button") {
      return {
        type: "nav-button",
        variant: item.id,
        label: item.label,
        targetViewId: null,
        width: 160,
        height: 48,
      };
    }
    if (item.kind === "label") {
      return {
        type: item.id,
        label: item.label,
        width: 160,
        height: 40,
      };
    }
    return {
      type: item.id,
      label: item.label,
      width: 200,
      height: 120,
    };
  };

  const handleButtonDragStart = (e, item) => {
    const baseData = getButtonBaseData(item);
    const tpl = {
      id: `tpl-${item.id}`,
      data: baseData,
    };
    handleTemplateDragStart(e, tpl);
  };

  const handlePickButton = item => {
    const data = getButtonBaseData(item);
    // addComponentToCanvas expects raw data object
    addComponentToCanvas?.(data);
  };

  const handleLayoutDragStart = (e, layoutType) => {
    e.dataTransfer.setData("application/x-element-type", layoutType);
  };

  const sites = useMemo(
    () => [...new Set(allTags.map(t => t.site).filter(Boolean))],
    [allTags],
  );

  const areas = useMemo(() => {
    const subset = allTags.filter(
      t => !selectedSite || t.site === selectedSite,
    );
    return [...new Set(subset.map(t => t.area).filter(Boolean))];
  }, [allTags, selectedSite]);

  const lines = useMemo(() => {
    const subset = allTags.filter(
      t =>
        (!selectedSite || t.site === selectedSite) &&
        (!selectedArea || t.area === selectedArea),
    );
    return [...new Set(subset.map(t => t.line).filter(Boolean))];
  }, [allTags, selectedSite, selectedArea]);

  const treeCellsByLine = useMemo(() => {
    const map = {};
    allTags
      .filter(
        t =>
          (!selectedSite || t.site === selectedSite) &&
          (!selectedArea || t.area === selectedArea),
      )
      .forEach(t => {
        if (!t.line || !t.cell) return;
        if (!map[t.line]) map[t.line] = new Set();
        map[t.line].add(t.cell);
      });
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]));
  }, [allTags, selectedSite, selectedArea]);

  const equipmentsByCellKey = useMemo(() => {
    const map = {};
    allTags
      .filter(
        t =>
          (!selectedSite || t.site === selectedSite) &&
          (!selectedArea || t.area === selectedArea),
      )
      .forEach(t => {
        if (!t.line || !t.cell || !t.equipment) return;
        const key = `${t.line}///${t.cell}`;
        if (!map[key]) map[key] = new Set();
        map[key].add(t.equipment);
      });
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]));
  }, [allTags, selectedSite, selectedArea]);

  const variablesForEquipment = eq => {
    const subset = allTags.filter(
      t =>
        (!selectedSite || t.site === selectedSite) &&
        (!selectedArea || t.area === selectedArea) &&
        t.equipment === eq,
    );
    return [...new Set(subset.map(t => t.variable).filter(Boolean))];
  };

  const attrsMetaForSelection = eq => {
    const subset = allTags.filter(
      t =>
        (!selectedSite || t.site === selectedSite) &&
        (!selectedArea || t.area === selectedArea) &&
        t.equipment === eq,
    );
    const byVar = {};
    subset.forEach(t => {
      byVar[t.variable] = t;
    });
    return byVar;
  };

  const toggleLine = line =>
    setExpandedLines(prev => ({ ...prev, [line]: !prev[line] }));
  const toggleCell = (line, cell) => {
    const key = `${line}///${cell}`;
    setExpandedCells(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePickTemplate = tpl => {
    const baseSettings = tpl.data?.settings || {};
    const dataToCanvas = {
      ...tpl.data,
      settings: {
        ...baseSettings,
        site: selectedSite || baseSettings.site,
        area: selectedArea || baseSettings.area,
        equipment: selectedEquipment || baseSettings.equipment,
      },
      equipment: selectedEquipment || tpl.data?.equipment,
    };
    addComponentToCanvas?.(dataToCanvas);
  };

  const startInlineRename = view => {
    setEditingViewId(view.id);
    setEditingName(view.name);
  };

  const commitInlineRename = viewId => {
    if (editingName && editingName.trim()) {
      onRenameView?.(viewId, editingName.trim());
    }
    setEditingViewId(null);
    setEditingName("");
  };

  const cancelInlineRename = () => {
    setEditingViewId(null);
    setEditingName("");
  };

  const formatUpdatedAt = ts => {
    if (!ts) return "Sin fecha";
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? "Sin fecha" : d.toLocaleString();
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_ICONS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setCustomIcons(parsed);
    } catch (_err) {
      setCustomIcons([]);
    }
  }, []);

  const persistCustomIcons = (next) => {
    setCustomIcons(next);
    try {
      localStorage.setItem(CUSTOM_ICONS_STORAGE_KEY, JSON.stringify(next));
    } catch (_err) {
      // noop
    }
  };

  const iconToTemplate = (icon) => ({
    id: `tpl-custom-${icon.id}`,
    data: {
      type: "image-widget",
      label: icon.name,
      width: Math.min(Number(icon.width) || 220, 320),
      height: Math.min(Number(icon.height) || 180, 260),
      settings: {
        imageBase64: icon.base64,
        opacity: 100,
        lockAspectRatio: true,
        layer_alias: icon.name,
      },
    },
  });

  const handlePickCustomIcon = (icon) => {
    addComponentToCanvas?.(iconToTemplate(icon).data);
  };

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
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: (file.name || "icono").replace(/\.[^.]+$/, ""),
        base64: processed.base64,
        width: processed.width,
        height: processed.height,
        createdAt: new Date().toISOString(),
      };
      const next = [item, ...customIcons].slice(0, 80);
      persistCustomIcons(next);
    } catch (err) {
      console.error("No se pudo procesar el icono personalizado", err);
      window.alert("No se pudo procesar la imagen.");
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleDeleteCustomIcon = (iconId) => {
    const next = customIcons.filter((icon) => icon.id !== iconId);
    persistCustomIcons(next);
  };

  const layers = useMemo(() => {
    return [...canvasElements]
      .map((el, idx) => {
        const settings = el?.data?.settings || {};
        const parsedZ = Number(settings.z_index);
        const zIndex = Number.isFinite(parsedZ) ? parsedZ : idx + 1;
        const isVisible = settings.is_visible !== false;
        const isLocked = settings.is_locked === true;
        const displayName =
          settings.layer_alias ||
          settings.attributeLabel ||
          el?.data?.name ||
          el?.data?.label ||
          el?.data?.type ||
          `Elemento ${idx + 1}`;
        return {
          id: el.id,
          zIndex,
          isVisible,
          isLocked,
          displayName,
          fallbackName: el?.data?.type || "widget",
          idx,
        };
      })
      .sort((a, b) => b.zIndex - a.zIndex || b.idx - a.idx);
  }, [canvasElements]);

  const commitLayerRename = layerId => {
    const next = String(editingLayerName || "").trim();
    if (next) onRenameElementLayer?.(layerId, next);
    setEditingLayerId(null);
    setEditingLayerName("");
  };

  const cancelLayerRename = () => {
    setEditingLayerId(null);
    setEditingLayerName("");
  };

  const handleLayerDragStart = (e, layerId) => {
    setDraggingLayerId(layerId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(layerId));
  };

  const handleLayerDrop = targetLayerId => {
    if (!draggingLayerId || draggingLayerId === targetLayerId) {
      setDraggingLayerId(null);
      return;
    }
    const orderedIds = layers.map((layer) => layer.id);
    const sourceIndex = orderedIds.findIndex((id) => id === draggingLayerId);
    const targetIndex = orderedIds.findIndex((id) => id === targetLayerId);
    if (sourceIndex < 0 || targetIndex < 0) {
      setDraggingLayerId(null);
      return;
    }
    const nextOrder = [...orderedIds];
    const [moved] = nextOrder.splice(sourceIndex, 1);
    nextOrder.splice(targetIndex, 0, moved);
    onReorderLayers?.(nextOrder);
    setDraggingLayerId(null);
  };

  const renderSectionContent = sectionId => {
    if (sectionId === "pantallas") {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-[11px] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Pantallas</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onCreateView}
                className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
              >
                + Nueva pantalla
              </button>
            </div>
          </div>
          {viewsError && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] text-amber-700">
              {viewsError}
            </div>
          )}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {viewsLoading && (
              <div className="space-y-2" data-testid="views-skeleton">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="rounded-md border border-slate-200 bg-white px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <SkeletonBlock width="w-32" height="h-3.5" />
                      <SkeletonBlock
                        width="w-4"
                        height="h-4"
                        rounded="rounded-full"
                      />
                    </div>
                    <div className="mt-2">
                      <SkeletonBlock width="w-16" height="h-2.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!viewsLoading && views.length === 0 && (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-700">
                  Aún no tienes vistas.
                </p>
                <p className="mt-1 text-slate-500">
                  Crea tu primera vista o importa un JSON existente.
                </p>
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
            {!viewsLoading &&
              views.map(view => {
                const isSelected = view.id === selectedViewId;
                return (
                  <div
                    key={view.id}
                    className={[
                      "flex items-center justify-between rounded-md border px-3 py-2 transition",
                      isSelected
                        ? "border-sky-400 bg-sky-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <button
                        onClick={() => onSelectView(view.id)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          {editingViewId === view.id ? (
                            <input
                              autoFocus
                              value={editingName}
                              onChange={e => setEditingName(e.target.value)}
                              onBlur={() => commitInlineRename(view.id)}
                              onKeyDown={e => {
                                if (e.key === "Enter")
                                  commitInlineRename(view.id);
                                if (e.key === "Escape") cancelInlineRename();
                              }}
                              className="w-full rounded border border-sky-300 px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:border-sky-500"
                            />
                          ) : (
                            <span
                              className={
                                isSelected
                                  ? "text-sky-800 font-semibold"
                                  : "text-slate-700"
                              }
                            >
                              {view.name}
                            </span>
                          )}
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}
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
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar vista "${view.name}"?`)) {
                              onDeleteView(view.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Capas
              </h4>
              <span className="text-[10px] text-slate-400">
                {layers.length} elementos
              </span>
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-1">
              {layers.length === 0 && (
                <div className="rounded bg-white px-2 py-2 text-[10px] text-slate-500">
                  No hay elementos en el canvas.
                </div>
              )}
              {layers.map((layer) => {
                const isSelected = selectedElementId === layer.id;
                const isEditing = editingLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    draggable
                    onDragStart={(e) => handleLayerDragStart(e, layer.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleLayerDrop(layer.id)}
                    onClick={() => onSelectElement?.(layer.id)}
                    className={[
                      "group flex items-center gap-1 rounded border px-1.5 py-1 text-[11px] transition",
                      isSelected
                        ? "border-sky-400 bg-sky-50 text-sky-900"
                        : "border-transparent bg-white text-slate-700 hover:border-slate-300",
                      draggingLayerId === layer.id ? "opacity-60" : "",
                    ].join(" ")}
                    title={`${layer.fallbackName} • z:${layer.zIndex}`}
                  >
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleElementVisibility?.(layer.id);
                      }}
                      title={layer.isVisible ? "Ocultar capa" : "Mostrar capa"}
                    >
                      {layer.isVisible ? (
                        <Eye size={12} />
                      ) : (
                        <EyeOff size={12} className="text-slate-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleElementLock?.(layer.id);
                      }}
                      title={layer.isLocked ? "Desbloquear capa" : "Bloquear capa"}
                    >
                      {layer.isLocked ? (
                        <Lock size={12} />
                      ) : (
                        <Unlock size={12} className="text-slate-400" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingLayerName}
                          onChange={(e) => setEditingLayerName(e.target.value)}
                          onBlur={() => commitLayerRename(layer.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitLayerRename(layer.id);
                            if (e.key === "Escape") cancelLayerRename();
                          }}
                          className="w-full rounded border border-sky-300 px-1 py-0.5 text-[11px] focus:border-sky-500 focus:outline-none"
                        />
                      ) : (
                        <p
                          className={[
                            "truncate",
                            !layer.isVisible ? "text-slate-400 line-through" : "",
                            layer.isLocked ? "text-amber-700" : "",
                          ].join(" ")}
                          onDoubleClick={(e) => {
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
    if (sectionId === "devices") {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Dispositivos
            </h3>
            <button
              onClick={() => setShowDevices(true)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
            >
              Abrir gestor
            </button>
          </div>
        </div>
      );
    }
    if (sectionId === "elements") {
      const scadaGroups = [
        { id: "gauges", label: "Gauges", items: elementos_scada.gauges || [] },
        { id: "barras", label: "Barras", items: elementos_scada.barras || [] },
        {
          id: "tarjetas",
          label: "Tarjetas",
          items: elementos_scada.tarjetas || [],
        },
        {
          id: "graficas",
          label: "Gráficas",
          items: elementos_scada.graficas || [],
        },
        { id: "minis", label: "Mini", items: elementos_scada.minis || [] },
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
                        className="cursor-grab select-none rounded-lg border border-slate-200 bg-white text-left shadow-sm hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
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
              ) : null,
            )}
          </div>
        </div>
      );
    }
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
                {/* <div className="mb-1 text-[10px] text-slate-400">
                  {item.label}
                </div> */}
                <div className={item.previewClass}>
                  {item.kind === "button"
                    ? "Button"
                    : item.kind === "label"
                      ? "Label"
                      : "Caja"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
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
                    onDragStart={(e) => handleTemplateDragStart(e, tpl)}
                    onClick={() => handlePickCustomIcon(icon)}
                    className="group relative cursor-grab rounded-md border border-slate-200 bg-white p-1.5 shadow-sm hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
                    title={icon.name}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomIcon(icon.id);
                      }}
                      className="absolute right-1 top-1 z-10 hidden h-5 w-5 items-center justify-center rounded bg-white/90 text-[11px] text-rose-600 shadow group-hover:inline-flex"
                      title="Eliminar icono"
                    >
                      ×
                    </button>
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
    // if (sectionId === "layout") {
    //   return (
    //     <div className="rounded-lg border border-slate-200 bg-white p-3 text-[11px]">
    //       <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">Layout</p>
    //       <div className="space-y-4">
    //         <section>
    //           <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Navigation</h2>
    //           <div className="grid grid-cols-2 gap-3">
    //             <LayoutCard label="Content" variant="content-only" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-content")} />
    //             <LayoutCard label="Header" variant="header" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-header")} />
    //             <LayoutCard label="Nav bar" variant="navbar" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-navbar")} />
    //           </div>
    //         </section>
    //         <section>
    //           <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Sidemenu</h2>
    //           <div className="grid grid-cols-3 gap-3">
    //             <LayoutCard label="Content" variant="side-content" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-side-content")} />
    //             <LayoutCard label="Header" variant="side-header" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-side-header")} />
    //             <LayoutCard label="Sidemenu" variant="sidemenu" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-sidemenu")} />
    //           </div>
    //         </section>
    //         <section>
    //           <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Bottom Bar</h2>
    //           <div className="grid grid-cols-2 gap-3">
    //             <LayoutCard label="Bar" variant="bottom-bar" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-bottom-bar")} />
    //             <LayoutCard label="Content" variant="bottom-content" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-bottom-content")} />
    //             <LayoutCard label="Header" variant="bottom-header" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-bottom-header")} />
    //           </div>
    //         </section>
    //         <section>
    //           <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Other</h2>
    //           <div className="grid grid-cols-3 gap-3">
    //             <LayoutCard label="Empty" variant="empty" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-empty-1")} />
    //             <LayoutCard label="Empty" variant="empty" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-empty-2")} />
    //             <LayoutCard label="Empty" variant="empty" draggable onDragStart={(e) => handleLayoutDragStart(e, "layout-empty-3")} />
    //           </div>
    //         </section>
    //       </div>
    //     </div>
    //   );
    // }
    return null;
  };
  return (
    <>
      <div className="flex h-full bg-slate-100 text-slate-800 text-[13px]">
        <aside
          className={`flex flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-200 ${
            isMainOpen ? "w-64" : "w-12"
          }`}
        >
          <div className="flex items-center justify-between h-10 px-2 border-b border-slate-200 bg-slate-50">
            {isMainOpen ? (
              <div className="flex items-center">
                <span className="ml-2 text-xs font-semibold tracking-wide text-slate-700">
                  Complentos
                </span>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[10px] font-semibold text-slate-700"></div>
            )}
          </div>

          {isMainOpen && (
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
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
                                : item.subtle
                                  ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
                            ].join(" ")}
                          >
                            <span className="truncate">{item.label}</span>
                            {isActive && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            )}
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
        <DeviceManagerModal
          open={showDevices}
          onClose={() => setShowDevices(false)}
        />
      )}
    </>
  );
};

const LayoutCard = ({ label, variant, draggable, onDragStart }) => {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      className="group flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-2 text-left text-[11px] text-slate-600 hover:border-sky-400 hover:bg-sky-50 transition-colors cursor-grab active:cursor-grabbing"
    >
      <div className="flex-1 rounded bg-slate-50 p-1 border border-slate-200 flex items-center justify-center">
        <div className="relative w-full h-16 bg-white rounded border border-slate-200 overflow-hidden">
          {variant === "content-only" && (
            <div className="absolute inset-2 border border-dashed border-slate-300 rounded" />
          )}
          {variant === "header" && (
            <>
              <div className="absolute inset-2 border border-slate-200 rounded" />
              <div className="absolute left-2 right-2 top-2 h-4 bg-slate-200 rounded" />
            </>
          )}
          {variant === "navbar" && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-2 rounded bg-slate-300" />
          )}
          {variant === "side-content" && (
            <>
              <div className="absolute inset-2 border border-slate-200 rounded" />
              <div className="absolute top-2 bottom-2 left-2 w-6 bg-slate-200 rounded" />
            </>
          )}
          {variant === "side-header" && (
            <>
              <div className="absolute inset-2 border border-slate-200 rounded" />
              <div className="absolute top-2 bottom-2 right-2 w-10 bg-slate-200 rounded" />
            </>
          )}
          {variant === "sidemenu" && (
            <div className="absolute inset-2 flex">
              <div className="w-6 bg-slate-200 rounded-l" />
              <div className="flex-1 bg-white rounded-r border-l border-slate-200" />
            </div>
          )}
          {variant === "bottom-bar" && (
            <>
              <div className="absolute inset-2 border border-slate-200 rounded" />
              <div className="absolute left-2 right-2 bottom-2 h-4 bg-slate-200 rounded" />
            </>
          )}
          {variant === "bottom-content" && (
            <>
              <div className="absolute inset-2 border border-slate-200 rounded" />
              <div className="absolute left-2 right-2 top-2 h-4 bg-slate-200 rounded" />
            </>
          )}
          {variant === "bottom-header" && (
            <>
              <div className="absolute inset-2 border border-slate-200 rounded" />
              <div className="absolute left-2 right-2 top-2 h-4 bg-slate-200 rounded" />
            </>
          )}
          {variant === "empty" && (
            <div className="absolute inset-4 border border-dashed border-slate-300 rounded" />
          )}
        </div>
      </div>
      <span className="font-medium text-xs text-slate-700">{label}</span>
    </button>
  );
};

export default UnifiedSidebar;
