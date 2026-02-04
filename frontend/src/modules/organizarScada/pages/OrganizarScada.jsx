// Contenedor orquestador del editor SCADA con vistas múltiples y publicación.
// Se apoya en el hook useOrganizarScada para mantener la lógica y en componentes modulares.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedSidebar from "../components/sidebar/UnifiedSidebar";
import CanvasEditor from "../components/canvas/CanvasEditor";
import SidebarPropiedades from "../components/sidebar/SidebarPropiedades";
import NavbarPLCs from "../components/sidebar/NavbarPLCs";
import NavbarEditor from "../components/canvas/NavbarEditor";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

import PublishModal from "../components/modals/PublishModal";
import { buildViewsData } from "../utils/viewsSerializer";
import useOrganizarScada from "../hooks/useOrganizarScada";
import Swal from "sweetalert2";

const OrganizarScada = () => {
  const navigate = useNavigate();
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

  const [zoom, setZoom] = useState(1);
  const editorViewportRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const bootstrappedRef = useRef(false);
  const [showPropsPanel, setShowPropsPanel] = useState(true);

  // Inicialización: siempre empezar en blanco
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    handleNewDashboard();
  }, [handleNewDashboard]);

  // Mantener sincronizados los elementos del canvas con la vista actual (para exportar/contar)
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
  const isPropsPanelOpen = showPropsPanel;
  const canvasWidth = "clamp(1100px, 88vw, 1600px)";
  const canvasHeight = "720px";
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
    const padding = 32; // algo de margen visual
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
    const nextZoom = Math.max(MIN_ZOOM, Math.min(scale, MAX_ZOOM));
    setZoom(nextZoom);
  };

  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const offset = 24;
    const newId = `dup-${Date.now()}`;
    const clone = {
      ...selectedElement,
      id: newId,
      x: (selectedElement.x ?? 0) + offset,
      y: (selectedElement.y ?? 0) + offset,
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

  // Abrir panel al seleccionar; cerrarlo al limpiar selección
  useEffect(() => {
    if (selectedElement) {
      setShowPropsPanel(true);
    } else {
      setShowPropsPanel(false);
    }
  }, [selectedElement]);

  /*
   * Ejecuta la lógica de guardado/publicación al API.
   * Se llama directamente si es UPDATE (tras confirmar) o desde el Modal si es NEW.
   */
  const performPublish = async (nameOverride) => {
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some(
      (v) => Array.isArray(v.elements) && v.elements.length,
    );
    if (!hasAnyElements) {
      Swal.fire("Error", "No hay elementos válidos que guardar.", "error");
      return;
    }

    // Usar el nombre proporcionado directamente (desde modal) o el del estado
    const finalName = nameOverride || exportName?.trim() || "Nuevo HMI";

    // Si llegó un nombre nuevo, actualizar el estado también
    if (nameOverride) {
      setExportName(nameOverride);
    }

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
        text: `HMI ${
          currentLayoutId ? "actualizado" : "creado"
        } correctamente.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Navegar a la página de producción con el ID guardado
      // navigate(`/scada/production/${savedId}`);
      navigate(`/layout`);
    } catch (err) {
      Swal.fire(
        "Error",
        "Error de conexión al guardar el HMI. Intenta de nuevo.",
        "error",
      );
    }
  };

  /*
   * Manejador del botón "Publicar" en la barra de tareas.
   * Decide si mostrar confirmación (Update) o abrir modal (New).
   */
  const handlePublishClick = () => {
    // 1. Validar que haya algo que guardar antes de preguntar nada
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some(
      (v) => Array.isArray(v.elements) && v.elements.length,
    );

    if (!hasAnyElements) {
      Swal.fire(
        "Atención",
        "No hay elementos válidos que guardar (el canvas está vacío).",
        "warning",
      );
      return;
    }

    if (!currentLayoutId) {
      // PROYECTO NUEVO: Pedir nombre
      Swal.fire({
        title: "Nombre del Proyecto",
        input: "text",
        inputLabel: "Ingresa el nombre para tu nuevo proyecto HMI",
        inputValue: exportName !== "Nuevo Layout" ? exportName : "",
        showCancelButton: true,
        confirmButtonText: "Publicar",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          if (!value) {
            return "¡Debes escribir un nombre para el proyecto!";
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          performPublish(result.value);
        }
      });
    } else {
      // PROYECTO EXISTENTE: Confirmar actualización
      Swal.fire({
        title: "Confirmar Cambios",
        text: `¿Deseas guardar los cambios en el proyecto "${exportName}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, guardar cambios",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          performPublish();
        }
      });
    }
  };

  const handleNewDashboardWrapper = () => {
    Swal.fire({
      title: "¿Iniciar nuevo proyecto?",
      text: "Si continúas, perderás los cambios no guardados en el lienzo actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, empezar nuevo",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        handleNewDashboard();
      }
    });
  };

  const handleImportCanvas = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        let newViewsCandidates = [];

        // 1. Extraer vistas del JSON
        if (
          parsed.views &&
          Array.isArray(parsed.views) &&
          parsed.views.length > 0
        ) {
          newViewsCandidates = parsed.views;
        } else if (Array.isArray(parsed)) {
          newViewsCandidates = [{ name: "Vista Importada", elements: parsed }];
        } else if (parsed?.elements) {
          newViewsCandidates = [
            {
              name: parsed.name || "Vista Importada",
              elements: parsed.elements,
            },
          ];
        }

        if (newViewsCandidates.length === 0) {
          Swal.fire(
            "Error",
            "El archivo no tiene un formato válido de elementos o vistas.",
            "error",
          );
          return;
        }

        // 2. Normalizar elementos
        const processedCandidates = newViewsCandidates.map((v) => ({
          ...v,
          elements: normalizeCanvasElements(v.elements || []),
        }));

        // 3. Función auxiliar para ejecutar la acción elegida
        const executeImport = (action) => {
          if (action === "add") {
            // --- MODO ADITIVO (Concatenar) ---
            const timestamp = Date.now();
            const importedViews = processedCandidates.map((v, vIdx) => {
              const newViewId = `view-${timestamp}-${vIdx}-${Math.random()
                .toString(36)
                .substr(2, 9)}`;
              return {
                ...v,
                id: newViewId,
                name: v.name || `Vista Importada ${vIdx + 1}`,
                elements: v.elements.map((el, eIdx) => ({
                  ...el,
                  id: `el-${timestamp}-${vIdx}-${eIdx}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                })),
              };
            });

            setViews((prev) => [...prev, ...importedViews]);

            if (importedViews.length > 0) {
              const firstImported = importedViews[0];
              setCurrentViewId(firstImported.id);
              setCanvasElements(firstImported.elements);
            }

            Swal.fire({
              title: "Importación Completada",
              text: `Se han añadido ${importedViews.length} nuevas vistas al proyecto.`,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            // --- MODO REEMPLAZO ---
            const mappedViews = processedCandidates.map((v) => ({
              ...v,
              id: v.id || `view-${Date.now()}-${Math.random()}`,
            }));

            setViews(mappedViews);

            if (mappedViews.length > 0) {
              const firstView = mappedViews[0];
              setCurrentViewId(firstView.id);
              setCanvasElements(firstView.elements);
            }

            if (parsed.button_name || parsed.name) {
              setExportName(parsed.button_name || parsed.name);
            }

            setCurrentLayoutId(null);
            setIsEditMode(false);

            Swal.fire(
              "Importado",
              `Proyecto reemplazado correctamente (${mappedViews.length} vistas).`,
              "success",
            );
          }
        };

        // 4. Decisión del Usuario
        if (views.length > 0) {
          Swal.fire({
            title: "Contenido detectado",
            text: "¿Deseas añadir estos elementos al diseño actual o reemplazarlos por completo?",
            icon: "question",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Añadir nuevos",
            denyButtonText: "Reemplazar todo",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              executeImport("add");
            } else if (result.isDenied) {
              executeImport("replace");
            }
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
    const dataStr = JSON.stringify(viewsData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-100">
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
            onClear: () => {
              setCanvasElements([]);
            },
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
            onTemplateMini: () => {}, // pendiente: wirear plantillas
            onTemplateDashboard: () => {}, // pendiente: wirear plantillas
            onPublish: handlePublishClick,
            onNewDashboard: handleNewDashboardWrapper,
          }}
        />

        <div className="flex flex-1 overflow-hidden relative">
          <UnifiedSidebar
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
            viewsLoading={isLoadingViews}
            viewsError={viewsError}
            onRefreshViews={fetchUserViews}
          />
          {/* Zona central: canvas + propiedades docking */}
          <div className="flex-1 bg-slate-100 overflow-hidden flex flex-col">
            <div className="flex flex-1 overflow-hidden px-4 pb-4 gap-4">
              <main className="relative bg-slate-200/50 overflow-hidden flex-col justify-center items-center p-4 transition-all duration-300 flex-1 rounded-xl border border-slate-200">
                <div className="px-1 pt-1">
                  <NavbarEditor
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetZoom={handleResetZoom}
                    onFitToScreen={handleFitToScreen}
                    zoomLabel={zoomLabel}
                    onDuplicate={handleDuplicateSelected}
                    onDeleteSelected={handleDeleteSelected}
                    showProps={showPropsPanel}
                    onToggleProps={() => setShowPropsPanel((p) => !p)}
                  />
                </div>
                <div
                  ref={editorViewportRef}
                  className="relative w-full h-full flex justify-center items-center"
                >
                  <CanvasEditor
                    elements={canvasElements}
                    selectedId={selectedId}
                    onSelect={(id) => {
                      setSelectedId(id);
                      setIsPropsOpen(true);
                    }}
                    onUpdate={(id, changes) =>
                      handleUpdateComponent(id, changes)
                    }
                    onDelete={handleDeleteComponent}
                    onDrop={(event, canvasEl) =>
                      handleDropFromSidebar(event, canvasEl, zoom, stageSize)
                    }
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    zoom={zoom}
                    onStageSize={setStageSize}
                    isEditMode
                  />
                </div>
              </main>

             
            </div>
          </div>
           {/* Panel de propiedades: dock derecho en desktop, drawer en mobile */}
              <div
                className={[
                  "md:static md:w-96 md:translate-x-0 md:translate-y-0 md:opacity-100",
                  "fixed left-0 right-0 bottom-0 z-30",
                  "transition-all duration-250 ease-out",
                  showPropsPanel
                    ? "translate-y-0 opacity-100"
                    : "md:-translate-x-full md:opacity-0 translate-y-full opacity-0 pointer-events-none",
                ].join(" ")}
              >
                <SidebarPropiedades
                  isOpen={isPropsPanelOpen}
                  exportName={exportName}
                  onExportNameChange={setExportName}
                  selectedElement={selectedElement}
                  views={views}
                  onChange={(changes) =>
                    selectedElement &&
                    handleUpdateComponent(selectedElement.id, changes)
                  }
                />
              </div>
        </div>
      </div>
    </>
  );
};

export default OrganizarScada;
