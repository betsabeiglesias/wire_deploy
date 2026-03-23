// Contenedor orquestador del editor SCADA con vistas múltiples y publicación.
// Se apoya en el hook useOrganizarScada para mantener la lógica y en componentes modulares.
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedSidebar from "../components/sidebar/UnifiedSidebar";
import CanvasEditor from "../components/canvas/CanvasEditor";
import SidebarPropiedades from "../components/sidebar/SidebarPropiedades";
import NavbarPLCs from "../components/sidebar/NavbarPLCs";

import PublishModal from "../components/modals/PublishModal";
import { buildViewsData } from "../utils/viewsSerializer";
import useOrganizarScada from "../hooks/useOrganizarScada";
import Swal from "sweetalert2";

const OrganizarScada = () => {
  const navigate = useNavigate();
  const {
    state: {
      canvasElements,
      publishedViews,
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
    loadPublishedViews,
    fetchUserViews,
    handleCreateView,
    handleSelectView,
    handleDeleteView,
    handleLoadPublishedView,
    handleOpenPublishedView,
    handleDeletePublishedView,
    addComponentToCanvas,
    addTemplateElements,
    handleUpdateComponent,
    handleDeleteComponent,
    handleDropFromSidebar,
    confirmExport,
    exportToFile,
    handleNewDashboard,
  } = useOrganizarScada();

  // Inicialización: carga publicadas y garantiza una vista inicial.
  useEffect(() => {
    loadPublishedViews();
    fetchUserViews();
    if (!views.length) {
      const initialView = handleCreateView();
      setCurrentViewId(initialView.id);
      setCanvasElements(initialView.elements || []);
    }
  }, [
    fetchUserViews,
    handleCreateView,
    loadPublishedViews,
    setCanvasElements,
    setCurrentViewId,
    views.length,
  ]);

  // Mantener sincronizados los elementos del canvas con la vista actual (para exportar/contar)
  useEffect(() => {
    if (!currentViewId) return;
    setViews((prev) =>
      prev.map((v) =>
        v.id === currentViewId ? { ...v, elements: canvasElements } : v
      )
    );
  }, [canvasElements, currentViewId, setViews]);

  const selectedElement =
    canvasElements.find((el) => el.id === selectedId) || null;
  const isPropsPanelOpen = true;
  const canvasWidth = "clamp(720px, calc(102vw - 38rem), 1200px)";

  /*
   * Ejecuta la lógica de guardado/publicación al API.
   * Se llama directamente si es UPDATE (tras confirmar) o desde el Modal si es NEW.
   */
  const performPublish = async (nameOverride) => {
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some(
      (v) => Array.isArray(v.elements) && v.elements.length
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
      navigate(`/scada/production/${savedId}`);
      //navigate(`/layout`);
    } catch (err) {
      Swal.fire(
        "Error",
        "Error de conexión al guardar el HMI. Intenta de nuevo.",
        "error"
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
      (v) => Array.isArray(v.elements) && v.elements.length
    );

    if (!hasAnyElements) {
      Swal.fire(
        "Atención",
        "No hay elementos válidos que guardar (el canvas está vacío).",
        "warning"
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

        // CASO A: Estructura completa de proyecto con múltiples vistas
        if (
          parsed.views &&
          Array.isArray(parsed.views) &&
          parsed.views.length > 0
        ) {
          const mappedViews = parsed.views.map((v) => ({
            ...v,
            elements: normalizeCanvasElements(v.elements || []),
          }));

          setViews(mappedViews);
          // Cargar la primera vista
          const firstView = mappedViews[0];
          setCurrentViewId(firstView.id);
          setCanvasElements(firstView.elements || []);
          setExportName(
            parsed.name || parsed.name || "Layout Importado"
          );

          // Si tiene ID, podríamos conservarlo o resetearlo.
          // Para "Importar", generalmente queremos crear una copia/nuevo, así que limpiamos LayoutId para evitar sobreescribir el original
          // Opcional: preguntar al usuario. Por defecto: Nuevo proyecto basado en este JSON.
          setCurrentLayoutId(null);
          setIsEditMode(false);

          Swal.fire(
            "Importado",
            `Importadas ${mappedViews.length} vistas correctamente.`,
            "success"
          );
          return;
        }

        // CASO B: Estructura antigua o array directo (Solo elementos de una vista)
        let newElements = [];
        if (Array.isArray(parsed)) {
          newElements = parsed;
        } else if (parsed?.elements) {
          newElements = parsed.elements;
        }

        if (newElements && newElements.length > 0) {
          // Crear una estructura de vista única envolviendo los elementos
          const normalized = normalizeCanvasElements(newElements);
          const singleView = {
            id: `view-${Date.now()}`,
            name: "Vista Importada",
            elements: normalized,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setViews([singleView]);
          setCurrentViewId(singleView.id);
          setCanvasElements(normalized);
          setExportName(parsed.name || "HMI Importado");
          setCurrentLayoutId(null);
          setIsEditMode(false);

          Swal.fire(
            "Importado",
            "Vista única importada correctamente.",
            "success"
          );
        } else {
          Swal.fire(
            "Error",
            "El archivo no tiene un formato válido de elementos o vistas.",
            "error"
          );
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
      (v) => Array.isArray(v.elements) && v.elements.length
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
      <div className="plcs-page-layout">
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
                  "error"
                );
              }
            },
            onImport: handleImportCanvas,
            onTemplateMini: () => {}, // pendiente: wirear plantillas
            onTemplateDashboard: () => {}, // pendiente: wirear plantillas
            onTemplateMini: () => {}, // pendiente: wirear plantillas
            onTemplateDashboard: () => {}, // pendiente: wirear plantillas
            onPublish: handlePublishClick,
            onNewDashboard: handleNewDashboardWrapper,
          }}
        />

        <div className="editor-area-flex">
          <UnifiedSidebar
            views={views}
            selectedViewId={currentViewId}
            onCreateView={handleCreateView}
            onSelectView={handleSelectView}
            onRenameView={(id, name) =>
              setViews((prev) =>
                prev.map((v) => (v.id === id ? { ...v, name } : v))
              )
            }
            onDeleteView={handleDeleteView}
            addComponentToCanvas={addComponentToCanvas}
            publishedViews={publishedViews}
            onLoadScreen={handleLoadPublishedView}
            onOpenScreen={handleOpenPublishedView}
            onDeleteScreen={handleDeletePublishedView}
            viewsLoading={isLoadingViews}
            viewsError={viewsError}
            onRefreshViews={fetchUserViews}
          />
          {/* canvas-main-content */}
          <main className=" transition-all duration-300 ease-in-out">
            {/* <h3 className="absolute top-13 left-1/2 transform -translate-x-1/2 p-2 text-xl font-semibold text-gray-700 z-10">
              {currentViewId
                ? `Editando Vista: ${
                    views.find(v => v.id === currentViewId)?.name ||
                    currentViewId
                  }`
                : "Canvas SCADA"}
            </h3> */}

            <CanvasEditor
              elements={canvasElements}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setIsPropsOpen(true);
              }}
              onUpdate={(id, changes) => handleUpdateComponent(id, changes)}
              onDelete={handleDeleteComponent}
              onDrop={handleDropFromSidebar}
              canvasWidth={canvasWidth}
              isEditMode
            />
          </main>

          <SidebarPropiedades
            isOpen={isPropsPanelOpen}
            selectedViewId={currentViewId}
            onSelectView={handleSelectView}
            onCreateView={handleCreateView}
            onRenameView={(id, name) =>
              setViews((prev) =>
                prev.map((v) => (v.id === id ? { ...v, name } : v))
              )
            }
            onDeleteView={handleDeleteView}
            publishedViews={publishedViews}
            onLoadScreen={handleLoadPublishedView}
            onOpenScreen={handleOpenPublishedView}
            onDeleteScreen={handleDeletePublishedView}
            viewsLoading={isLoadingViews}
            viewsError={viewsError}
            onRefreshViews={fetchUserViews}
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
    </>
  );
};

export default OrganizarScada;
