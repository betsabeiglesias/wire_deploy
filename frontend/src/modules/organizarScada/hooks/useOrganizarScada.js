import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const CURRENT_VIEW_KEY = "scadaCurrentView";

const sanitizeForSave = (value) =>
  JSON.parse(
    JSON.stringify(value, (_k, v) => {
      if (typeof v === "function") return undefined;
      if (v === undefined) return null;
      return v;
    })
  );

const normalizeCanvasElements = (items = []) => {
  // Acepta arrays, objetos con .elements o diccionarios; evita fallar si no es iterable
  const arr = Array.isArray(items)
    ? items
    : items && typeof items === "object"
      ? Array.isArray(items.elements)
        ? items.elements
        : Object.values(items)
      : [];
  const baseId = Date.now();
  return arr.map((item, idx) => ({
    id: item?.id || `${baseId}-${idx}`,
    x: item?.x ?? 100,
    y: item?.y ?? 100,
    data: item?.data || item || {},
  }));
};

export const useOrganizarScada = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isPropsOpen, setIsPropsOpen] = useState(false);
  const [views, setViews] = useState([]);
  const [isLoadingViews, setIsLoadingViews] = useState(false);
  const [viewsError, setViewsError] = useState("");
  const [currentViewId, setCurrentViewId] = useState(null);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(false);
  const [skipRemoteViews, setSkipRemoteViews] = useState(false);
  const viewsRef = useRef([]);
  const [currentLayoutId, setCurrentLayoutId] = useState(
    location.state?.layoutId || null
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(
    location.state?.editMode || false
  );
  const [exportName, setExportName] = useState(
    location.state?.layoutId ? location.state?.layOutName : "Nuevo Layout"
  );

  useEffect(() => {
    viewsRef.current = views;
  }, [views]);

  const fetchUserViews = useCallback(async () => {
    if (skipRemoteViews) return viewsRef.current;
    setIsLoadingViews(true);
    setViewsError("");

    try {
      const response = await api.get("/api/scada/my-layouts/");
      const data = response.data;
      const normalized = Array.isArray(data)
        ? data.map((item) => ({
            id: item.id,
            layoutId: item.id,
            name: item.name || item.name || `Vista ${item.id}`,
            elements: Array.isArray(item.elements)
              ? normalizeCanvasElements(item.elements)
              : [],
            updatedAt: item.updated_at || item.updatedAt,
          }))
        : [];
      if (viewsRef.current.length) return viewsRef.current;
      setViews(normalized);
      return normalized;
    } catch (err) {
      const status = err.response?.status;
      const msg =
        status >= 500
          ? "El servidor de vistas no responde (5xx). Usando vistas locales."
          : `Error al obtener vistas (${status || "desconocido"}).`;
      console.error(msg);
      setViewsError(msg);
      if (status >= 500) setSkipRemoteViews(true);
      return viewsRef.current;
    } finally {
      setIsLoadingViews(false);
    }
  }, [skipRemoteViews]);

  const loadViewDetail = useCallback(
    async (viewId) => {

      const response = await api.get(`/api/scada/layout/${viewId}/`);
      const data = response.data;
      const elementsRaw = Array.isArray(data) ? data : data?.elements || [];
      return {
        name: data?.name || data?.name,
        elements: normalizeCanvasElements(elementsRaw),
        updatedAt: data?.updated_at || data?.updatedAt,
        viewsData: data?.views_data,
      };
    },
    []
  );

  const handleCreateView = useCallback(() => {
    const newView = {
      id: `view-${Date.now()}`,
      name: `Vista ${views.length + 1}`,
      elements: [],
      layoutId: currentLayoutId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedViews = [...views, newView];
    setViews(updatedViews);
    setCurrentViewId(newView.id);
    setCanvasElements([]);
    setCurrentLayoutId((prev) => prev ?? currentLayoutId);
    setIsEditMode(!!currentLayoutId);
    setExportName((prev) => prev || newView.name);
    localStorage.setItem(CURRENT_VIEW_KEY, newView.id);
    setSelectedId(null);
    setIsPropsOpen(false);
    return newView;
  }, [views, currentLayoutId]);

  const handleSelectView = useCallback(
    async (viewId, viewsArray) => {
      const viewsToUse = viewsArray || viewsRef.current;
      const view = viewsToUse.find((v) => v.id === viewId);
      if (!view) return;

      setSelectedId(null);
      setIsPropsOpen(false);
      setCurrentViewId(viewId);
      localStorage.setItem(CURRENT_VIEW_KEY, viewId);

      const layoutId = view.layoutId ?? currentLayoutId ?? null;
      if (!layoutId && !view.elements?.length) {
        setCanvasElements([]);
        setCurrentLayoutId(null);
        setIsEditMode(false);
        return;
      }

      if (view.elements && view.elements.length) {
        setCanvasElements(view.elements);
        setCurrentLayoutId(layoutId);
        setIsEditMode(!!layoutId);
        return;
      }

      try {
        setIsLoadingCanvas(true);
        const detail = await loadViewDetail(viewId);
        const updatedView = {
          ...view,
          name: detail.name || view.name,
          elements: detail.elements,
          updatedAt: detail.updatedAt || view.updatedAt,
          layoutId: layoutId || viewId,
        };
        setViews((prev) =>
          prev.map((v) => (v.id === viewId ? updatedView : v))
        );
        setCanvasElements(detail.elements);
        setCurrentLayoutId(updatedView.layoutId);
        setExportName(updatedView.name || "");
        setIsEditMode(true);
      } catch (err) {
        console.error("No se pudo cargar la vista desde el backend", err);
        setCanvasElements(view.elements || []);
        setCurrentLayoutId(layoutId);
        setIsEditMode(!!layoutId);
      } finally {
        setIsLoadingCanvas(false);
      }
    },
    [currentLayoutId, loadViewDetail]
  );

  const handleDeleteView = useCallback(
    async (viewId) => {
      const targetView = viewsRef.current.find((v) => v.id === viewId);
      if (!targetView) return;
      const layoutIdToDelete = targetView.layoutId || viewId;

      if (!targetView.layoutId) {
        const updatedViews = viewsRef.current.filter((v) => v.id !== viewId);
        setViews(updatedViews);
        if (currentViewId === viewId) {
          if (updatedViews.length > 0) {
            handleSelectView(updatedViews[0].id, updatedViews);
          } else {
            setCurrentViewId(null);
            setCanvasElements([]);
            localStorage.removeItem(CURRENT_VIEW_KEY);
          }
        }
        return;
      }

      const response = await api.delete(`/api/scada/layout/${layoutIdToDelete}/`);
      if (response.status === 204 || response.status === 200) {
        const updatedViews = viewsRef.current.filter((v) => v.id !== viewId);
        setViews(updatedViews);
        if (currentViewId === viewId) {
          if (updatedViews.length > 0) {
            handleSelectView(updatedViews[0].id, updatedViews);
          } else {
            setCurrentViewId(null);
            setCanvasElements([]);
            localStorage.removeItem(CURRENT_VIEW_KEY);
          }
        }
      } else if (response.status === 404) {
        alert("La vista ya no existe en el servidor.");
      } else if (response.status === 403) {
        alert("No tienes permisos para eliminar esta vista.");
      } else {
        alert("Error al eliminar la vista.");
      }
    },
    [currentViewId, handleSelectView]
  );

  const addComponentToCanvas = useCallback((data) => {
    const newComponent = {
      id: Date.now(),
      x: 100,
      y: 100,
      data,
    };
    setCanvasElements((prevItems) => [...prevItems, newComponent]);
  }, []);

  const addTemplateElements = useCallback((elements) => {
    setCanvasElements((prevItems) => [...prevItems, ...elements]);
  }, []);

  const handleUpdateComponent = useCallback(
    (id, newWidthOrChanges, newHeight, newX, newY) => {
      setCanvasElements((prevItems) =>
        prevItems.map((item) => {
          if (item.id !== id) return item;
          if (typeof newWidthOrChanges === "object" && newWidthOrChanges !== null) {
            const changes = newWidthOrChanges;
            return {
              ...item,
              ...changes,
              data: { ...item.data, ...changes.data, ...changes },
            };
          }
          const newWidth = newWidthOrChanges;
          return {
            ...item,
            x: newX !== undefined ? newX : item.x,
            y: newY !== undefined ? newY : item.y,
            data: {
              ...item.data,
              width: newWidth !== undefined ? newWidth : item.data?.width,
              height: newHeight !== undefined ? newHeight : item.data?.height,
            },
            width: newWidth !== undefined ? newWidth : item.width,
            height: newHeight !== undefined ? newHeight : item.height,
          };
        })
      );
    },
    []
  );

  const handleDeleteComponent = useCallback((id) => {
    setCanvasElements((prevItems) => prevItems.filter((item) => item.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleDropFromSidebar = useCallback(
    (event, canvasEl, zoom = 1, stageSize) => {
      if (!canvasEl) return;
      const tplRaw = event.dataTransfer.getData("application/x-scada-template");
      if (!tplRaw) return;
      event.preventDefault();
      try {
        const tpl = JSON.parse(tplRaw);
        const rect = canvasEl.getBoundingClientRect();
        const zoomFactor = zoom || 1;
        const x = (event.clientX - rect.left) / zoomFactor;
        const y = (event.clientY - rect.top) / zoomFactor;
        const width = Number(tpl.width ?? tpl.data?.width) || 220;
        const height = Number(tpl.height ?? tpl.data?.height) || 220;
        const canvasWidth =
          stageSize?.width || rect.width / zoomFactor || rect.width;
        const canvasHeight =
          stageSize?.height || rect.height / zoomFactor || rect.height;
        let newX = Number(x - width / 2);
        let newY = Number(y - height / 2);
        const maxX = canvasWidth - width;
        const maxY = canvasHeight - height;
        const isOutside =
          newX < 0 || newY < 0 || newX > maxX || newY > maxY;
        if (isOutside) {
          newX = canvasWidth / 2 - width / 2;
          newY = canvasHeight / 2 - height / 2;
        } else {
          newX = Math.max(0, Math.min(newX, maxX));
          newY = Math.max(0, Math.min(newY, maxY));
        }
        // Si por algún motivo quedan valores no finitos, caer al centro
        if (!Number.isFinite(newX) || !Number.isFinite(newY)) {
          newX = canvasWidth / 2 - width / 2;
          newY = canvasHeight / 2 - height / 2;
        }
        const element = {
          id: Date.now(),
          x: newX,
          y: newY,
          width,
          height,
          data: tpl.data || tpl,
        };
        setCanvasElements((prev) => [...prev, element]);
        setSelectedId(element.id);
        setIsPropsOpen(true);
      } catch (err) {
        console.error("No se pudo procesar la plantilla arrastrada", err);
      }
    },
    []
  );

  const handleLoadPublishedView = useCallback(
    () => {}
  );

  const handleOpenPublishedView = useCallback(
    () => {}
  );

  const handleDeletePublishedView = useCallback(async (viewId) => {
    console.warn("handleDeletePublishedView llamado pero publicaciones están deshabilitadas");
    return viewId;
  }, []);

  const confirmExport = useCallback(
    async ({ filename, viewsData, isUpdating }) => {
      const payload = { name: filename, views_data: viewsData };
      const apiUrl = isUpdating
        ? `/api/scada/layout/${currentLayoutId}/`
        : `/api/scada/save-layout/`;
      try {
        const response = await api({
          url: apiUrl,
          method: isUpdating ? "PUT" : "POST",
          data: payload,
        });
        const result = response.data;
        let savedLayoutId = currentLayoutId;
        if (!isUpdating) {
          savedLayoutId = result.id;
          setCurrentLayoutId(savedLayoutId);
          setIsEditMode(true);
        }
        return savedLayoutId;
      } catch (err) {
        console.error("Error al guardar/publicar el layout", err);
        throw err;
      }
    },
    [currentLayoutId]
  );

  const exportToFile = useCallback((viewsData, name = "Layout") => {
    const hasAnyElements = viewsData?.views?.some(
      (v) => Array.isArray(v.elements) && v.elements.length
    );
    if (!hasAnyElements) {
      throw new Error("No hay elementos validos que exportar.");
    }
    const filename = (name || "Layout").replace(/\s+/g, "_");
    const dataStr = JSON.stringify(viewsData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }, []);

  const handleNewDashboard = useCallback(() => {
    // 1. Limpiar estado de edición y canvas
    setCanvasElements([]);
    setCurrentLayoutId(null);
    setIsEditMode(false);
    setExportName("Hmi");
    localStorage.removeItem(CURRENT_VIEW_KEY);
    
    // 2. Resetear vistas a estado inicial (una vista vacía)
    const newView = {
      id: `view-${Date.now()}`,
      name: "Vista 1",
      elements: [],
      layoutId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setViews([newView]);
    setCurrentViewId(newView.id);
    
    // 3. Resetear selección y UI
    setSelectedId(null);
    setIsPropsOpen(false);

    // 4. Limpiar history state para evitar que F5 recargue una vista editada anterior
    window.history.replaceState({}, document.title);
  }, []);

  // Efecto para cargar layout desde "Editar Scada" (ProductionView)
  // Ref para controlar la carga única desde navegación "Editar Scada"
  const hasLoadedFromStateRef = useRef(null);

  useEffect(() => {
    // Si queremos cargar el sidebar siempre al inicio
    fetchUserViews();
  }, [fetchUserViews]);

  // Efecto para cargar layout desde "Editar Scada" (ProductionView)
  useEffect(() => {
    const stateLoadId = location.state?.loadPublishedId;
    
    // Si hay un ID y NO es el mismo que ya procesamos...
    if (stateLoadId && hasLoadedFromStateRef.current !== stateLoadId) {
       hasLoadedFromStateRef.current = stateLoadId; // Marcar como procesado YA

       // Opción A: Intentar cargarlo desde la memoria si ya tenemos la lista
       loadViewDetail(stateLoadId).then((detail) => {
         if (detail.viewsData?.views?.length) {
            const mappedViews = detail.viewsData.views.map((v) => ({
              ...v,
              elements: normalizeCanvasElements(v.elements || []),
              layoutId: stateLoadId,
            }));
            setViews(mappedViews);
            setCurrentViewId(mappedViews[0]?.id || null);
            setCanvasElements(mappedViews[0]?.elements || []);
            setCurrentLayoutId(stateLoadId);
            setExportName(detail.name || "Aplicacion");
            setIsEditMode(true);
         }
       }).catch(err => console.error("Error cargando detalle para editar:", err));
       // Limpiar el estado de navegación para que F5 no intente recargar si no es necesario
       // (aunque el ref protege, es buena práctica limpiar)
       window.history.replaceState({}, document.title);
    }
  }, [location.state, loadViewDetail]);

  return {
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
    loadViewDetail,
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
  };
};

export default useOrganizarScada;
