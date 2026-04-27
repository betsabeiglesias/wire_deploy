// src/modules/organizarScada/components/sidebar/UnifiedSidebar.jsx
import React, { useEffect, useState } from "react";
import { Monitor, Cpu, Layout, Image, UploadCloud, Palette } from "lucide-react";
import ProjectVariableModal from "../devices/ProjectVariableModal";

// ── Hooks ───────────────────────────────────────────────────────────────────────
import useVariables   from "./hooks/useVariables";
import useLayers      from "./hooks/useLayers";
import useCustomIcons from "./hooks/useCustomIcons";
import { useHmiTheme } from "../widgets/styles/ThemeProvider";

// ── Tabs ────────────────────────────────────────────────────────────────────────
import ScreenTab      from "./tabs/ScreenTab";
import DevicesTab     from "./tabs/DevicesTab";
import ElementsTab    from "./tabs/ElementsTab";
import ButtonsTab     from "./tabs/ButtonsTab";
import CustomIconsTab from "./tabs/CustomIconsTab";

// ─── Sidebar sections config ────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: "pantallas",    label: "Pantallas",             Icon: Monitor     },
  { id: "devices",      label: "Dispositivos",          Icon: Cpu         },
  { id: "elements",     label: "Iconos hmi",            Icon: Layout      },
  { id: "buttons",      label: "Iconos basicos",        Icon: Image       },
  { id: "custom-icons", label: "Iconos personalizados", Icon: UploadCloud },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

const SidebarRail = ({ items, activeSection, onSelect }) => {
  const { theme } = useHmiTheme();
  
  return (
    <div 
      className="w-16 flex flex-col items-center py-2 gap-1 transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bgSidebar }}
    >
      {items.map((item) => {
        const { Icon } = item;
        const isActive = activeSection === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`
              w-full
              flex flex-col items-center justify-center
              py-2
              rounded-md
              transition-all duration-150
              hover:scale-105 active:scale-95
              ${isActive ? "shadow" : ""}
            `}
            style={{
              backgroundColor: isActive ? theme.colors.primary : "transparent",
              color: isActive ? theme.colors.textInverted : theme.colors.textDim
            }}
          >
            <Icon className="w-5 h-5" />
            <span 
              className="text-[8px] leading-none text-center mt-1 w-full px-1 whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ color: isActive ? theme.colors.textInverted : theme.colors.textDim }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const SidebarPanel = ({
  activeSection,
  children,
  projectName,
  isEditingProjectName,
  projectNameDraft,
  setProjectNameDraft,
  setIsEditingProjectName,
  commitProjectName,
  cancelProjectName,
}) => {
  const { theme, themeId, setThemeId, allThemes } = useHmiTheme();

  if (!activeSection) return null;

  return (
    <div 
      className="w-72 h-full min-h-0 overflow-hidden flex flex-col shadow-sm border-r transition-colors duration-300"
      style={{ 
        backgroundColor: theme.colors.bgWidget,
        borderColor: theme.colors.border,
        fontFamily: theme.fonts.base
      }}
    >
      {/* Header */}
      <div 
        className="h-10 shrink-0 px-3 flex items-center justify-between border-b"
        style={{ backgroundColor: theme.colors.bgPreview, borderColor: theme.colors.border }}
      >
        <span 
          className="text-xs font-semibold capitalize"
          style={{ color: theme.colors.textMain }}
        >
          {activeSection}
        </span>
      </div>

      {/* Proyecto & Tema */}
      <div 
        className="shrink-0 p-3 border-b space-y-3"
        style={{ borderColor: theme.colors.border }}
      >
        {/* Bloque Nombre Proyecto */}
        <div
          onClick={() => !isEditingProjectName && setIsEditingProjectName(true)}
          className="flex flex-col gap-1 px-3 py-2 rounded-md transition cursor-pointer group hover:opacity-80"
          style={{ backgroundColor: `${theme.colors.bgPreview}80` }}
        >
          <p className="text-[10px] font-semibold tracking-wide" style={{ color: theme.colors.textDim }}>
            PROYECTO000
          </p>
          <div className="flex items-center gap-2 min-h-[20px]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.success }} />
            {isEditingProjectName ? (
              <input
                autoFocus
                value={projectNameDraft}
                onChange={(e) => setProjectNameDraft(e.target.value)}
                onBlur={commitProjectName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitProjectName();
                  if (e.key === "Escape") cancelProjectName();
                }}
                className="w-full text-[14px] font-semibold rounded px-2 py-1 outline-none border"
                style={{ 
                  backgroundColor: theme.colors.bgWidget, 
                  color: theme.colors.textMain, 
                  borderColor: theme.colors.primary 
                }}
              />
            ) : (
              <>
                <p className="text-[14px] font-semibold leading-none" style={{ color: theme.colors.textMain }}>
                  {projectName || "Sin nombre"}
                </p>
                <span className="opacity-0 group-hover:opacity-100 transition text-[12px]" style={{ color: theme.colors.textDim }}>
                  ✎
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bloque Selección de Tema */}
        <div className="px-3 pb-1">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest mb-2" style={{ color: theme.colors.textDim }}>
            <Palette size={12} /> ESTÉTICA
          </div>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="w-full p-2 rounded-lg border text-xs font-medium outline-none transition-all shadow-sm"
            style={{ 
              backgroundColor: theme.colors.bgWidget, 
              color: theme.colors.textMain, 
              borderColor: theme.colors.border 
            }}
          >
            {Object.keys(allThemes).map((id) => (
              <option key={id} value={id}>
                {allThemes[id].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenido (tab) */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto p-3 animate-fadeIn"
        style={{ color: theme.colors.textMain }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

const UnifiedSidebar = ({
  layoutId = null,
  projectName = "",
  onProjectNameChange,
  onSaveProject,
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
  onDeleteElement,
  onToggleElementVisibility,
  onToggleElementLock,
  onRenameElementLayer,
  onReorderLayers,
  viewsLoading = false,
  viewsError = "",
  onRefreshViews,
  isOpen: isOpenProp,
  onToggle: onToggleProp,
}) => {
  // ── Section navigation ────────────────────────────────────────────────────
  const [activeSection,  setActiveSection]  = useState("pantallas");
  const [visibleSection, setVisibleSection] = useState(null);

  useEffect(() => {
    if (activeSection) {
      setVisibleSection(activeSection);
    } else {
      const timeout = setTimeout(() => setVisibleSection(null), 180);
      return () => clearTimeout(timeout);
    }
  }, [activeSection]);

  // ── Project name ──────────────────────────────────────────────────────────
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [projectNameDraft,      setProjectNameDraft]     = useState(projectName || "");
  const [isSavingProject,       setIsSavingProject]      = useState(false);
  const [showDevices,           setShowDevices]          = useState(false);

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

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const {
    variables, varsLoading, totalVarsCount,
    expandedTables, toggleTable, fetchVariables,
  } = useVariables(layoutId);

  const {
    layers, editingLayerId, editingLayerName, setEditingLayerName,
    draggingLayerId, startLayerRename, commitLayerRename, cancelLayerRename,
    handleLayerDragStart, handleLayerDrop,
  } = useLayers({ canvasElements, onRenameElementLayer, onReorderLayers });

  const {
    customIcons, isProcessingUpload, uploadInputRef,
    iconToTemplate, handleDeleteCustomIcon, handleUploadCustomIcon,
  } = useCustomIcons();

  // ── Section toggle ────────────────────────────────────────────────────────
  const handleSectionClick = (id) => {
    setActiveSection((prev) => (prev === id ? null : id));
    if (id === "devices" && layoutId) fetchVariables();
  };

  // ── Render active tab ─────────────────────────────────────────────────────
  const renderActiveTab = (sectionId) => {
    switch (sectionId) {
      case "pantallas":
        return (
          <ScreenTab
            views={views}
            selectedViewId={selectedViewId}
            onCreateView={onCreateView}
            onSelectView={onSelectView}
            onRenameView={onRenameView}
            onDeleteView={onDeleteView}
            onRefreshViews={onRefreshViews}
            viewsLoading={viewsLoading}
            viewsError={viewsError}
            onDeleteElement={onDeleteElement}
            layers={layers}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            onToggleElementVisibility={onToggleElementVisibility}
            onToggleElementLock={onToggleElementLock}
            editingLayerId={editingLayerId}
            editingLayerName={editingLayerName}
            setEditingLayerName={setEditingLayerName}
            startLayerRename={startLayerRename}
            commitLayerRename={commitLayerRename}
            cancelLayerRename={cancelLayerRename}
            draggingLayerId={draggingLayerId}
            handleLayerDragStart={handleLayerDragStart}
            handleLayerDrop={handleLayerDrop}
          />
        );

      case "devices":
        return (
          <DevicesTab
            layoutId={layoutId}
            projectNameDraft={projectNameDraft}
            setProjectNameDraft={setProjectNameDraft}
            onProjectNameChange={onProjectNameChange}
            onSaveProject={onSaveProject}
            isSavingProject={isSavingProject}
            setIsSavingProject={setIsSavingProject}
            commitProjectName={commitProjectName}
            variables={variables}
            varsLoading={varsLoading}
            totalVarsCount={totalVarsCount}
            expandedTables={expandedTables}
            toggleTable={toggleTable}
            onOpenDeviceManager={() => setShowDevices(true)}
          />
        );

      case "elements":
        return <ElementsTab addComponentToCanvas={addComponentToCanvas} />;

      case "buttons":
        return <ButtonsTab addComponentToCanvas={addComponentToCanvas} />;

      case "custom-icons":
        return (
          <CustomIconsTab
            customIcons={customIcons}
            isProcessingUpload={isProcessingUpload}
            uploadInputRef={uploadInputRef}
            iconToTemplate={iconToTemplate}
            handleDeleteCustomIcon={handleDeleteCustomIcon}
            handleUploadCustomIcon={handleUploadCustomIcon}
            addComponentToCanvas={addComponentToCanvas}
          />
        );

      default:
        return null;
    }
  };

  // ── Shell ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex h-full min-h-0 overflow-hidden">
        <SidebarRail
          items={SIDEBAR_ITEMS}
          activeSection={activeSection}
          onSelect={handleSectionClick}
        />

        {visibleSection && (
          <div
            className={`
              w-72 h-full min-h-0 relative
              transition-all duration-200 ease-out
              ${activeSection
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 -translate-x-4 scale-95"}
            `}
          >
            <div
              className={`
                absolute inset-0 bg-black/5 pointer-events-none
                transition-opacity duration-200
                ${activeSection ? "opacity-100" : "opacity-0"}
              `}
            />
            <SidebarPanel
              activeSection={visibleSection}
              projectName={projectName}
              isEditingProjectName={isEditingProjectName}
              projectNameDraft={projectNameDraft}
              setProjectNameDraft={setProjectNameDraft}
              setIsEditingProjectName={setIsEditingProjectName}
              commitProjectName={commitProjectName}
              cancelProjectName={cancelProjectName}
            >
              {renderActiveTab(visibleSection)}
            </SidebarPanel>
          </div>
        )}
      </div>

      {showDevices && (
        <ProjectVariableModal
          open={showDevices}
          onClose={() => {
            setShowDevices(false);
            fetchVariables();
          }}
          layoutId={layoutId}
        />
      )}
    </>
  );
};

export default UnifiedSidebar;