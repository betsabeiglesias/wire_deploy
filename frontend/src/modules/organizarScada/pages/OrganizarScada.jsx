import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedSidebar from "../components/UnifiedSidebar";
import CanvasEditor from "../components/CanvasEditor";
import SidebarPropiedades from "../components/SidebarPropiedades";
import NavbarPLCs from "../components/NavbarPLCs";

import { buildViewsData } from "../utils/viewsSerializer";
import useOrganizarScada from "../hooks/useOrganizarScada";

const OrganizarScada = () => {
  const navigate = useNavigate();
  const {
    state: {
      canvasElements,
      publishedViews,
      selectedId,
      views,
      isLoadingViews,
      viewsError,
      currentViewId,
      currentLayoutId,
      exportName,
    },
    setters: {
      setSelectedId,
      setIsPropsOpen,
      setViews,
      setCurrentViewId,
      setCanvasElements,
      setCurrentLayoutId,
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
    handleUpdateComponent,
    handleDeleteComponent,
    handleDropFromSidebar,
    confirmExport,
    exportToFile,
    handleNewDashboard,
  } = useOrganizarScada();

  // 1. Carga inicial de datos
  useEffect(() => {
    loadPublishedViews();
    fetchUserViews();
  }, [loadPublishedViews, fetchUserViews]);

  // 2. Garantizar que siempre haya al menos una vista si no se está cargando nada
  useEffect(() => {
    if (!isLoadingViews && views.length === 0 && !currentViewId) {
      const initialView = handleCreateView();
      setCurrentViewId(initialView.id);
      setCanvasElements([]);
    }
  }, [views.length, isLoadingViews, currentViewId, handleCreateView, setCurrentViewId, setCanvasElements]);

  // 3. Sincronizar canvasElements en el array de vistas (para que buildViewsData tenga lo último)
  useEffect(() => {
    if (!currentViewId) return;
    setViews((prev) =>
      prev.map((v) =>
        v.id === currentViewId ? { ...v, elements: canvasElements } : v
      )
    );
  }, [canvasElements, currentViewId, setViews]);

  const selectedElement = canvasElements.find((el) => el.id === selectedId) || null;
  const canvasWidth = "clamp(720px, calc(100vw - 38rem), 1400px)";

  const handlePublishClick = async () => {
    const viewsData = buildViewsData(views, currentViewId);
    const hasAnyElements = viewsData.views.some(
      (v) => Array.isArray(v.elements) && v.elements.length
    );

    if (!hasAnyElements) {
      alert("No hay elementos válidos para guardar. El canvas está vacío.");
      return;
    }

    const finalName = exportName?.trim() || "Nuevo HMI";

    try {
      const savedId = await confirmExport({
        filename: finalName,
        viewsData,
        isUpdating: !!currentLayoutId,
      });
      
      alert(`HMI ${currentLayoutId ? "actualizado" : "creado"} correctamente.`);
      navigate(`/scada/production/${savedId}`);
    } catch (err) {
      // El error ya viene filtrado por el interceptor si es 401/500
      alert("Error al guardar el HMI.");
    }
  };

  const handleImportCanvas = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Caso A: Proyecto completo
        if (parsed.views && Array.isArray(parsed.views)) {
          const mappedViews = parsed.views.map((v) => ({
            ...v,
            elements: normalizeCanvasElements(v.elements || []),
          }));
          setViews(mappedViews);
          setCurrentViewId(mappedViews[0].id);
          setCanvasElements(mappedViews[0].elements);
          setExportName(parsed.button_name || "Layout Importado");
          setCurrentLayoutId(null);
          setIsEditMode(false);
          return;
        }
        
        // Caso B: Elementos sueltos
        const elements = Array.isArray(parsed) ? parsed : parsed.elements || [];
        if (elements.length > 0) {
          const normalized = normalizeCanvasElements(elements);
          const newId = `view-${Date.now()}`;
          setViews([{ id: newId, name: "Vista Importada", elements: normalized }]);
          setCurrentViewId(newId);
          setCanvasElements(normalized);
          setCurrentLayoutId(null);
        }
      } catch (err) {
        alert("Archivo JSON no válido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="plcs-page-layout">
      <NavbarPLCs
        toolbar={{
          showActions: true,
          onClear: () => setCanvasElements([]),
          onExport: () => exportToFile(buildViewsData(views, currentViewId), exportName),
          onImport: handleImportCanvas,
          onPublish: handlePublishClick,
          onNewDashboard: handleNewDashboard,
        }}
      />

      <div className="editor-area-flex">
        <UnifiedSidebar
          views={views}
          selectedViewId={currentViewId}
          onCreateView={handleCreateView}
          onSelectView={handleSelectView}
          onRenameView={(id, name) =>
            setViews((prev) => prev.map((v) => (v.id === id ? { ...v, name } : v)))
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

        <main className="canvas-main-content" style={{ paddingRight: "1.5rem" }}>
          <h3 className="absolute top-1 left-1/2 transform -translate-x-1/2 p-2 text-xl font-semibold text-gray-700 z-10">
            {currentViewId
              ? `Editando: ${views.find((v) => v.id === currentViewId)?.name || "Vista"}`
              : "Cargando editor..."}
          </h3>

          <CanvasEditor
            elements={canvasElements}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setIsPropsOpen(true);
            }}
            onUpdate={handleUpdateComponent}
            onDelete={handleDeleteComponent}
            onDrop={handleDropFromSidebar}
            canvasWidth={canvasWidth}
            isEditMode
          />
        </main>

        <SidebarPropiedades
          isOpen={true}
          selectedViewId={currentViewId}
          onSelectView={handleSelectView}
          onCreateView={handleCreateView}
          onRenameView={(id, name) =>
            setViews((prev) => prev.map((v) => (v.id === id ? { ...v, name } : v)))
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
            selectedElement && handleUpdateComponent(selectedElement.id, changes)
          }
        />
      </div>
    </div>
  );
};

export default OrganizarScada;