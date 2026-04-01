// Contenedor orquestador del editor SCADA con vistas múltiples y publicación.
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedSidebar from "../components/sidebar/UnifiedSidebar";
import CanvasEditor from "../components/canvas/CanvasEditor";
import SidebarPropiedades from "../components/sidebar/SidebarPropiedades";
import NavbarPLCs from "../components/sidebar/NavbarPLCs";
import EditorLayout from "../components/layout/EditorLayout";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import LoadProjectModal from "../components/modals/LoadProjectModal";
import { RealtimeProvider } from "@/context/RealtimeProvider";
import { buildViewsData } from "../utils/viewsSerializer";
import useOrganizarScada from "../hooks/useOrganizarScada";
import { useAuthStore } from "@/store/useAuthStore";
import SidebarPropiedadesCompact from "../components/sidebar/SidebarPropiedadesCompact";
import { PanelRightClose, PanelRightOpen, SlidersHorizontal } from "lucide-react";
import Swal from "sweetalert2";

const OrganizarScada = () => {
  const navigate = useNavigate();
  const user   = useAuthStore((s) => s.user);
  const tenant = user?.client?.id;

  const {
    state: {
      canvasElements, selectedId, isPropsOpen, views,
      isLoadingViews, viewsError, currentViewId, isLoadingCanvas,
      currentLayoutId, showExportModal, isEditMode, exportName, location,
    },
    setters: {
      setSelectedId, setIsPropsOpen, setViews, setCurrentViewId,
      setCanvasElements, setCurrentLayoutId, setShowExportModal,
      setIsEditMode, setExportName,
    },
    normalizeCanvasElements, fetchUserViews,
    handleCreateView, handleSelectView, handleDeleteView,
    addComponentToCanvas, addTemplateElements,
    handleUpdateComponent, handleDeleteComponent,
    handleDropFromSidebar, confirmExport, exportToFile, handleNewDashboard,
  } = useOrganizarScada();

  const [isLiveMode,    setIsLiveMode]    = useState(false);
  const [zoom,          setZoom]          = useState(1);
  const [stageSize,     setStageSize]     = useState({ width: 0, height: 0 });
  const [showPropsPanel, setShowPropsPanel] = useState(true);
  const [showLoadModal,  setShowLoadModal]  = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [sidebarOpen,    setSidebarOpen]    = useState(true);

  const editorViewportRef = useRef(null);
  const bootstrappedRef   = useRef(false);

  const handleSaveProjectOnly = useCallback(async (name) => {
    const finalName = name?.trim() || exportName?.trim() || "Nuevo HMI";
    if (name) setExportName(finalName);
    const savedId = await confirmExport({
      filename: finalName, viewsData: { views: [] }, isUpdating: false,
    });
    setCurrentLayoutId(savedId);
    setIsEditMode(true);
    return savedId;
  }, [confirmExport, exportName, setExportName]);

  const handleLoadFromDB = useCallback((data, layoutId, name) => {
    const viewsRaw = data?.views_data?.views || [];
    const mappedViews = viewsRaw.map(v => ({
      ...v,
      id:       v.id || `view-${Date.now()}-${Math.random()}`,
      layoutId,
      elements: normalizeCanvasElements(v.elements || []),
    }));
    if (mappedViews.length === 0) {
      const empty = { id: `view-${Date.now()}`, name: "Vista 1", elements: [], layoutId };
      setViews([empty]);
      setCurrentViewId(empty.id);
      setCanvasElements([]);
    } else {
      setViews(mappedViews);
      setCurrentViewId(mappedViews[0].id);
      setCanvasElements(mappedViews[0].elements);
    }
    setCurrentLayoutId(layoutId);
    setExportName(name || data?.name || "Sin nombre");
    setIsEditMode(true);
  }, [normalizeCanvasElements, setViews, setCurrentViewId, setCanvasElements,
      setCurrentLayoutId, setExportName, setIsEditMode]);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    handleNewDashboard();
  }, [handleNewDashboard]);

  useEffect(() => {
    if (!currentViewId) return;
    setViews((prev) =>
      prev.map((v) => v.id === currentViewId ? { ...v, elements: canvasElements } : v)
    );
  }, [canvasElements, currentViewId, setViews]);

  const selectedElement = canvasElements.find((el) => el.id === selectedId) || null;

  const updateLayerSettings = (elementId, recipe) => {
    setCanvasElements((prev) =>
      prev.map((el) => {
        if (el.id !== elementId) return el;
        const prevSettings = el?.data?.settings || {};
        const nextSettings = typeof recipe === "function" ? recipe(prevSettings) : recipe;
        return { ...el, data: { ...(el.data || {}), settings: { ...prevSettings, ...(nextSettings || {}) } } };
      })
    );
  };

  const handleSelectLayer          = (id) => { setSelectedId(id); setIsPropsOpen(true); setShowPropsPanel(true); };
  const handleToggleLayerVisibility = (id) => updateLayerSettings(id, (s) => ({ is_visible: s.is_visible === false }));
  const handleToggleLayerLock       = (id) => updateLayerSettings(id, (s) => ({ is_locked: s.is_locked !== true }));
  const handleRenameLayer           = (id, alias) => updateLayerSettings(id, { layer_alias: alias });

  const handleReorderLayers = (orderedIdsTopToBottom = []) => {
    if (!orderedIdsTopToBottom.length) return;
    setCanvasElements((prev) => {
      const total = orderedIdsTopToBottom.length;
      const zMap = new Map(orderedIdsTopToBottom.map((layerId, idx) => [layerId, total - idx]));
      return prev.map((el, idx) => ({
        ...el,
        data: { ...(el.data || {}), settings: { ...((el.data?.settings) || {}), z_index: zMap.get(el.id) ?? idx + 1 } },
      }));
    });
  };

  const hasCanvasElements = Array.isArray(canvasElements) && canvasElements.length > 0;
  const hasViewElements   = Array.isArray(views) && views.some((v) => Array.isArray(v?.elements) && v.elements.length > 0);
  const isPropsPanelOpen  = showPropsPanel;
  const canvasWidth       = "1180px";
  const canvasHeight      = "710px";
  const zoomLabel         = useMemo(() => `${Math.round((zoom || 1) * 100)}%`, [zoom]);

  const ZOOM_STEP = 0.1;
  const MIN_ZOOM  = 0.3;
  const MAX_ZOOM  = 2.5;

  const handleZoomIn      = () => setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut     = () => setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  const handleResetZoom   = () => setZoom(1);
  const handleFitToScreen = () => {
    const viewport = editorViewportRef.current;
    if (!viewport || !stageSize.width || !stageSize.height) { setZoom(1); return; }
    const padding    = 32;
    const availableW = Math.max(viewport.clientWidth  - padding, 100);
    const availableH = Math.max(viewport.clientHeight - padding, 100);
    const scale      = Math.min(availableW / stageSize.width, availableH / stageSize.height);
    if (!Number.isFinite(scale) || scale <= 0) { setZoom(1); return; }
    setZoom(Math.max(MIN_ZOOM, Math.min(scale, MAX_ZOOM)));
  };

  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const newId = `dup-${Date.now()}`;
    const clone = { ...selectedElement, id: newId, x: (selectedElement.x ?? 0) + 24, y: (selectedElement.y ?? 0) + 24, data: { ...selectedElement.data } };
    setCanvasElements((prev) => [...prev, clone]);
    setSelectedId(newId);
    setIsPropsOpen(true);
  };

  const handleDeleteSelected = () => { if (!selectedId) return; handleDeleteComponent(selectedId); };

  useEffect(() => {
    if (selectedElement) setShowPropsPanel(true);
    else setShowPropsPanel(false);
  }, [selectedElement]);

  const performPublish = async (nameOverride) => {
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some((v) => Array.isArray(v.elements) && v.elements.length);
    if (!hasAnyElements) { Swal.fire("Error", "No hay elementos válidos que guardar.", "error"); return; }
    const finalName = nameOverride || exportName?.trim() || "Nuevo HMI";
    if (nameOverride) setExportName(nameOverride);
    try {
      const savedId = await confirmExport({ filename: finalName, viewsData, isUpdating: !!currentLayoutId });
      setCurrentLayoutId(savedId);
      setIsEditMode(true);
      Swal.fire({ title: "Éxito", text: `HMI ${currentLayoutId ? "actualizado" : "creado"} correctamente.`, icon: "success", timer: 2000, showConfirmButton: false });
      navigate(`/layout`);
    } catch {
      Swal.fire("Error", "Error de conexión al guardar el HMI. Intenta de nuevo.", "error");
    }
  };

  const handlePublishClick = () => {
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some((v) => Array.isArray(v.elements) && v.elements.length);
    if (!hasAnyElements) { Swal.fire("Atención", "No hay elementos válidos que guardar.", "warning"); return; }
    if (!currentLayoutId) {
      Swal.fire({ title: "Nombre del Proyecto", input: "text", inputLabel: "Ingresa el nombre para tu nuevo proyecto HMI", inputValue: exportName !== "Hmi" ? exportName : "", showCancelButton: true, confirmButtonText: "Publicar", cancelButtonText: "Cancelar", inputValidator: (v) => !v ? "¡Debes escribir un nombre!" : undefined })
        .then((r) => { if (r.isConfirmed) performPublish(r.value); });
    } else {
      Swal.fire({ title: "Confirmar Cambios", text: `¿Deseas guardar los cambios en "${exportName}"?`, icon: "question", showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText: "Sí, guardar cambios", cancelButtonText: "Cancelar" })
        .then((r) => { if (r.isConfirmed) performPublish(); });
    }
  };

  const handleNewDashboardWrapper = () => {
    if (!hasCanvasElements && !hasViewElements) { handleNewDashboard(); return; }
    Swal.fire({ title: "¿Iniciar nuevo proyecto?", text: "Si continúas, perderás los cambios no guardados.", icon: "warning", showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText: "Sí, empezar nuevo", cancelButtonText: "Cancelar" })
      .then((r) => { if (r.isConfirmed) handleNewDashboard(); });
  };

  const handleImportCanvas = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        let newViewsCandidates = [];
        if (parsed.views && Array.isArray(parsed.views) && parsed.views.length > 0) newViewsCandidates = parsed.views;
        else if (Array.isArray(parsed)) newViewsCandidates = [{ name: "Vista Importada", elements: parsed }];
        else if (parsed?.elements) newViewsCandidates = [{ name: parsed.name || "Vista Importada", elements: parsed.elements }];
        if (newViewsCandidates.length === 0) { Swal.fire("Error", "Formato inválido.", "error"); return; }
        const processedCandidates = newViewsCandidates.map((v) => ({ ...v, elements: normalizeCanvasElements(v.elements || []) }));
        const executeImport = (action) => {
          if (action === "add") {
            const ts = Date.now();
            const importedViews = processedCandidates.map((v, vIdx) => ({ ...v, id: `view-${ts}-${vIdx}-${Math.random().toString(36).substr(2, 9)}`, name: v.name || `Vista Importada ${vIdx + 1}`, elements: v.elements.map((el, eIdx) => ({ ...el, id: `el-${ts}-${vIdx}-${eIdx}-${Math.random().toString(36).substr(2, 9)}` })) }));
            setViews((prev) => [...prev, ...importedViews]);
            if (importedViews.length > 0) { setCurrentViewId(importedViews[0].id); setCanvasElements(importedViews[0].elements); }
            Swal.fire({ title: "Importación Completada", text: `Se han añadido ${importedViews.length} nuevas vistas.`, icon: "success", timer: 2000, showConfirmButton: false });
          } else {
            const mappedViews = processedCandidates.map((v) => ({ ...v, id: v.id || `view-${Date.now()}-${Math.random()}` }));
            setViews(mappedViews);
            if (mappedViews.length > 0) { setCurrentViewId(mappedViews[0].id); setCanvasElements(mappedViews[0].elements); }
            if (parsed.name) setExportName(parsed.name);
            setCurrentLayoutId(null);
            setIsEditMode(false);
            Swal.fire("Importado", `Proyecto reemplazado correctamente (${mappedViews.length} vistas).`, "success");
          }
        };
        if (views.length > 0) {
          Swal.fire({ title: "Contenido detectado", text: "¿Añadir o reemplazar?", icon: "question", showDenyButton: true, showCancelButton: true, confirmButtonText: "Añadir nuevos", denyButtonText: "Reemplazar todo", cancelButtonText: "Cancelar" })
            .then((r) => { if (r.isConfirmed) executeImport("add"); else if (r.isDenied) executeImport("replace"); });
        } else {
          executeImport("replace");
        }
      } catch (err) {
        console.error("No se pudo importar el archivo", err);
        Swal.fire("Error", "Error al leer el archivo JSON.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleExportToFile = () => {
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some((v) => Array.isArray(v.elements) && v.elements.length);
    if (!hasAnyElements) { Swal.fire("Error", "No hay elementos válidos que exportar.", "error"); return; }
    const filename    = (exportName || "Layout").replace(/\s+/g, "_");
    const blob        = new Blob([JSON.stringify(viewsData, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link        = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const canvasProps = {
    elements:     canvasElements,
    selectedId,
    onSelect:     (id) => { setSelectedId(id); setIsPropsOpen(true); },
    onUpdate:     (id, changes) => handleUpdateComponent(id, changes),
    onDelete:     handleDeleteComponent,
    onDrop:       (event, canvasEl) => handleDropFromSidebar(event, canvasEl, zoom, stageSize),
    canvasWidth,
    canvasHeight,
    zoom,
    onStageSize:  setStageSize,
    layoutId:     currentLayoutId,
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-100">
      {(isLoadingViews || isLoadingCanvas) && <LoadingOverlay message="Cargando vistas del SCADA..." />}
      {viewsError && (
        <div className="mx-6 mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-800 shadow-sm">
          {viewsError}
        </div>
      )}

      <NavbarPLCs toolbar={{
        showActions: true,
        onClear:        () => setCanvasElements([]),
        onExport:       () => { try { exportToFile(buildViewsData(views, currentViewId), exportName); } catch (err) { Swal.fire("Error", err.message || "No se pudo exportar.", "error"); } },
        onImport:       handleImportCanvas,
        onTemplateMini: () => {},
        onTemplateDashboard: () => {},
        onPublish:      handlePublishClick,
        onNewDashboard: handleNewDashboardWrapper,
        onLoadFromDB:   () => setShowLoadModal(true),
      }} />

      {showLoadModal && (
        <LoadProjectModal open={showLoadModal} onClose={() => setShowLoadModal(false)} onLoad={handleLoadFromDB} />
      )}

      <button onClick={() => navigate("/organizar-scada/script")}>Script</button>

      <div className="flex flex-1 overflow-hidden relative">
        <UnifiedSidebar
          projectName={exportName}
          onProjectNameChange={setExportName}
          layoutId={currentLayoutId}
          onSaveProject={handleSaveProjectOnly}
          views={views}
          selectedViewId={currentViewId}
          onCreateView={handleCreateView}
          onSelectView={handleSelectView}
          onRenameView={(id, name) => setViews((prev) => prev.map((v) => v.id === id ? { ...v, name } : v))}
          onDeleteView={handleDeleteView}
          addComponentToCanvas={addComponentToCanvas}
          canvasElements={canvasElements}
          selectedElementId={selectedId}
          onSelectElement={handleSelectLayer}
          onToggleElementVisibility={handleToggleLayerVisibility}
          onToggleElementLock={handleToggleLayerLock}
          onRenameElementLayer={handleRenameLayer}
          onReorderLayers={handleReorderLayers}
          viewsLoading={isLoadingViews}
          viewsError={viewsError}
          onRefreshViews={fetchUserViews}
          isOpen={sidebarOpen}
          onToggle={setSidebarOpen}
        />

        <div className="flex-1 bg-slate-100 overflow-hidden flex flex-col">
          <div className="flex flex-1 overflow-hidden px-4 pb-4 gap-4 flex-col">
              <main className="relative bg-slate-200/50 overflow-hidden flex-col justify-center items-center p-4 transition-all duration-300 flex-1 rounded-xl border border-slate-200">
            <div ref={editorViewportRef} className="relative w-full h-full">

                {isLiveMode ? (
                  <RealtimeProvider tenant={tenant}>
                    <EditorLayout
                      {...canvasProps}
                      zoom={zoom}
                      onZoomIn={handleZoomIn}
                      onZoomOut={handleZoomOut}
                      onResetZoom={handleResetZoom}
                      onFitToScreen={handleFitToScreen}
                      zoomLabel={zoomLabel}
                      isLiveMode={true}
                      onToggleLive={() => setIsLiveMode((prev) => !prev)}
                      sidebarOpen={sidebarOpen}
                      onToggleSidebar={() => setSidebarOpen((p) => !p)}
                    />
                  </RealtimeProvider>
                ) : (
                  <EditorLayout
                    {...canvasProps}
                    zoom={zoom}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetZoom={handleResetZoom}
                    onFitToScreen={handleFitToScreen}
                    zoomLabel={zoomLabel}
                    isLiveMode={false}
                    onToggleLive={() => setIsLiveMode((prev) => !prev)}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen((p) => !p)}
                  />
                )}

              </div>
            </main>
          </div>
        </div>

        <aside className={`flex flex-col border-l border-slate-200 bg-white shadow-sm transition-all duration-200 overflow-hidden shrink-0 ${showPropsPanel ? "w-72" : "w-10"}`}>
          {/* Header con toggle */}
          <div className="flex items-center justify-between h-10 px-2 border-b border-slate-200 bg-slate-50 shrink-0">
            {showPropsPanel && (
              <span className="ml-1 text-xs font-semibold tracking-wide text-slate-700 truncate">
                Propiedades
              </span>
            )}
            <button
              onClick={() => setShowPropsPanel((p) => !p)}
              title={showPropsPanel ? "Colapsar propiedades" : "Expandir propiedades"}
              className="ml-auto flex items-center justify-center w-7 h-7 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
            >
              {showPropsPanel
                ? <PanelRightClose className="w-4 h-4" />
                : <PanelRightOpen  className="w-4 h-4" />
              }
            </button>
          </div>

          {/* Contenido expandido */}
          {showPropsPanel && (
            <div className="flex-1 overflow-y-auto">
              <SidebarPropiedadesCompact
                selectedElement={selectedElement}
                onOpenAdvanced={() => setIsAdvancedOpen(true)}
              />
            </div>
          )}

          {/* Modo colapsado: indicador si hay elemento seleccionado */}
          {!showPropsPanel && selectedElement && (
            <div className="flex flex-col items-center gap-2 py-3">
              <button
                title="Abrir propiedades"
                onClick={() => setShowPropsPanel(true)}
                className="flex items-center justify-center w-7 h-7 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>
      </div>
      {isAdvancedOpen && (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
    <div className="w-[720px] max-w-[90vw] h-full bg-white shadow-2xl p-6 overflow-auto">
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-700">
          Editor avanzado
        </h2>
        <button
          onClick={() => setIsAdvancedOpen(false)}
          className="text-slate-500 hover:text-slate-800"
        >
          ✕
        </button>
      </div>

          <SidebarPropiedades
                isOpen={true}
                layoutId={currentLayoutId}
                exportName={exportName}
                onExportNameChange={setExportName}
                selectedElement={selectedElement}
                views={views}
                onChange={(changes) => {
                  selectedElement && handleUpdateComponent(selectedElement.id, changes);
                }}
                isAdvancedMode={true} 
              />

        </div>
  </div>
   
)}
    </div>
  );
};

export default OrganizarScada;