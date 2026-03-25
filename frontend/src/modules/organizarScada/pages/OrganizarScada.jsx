// Contenedor orquestador del editor SCADA con vistas múltiples y publicación.
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import UnifiedSidebar from "../components/sidebar/UnifiedSidebar";
import CanvasEditor from "../components/canvas/CanvasEditor";
import SidebarPropiedades from "../components/sidebar/SidebarPropiedades";
import NavbarPLCs from "../components/sidebar/NavbarPLCs";
import NavbarEditor from "../components/canvas/NavbarEditor";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import LoadProjectModal from "../components/modals/LoadProjectModal";
import { RealtimeProvider } from "@/context/RealtimeProvider";
import { buildViewsData } from "../utils/viewsSerializer";
import useOrganizarScada from "../hooks/useOrganizarScada";
import { useAuthStore } from "@/store/useAuthStore";
import Swal from "sweetalert2";

const OrganizarScada = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const tenant = user?.client?.id;

  const {
    state: {
      canvasElements,
      selectedId,
      isPropsOpen,
      views,
      isLoadingViews,
      viewsError,
      currentViewId,
      isLoadingCanvas,
      currentLayoutId,
      showExportModal,
      isEditMode,
      exportName,
      location,
    },
    setters: {
      setSelectedId,
      setIsPropsOpen,
      setViews,
      setCurrentViewId,
      setCanvasElements,
      setCurrentLayoutId,
      setShowExportModal,
      setIsEditMode,
      setExportName,
    },
    normalizeCanvasElements,
    fetchUserViews,
    handleCreateView,
    handleSelectView,
    handleDeleteView,
    addComponentToCanvas,
    addTemplateElements,
    handleUpdateComponent,
    handleDeleteComponent,
    handleDropFromSidebar,
    confirmExport,
    exportToFile,
    handleNewDashboard,
  } = useOrganizarScada();

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [showPropsPanel, setShowPropsPanel] = useState(true);
  const [showLoadModal, setShowLoadModal] = useState(false);

  const editorViewportRef = useRef(null);
  const bootstrappedRef = useRef(false);

  const handleSaveProjectOnly = useCallback(
    async (name) => {
      const finalName = name?.trim() || exportName?.trim() || "Nuevo HMI";
      if (name) setExportName(finalName);
      const savedId = await confirmExport({
        filename: finalName,
        viewsData: { views: [] },
        isUpdating: false,
      });
      setCurrentLayoutId(savedId);
      setIsEditMode(true);
      return savedId;
    },
    [confirmExport, exportName, setExportName],
  );

  const handleLoadFromDB = useCallback(
    (data, layoutId, name) => {
      const viewsRaw = data?.views_data?.views || [];
      const mappedViews = viewsRaw.map((v) => ({
        ...v,
        id: v.id || `view-${Date.now()}-${Math.random()}`,
        layoutId,
        elements: normalizeCanvasElements(v.elements || []),
      }));
      if (mappedViews.length === 0) {
        const empty = {
          id: `view-${Date.now()}`,
          name: "Vista 1",
          elements: [],
          layoutId,
        };
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
    },
    [
      normalizeCanvasElements,
      setViews,
      setCurrentViewId,
      setCanvasElements,
      setCurrentLayoutId,
      setExportName,
      setIsEditMode,
    ],
  );

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    handleNewDashboard();
  }, [handleNewDashboard]);

  useEffect(() => {
    if (!currentViewId) return;
    setViews((prev) =>
      prev.map((v) =>
        v.id === currentViewId ? { ...v, elements: canvasElements } : v,
      ),
    );
  }, [canvasElements, currentViewId, setViews]);

  const selectedElement =
    canvasElements.find((el) => el.id === selectedId) || null;

  const updateLayerSettings = (elementId, recipe) => {
    setCanvasElements((prev) =>
      prev.map((el) => {
        if (el.id !== elementId) return el;
        const prevSettings = el?.data?.settings || {};
        const nextSettings =
          typeof recipe === "function" ? recipe(prevSettings) : recipe;
        return {
          ...el,
          data: {
            ...(el.data || {}),
            settings: { ...prevSettings, ...(nextSettings || {}) },
          },
        };
      }),
    );
  };

  const handleSelectLayer = (id) => {
    setSelectedId(id);
    setIsPropsOpen(true);
    setShowPropsPanel(true);
  };
  const handleToggleLayerVisibility = (id) =>
    updateLayerSettings(id, (s) => ({ is_visible: s.is_visible === false }));
  const handleToggleLayerLock = (id) =>
    updateLayerSettings(id, (s) => ({ is_locked: s.is_locked !== true }));
  const handleRenameLayer = (id, alias) =>
    updateLayerSettings(id, { layer_alias: alias });

  const handleReorderLayers = (orderedIdsTopToBottom = []) => {
    if (!orderedIdsTopToBottom.length) return;
    setCanvasElements((prev) => {
      const total = orderedIdsTopToBottom.length;
      const zMap = new Map(
        orderedIdsTopToBottom.map((layerId, idx) => [layerId, total - idx]),
      );
      return prev.map((el, idx) => ({
        ...el,
        data: {
          ...(el.data || {}),
          settings: {
            ...(el.data?.settings || {}),
            z_index: zMap.get(el.id) ?? idx + 1,
          },
        },
      }));
    });
  };

  const hasCanvasElements =
    Array.isArray(canvasElements) && canvasElements.length > 0;
  const hasViewElements =
    Array.isArray(views) &&
    views.some((v) => Array.isArray(v?.elements) && v.elements.length > 0);
  const isPropsPanelOpen = showPropsPanel;
  const canvasWidth = "100rem";
  const canvasHeight = "49rem";
  const zoomLabel = useMemo(() => `${Math.round((zoom || 1) * 100)}%`, [zoom]);

  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.3;
  const MAX_ZOOM = 2.5;

  const handleZoomIn = () =>
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () =>
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  const handleResetZoom = () => setZoom(1);
  const handleFitToScreen = () => {
    const viewport = editorViewportRef.current;
    if (!viewport || !stageSize.width || !stageSize.height) {
      setZoom(1);
      return;
    }
    const padding = 32;
    const availableW = Math.max(viewport.clientWidth - padding, 100);
    const availableH = Math.max(viewport.clientHeight - padding, 100);
    const scale = Math.min(
      availableW / stageSize.width,
      availableH / stageSize.height,
    );
    if (!Number.isFinite(scale) || scale <= 0) {
      setZoom(1);
      return;
    }
    setZoom(Math.max(MIN_ZOOM, Math.min(scale, MAX_ZOOM)));
  };

  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const newId = `dup-${Date.now()}`;
    const clone = {
      ...selectedElement,
      id: newId,
      x: (selectedElement.x ?? 0) + 24,
      y: (selectedElement.y ?? 0) + 24,
      data: { ...selectedElement.data },
    };
    setCanvasElements((prev) => [...prev, clone]);
    setSelectedId(newId);
    setIsPropsOpen(true);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    handleDeleteComponent(selectedId);
  };

  useEffect(() => {
    if (selectedElement) setShowPropsPanel(true);
    else setShowPropsPanel(false);
  }, [selectedElement]);

  const performPublish = async (nameOverride) => {
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some(
      (v) => Array.isArray(v.elements) && v.elements.length,
    );
    if (!hasAnyElements) {
      Swal.fire("Error", "No hay elementos válidos que guardar.", "error");
      return;
    }
    const finalName = nameOverride || exportName?.trim() || "Nuevo HMI";
    if (nameOverride) setExportName(nameOverride);
    try {
      const savedId = await confirmExport({
        filename: finalName,
        viewsData,
        isUpdating: !!currentLayoutId,
      });
      setCurrentLayoutId(savedId);
      setIsEditMode(true);
      Swal.fire({
        title: "Éxito",
        text: `HMI ${currentLayoutId ? "actualizado" : "creado"} correctamente.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate(`/layout`);
    } catch {
      Swal.fire(
        "Error",
        "Error de conexión al guardar el HMI. Intenta de nuevo.",
        "error",
      );
    }
  };

  const handlePublishClick = () => {
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some(
      (v) => Array.isArray(v.elements) && v.elements.length,
    );
    if (!hasAnyElements) {
      Swal.fire("Atención", "No hay elementos válidos que guardar.", "warning");
      return;
    }
    if (!currentLayoutId) {
      Swal.fire({
        title: "Nombre del Proyecto",
        input: "text",
        inputLabel: "Ingresa el nombre para tu nuevo proyecto HMI",
        inputValue: exportName !== "Hmi" ? exportName : "",
        showCancelButton: true,
        confirmButtonText: "Publicar",
        cancelButtonText: "Cancelar",
        inputValidator: (v) => (!v ? "¡Debes escribir un nombre!" : undefined),
      }).then((r) => {
        if (r.isConfirmed) performPublish(r.value);
      });
    } else {
      Swal.fire({
        title: "Confirmar Cambios",
        text: `¿Deseas guardar los cambios en "${exportName}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, guardar cambios",
        cancelButtonText: "Cancelar",
      }).then((r) => {
        if (r.isConfirmed) performPublish();
      });
    }
  };

  const handleNewDashboardWrapper = () => {
    if (!hasCanvasElements && !hasViewElements) {
      handleNewDashboard();
      return;
    }
    Swal.fire({
      title: "¿Iniciar nuevo proyecto?",
      text: "Si continúas, perderás los cambios no guardados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, empezar nuevo",
      cancelButtonText: "Cancelar",
    }).then((r) => {
      if (r.isConfirmed) handleNewDashboard();
    });
  };

  const handleImportCanvas = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        let newViewsCandidates = [];
        if (
          parsed.views &&
          Array.isArray(parsed.views) &&
          parsed.views.length > 0
        )
          newViewsCandidates = parsed.views;
        else if (Array.isArray(parsed))
          newViewsCandidates = [{ name: "Vista Importada", elements: parsed }];
        else if (parsed?.elements)
          newViewsCandidates = [
            {
              name: parsed.name || "Vista Importada",
              elements: parsed.elements,
            },
          ];
        if (newViewsCandidates.length === 0) {
          Swal.fire("Error", "Formato inválido.", "error");
          return;
        }
        const processedCandidates = newViewsCandidates.map((v) => ({
          ...v,
          elements: normalizeCanvasElements(v.elements || []),
        }));
        const executeImport = (action) => {
          if (action === "add") {
            const ts = Date.now();
            const importedViews = processedCandidates.map((v, vIdx) => ({
              ...v,
              id: `view-${ts}-${vIdx}-${Math.random().toString(36).substr(2, 9)}`,
              name: v.name || `Vista Importada ${vIdx + 1}`,
              elements: v.elements.map((el, eIdx) => ({
                ...el,
                id: `el-${ts}-${vIdx}-${eIdx}-${Math.random().toString(36).substr(2, 9)}`,
              })),
            }));
            setViews((prev) => [...prev, ...importedViews]);
            if (importedViews.length > 0) {
              setCurrentViewId(importedViews[0].id);
              setCanvasElements(importedViews[0].elements);
            }
            Swal.fire({
              title: "Importación Completada",
              text: `Se han añadido ${importedViews.length} nuevas vistas.`,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            const mappedViews = processedCandidates.map((v) => ({
              ...v,
              id: v.id || `view-${Date.now()}-${Math.random()}`,
            }));
            setViews(mappedViews);
            if (mappedViews.length > 0) {
              setCurrentViewId(mappedViews[0].id);
              setCanvasElements(mappedViews[0].elements);
            }
            if (parsed.name) setExportName(parsed.name);
            setCurrentLayoutId(null);
            setIsEditMode(false);
            Swal.fire(
              "Importado",
              `Proyecto reemplazado correctamente (${mappedViews.length} vistas).`,
              "success",
            );
          }
        };
        if (views.length > 0) {
          Swal.fire({
            title: "Contenido detectado",
            text: "¿Añadir o reemplazar?",
            icon: "question",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Añadir nuevos",
            denyButtonText: "Reemplazar todo",
            cancelButtonText: "Cancelar",
          }).then((r) => {
            if (r.isConfirmed) executeImport("add");
            else if (r.isDenied) executeImport("replace");
          });
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
    const hasAnyElements = viewsData.views.some(
      (v) => Array.isArray(v.elements) && v.elements.length,
    );
    if (!hasAnyElements) {
      Swal.fire("Error", "No hay elementos válidos que exportar.", "error");
      return;
    }
    const filename = (exportName || "Layout").replace(/\s+/g, "_");
    const blob = new Blob([JSON.stringify(viewsData, null, 2)], {
      type: "application/json",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const canvasProps = {
    elements: canvasElements,
    selectedId,
    onSelect: (id) => {
      setSelectedId(id);
      setIsPropsOpen(true);
    },
    onUpdate: (id, changes) => handleUpdateComponent(id, changes),
    onDelete: handleDeleteComponent,
    onDrop: (event, canvasEl) =>
      handleDropFromSidebar(event, canvasEl, zoom, stageSize),
    canvasWidth,
    canvasHeight,
    zoom,
    onStageSize: setStageSize,
    layoutId: currentLayoutId,
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100">
      {(isLoadingViews || isLoadingCanvas) && (
        <LoadingOverlay message="Cargando vistas del SCADA..." />
      )}
      {viewsError && (
        <div className="mx-6 mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-800 shadow-sm">
          {viewsError}
        </div>
      )}

      <NavbarPLCs
        toolbar={{
          showActions: true,
          onClear: () => setCanvasElements([]),
          onExport: () => {
            try {
              exportToFile(buildViewsData(views, currentViewId), exportName);
            } catch (err) {
              Swal.fire(
                "Error",
                err.message || "No se pudo exportar.",
                "error",
              );
            }
          },
          onImport: handleImportCanvas,
          onTemplateMini: () => {},
          onTemplateDashboard: () => {},
          onPublish: handlePublishClick,
          onNewDashboard: handleNewDashboardWrapper,
          onLoadFromDB: () => setShowLoadModal(true),
        }}
      />

      {showLoadModal && (
        <LoadProjectModal
          open={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          onLoad={handleLoadFromDB}
        />
      )}

      <div className="relative flex flex-1 overflow-hidden">
        <div className="absolute inset-y-2 left-2 z-30 md:static md:inset-auto md:z-auto">
          <UnifiedSidebar
            projectName={exportName}
            onProjectNameChange={setExportName}
            layoutId={currentLayoutId}
            onSaveProject={handleSaveProjectOnly}
            views={views}
            selectedViewId={currentViewId}
            onCreateView={handleCreateView}
            onSelectView={handleSelectView}
            onRenameView={(id, name) =>
              setViews((prev) =>
                prev.map((v) => (v.id === id ? { ...v, name } : v)),
              )
            }
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
          />
        </div>

        <div className="flex flex-1 min-w-0 flex-col overflow-hidden bg-slate-100">
          <div className="flex flex-1 flex-col gap-3 overflow-hidden px-2 pb-2 pt-2 md:gap-4 md:px-4 md:pb-4">
            <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-200/50 p-2 transition-all duration-300 md:p-4">
              <div className="pointer-events-none absolute left-3 top-3 z-20 md:left-5 md:top-5">
                <div className="pointer-events-auto w-fit max-w-[calc(100vw-7rem)] md:max-w-[calc(100vw-12rem)]">
                  <NavbarEditor
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetZoom={handleResetZoom}
                    onFitToScreen={handleFitToScreen}
                    zoomLabel={zoomLabel}
                    onDuplicate={handleDuplicateSelected}
                    onDeleteSelected={handleDeleteSelected}
                    onOpenScript={() => navigate("/organizar-scada/script")}
                    showProps={showPropsPanel}
                    onToggleProps={() => setShowPropsPanel((p) => !p)}
                    isLiveMode={isLiveMode}
                    onToggleLive={() => setIsLiveMode((prev) => !prev)}
                  />
                </div>
              </div>

              <div
                ref={editorViewportRef}
                className="relative flex h-full w-full items-stretch"
              >
                {isLiveMode ? (
                  <RealtimeProvider tenant={tenant}>
                    <CanvasEditor {...canvasProps} isLiveMode={true} />
                  </RealtimeProvider>
                ) : (
                  <CanvasEditor {...canvasProps} isLiveMode={false} />
                )}
              </div>
            </main>
          </div>
        </div>

        <div
          className={[
            "absolute inset-x-2 bottom-2 z-30 md:inset-x-auto md:bottom-6 md:right-6 md:top-20",
            "transition-all duration-250 ease-out",
            showPropsPanel
              ? "translate-y-0 opacity-100 md:translate-x-0"
              : "translate-y-full opacity-0 md:translate-x-6 pointer-events-none",
          ].join(" ")}
        >
          <div className="pointer-events-auto w-full md:w-[380px] md:max-w-[38vw]">
            <SidebarPropiedades
              isOpen={isPropsPanelOpen}
              layoutId={currentLayoutId}
              exportName={exportName}
              onExportNameChange={setExportName}
              selectedElement={selectedElement}
              views={views}
              onChange={(changes) => {
                selectedElement &&
                  handleUpdateComponent(selectedElement.id, changes);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizarScada;
