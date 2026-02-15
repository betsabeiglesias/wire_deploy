// UnifiedSidebar.jsx
import React, { useMemo, useState } from "react";
import { useGatewayData } from "@/hooks/useGatewayData";
import { elementos_scada } from "@/modules/organizarScada/templates/elementos_scada";
import { buttons_labels_items } from "@/modules/organizarScada/utils/items";
import { renderWidget } from "@/modules/organizarScada/components/widgets/registry.jsx";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import DeviceManagerModal from "@/modules/organizarScada/components/devices/DeviceManagerModal";

const UnifiedSidebar = ({
  views = [],
  selectedViewId,
  onCreateView,
  onSelectView,
  onRenameView,
  onDeleteView,
  addComponentToCanvas,
  viewsLoading = false,
  viewsError = "",
  onRefreshViews,
}) => {
  const [isMainOpen, setIsMainOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("pantallas");
  const [showDevices, setShowDevices] = useState(false);

  const { allTags } = useGatewayData();
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [expandedLines, setExpandedLines] = useState({});
  const [expandedCells, setExpandedCells] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [editingViewId, setEditingViewId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const sidebarSections = [
    {
      id: "main",
      items: [
        { id: "pantallas", label: "Pantallas" },
        { id: "devices", label: "Dispositivos" },
        { id: "elements", label: "Iconos hmi" },
        { id: "buttons", label: "Iconos basicos" },
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
          <p className="text-[11px] text-slate-600">
            Administra PLCs y tablas de tags en una vista tipo árbol + tabla.
          </p>
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
