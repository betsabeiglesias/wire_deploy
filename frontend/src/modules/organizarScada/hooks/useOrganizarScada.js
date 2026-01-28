import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const PUBLISHED_VIEWS_KEY = "publishedScadaViews";
const PUBLISHED_LATEST_KEY = "publishedScadaLatest";
const LEGACY_LAYOUT_KEY = "publishedScadaLayout";
const CURRENT_VIEW_KEY = "scadaCurrentView";

const persistPublishedView = (viewId, viewsData, name) => {
  const payload = {
    id: viewId,
    views_data: viewsData,
    button_name: name,
    updatedAt: new Date().toISOString(),
  };

  const existingRaw = localStorage.getItem(PUBLISHED_VIEWS_KEY);
  const existing = existingRaw ? JSON.parse(existingRaw) : {};
  const updated = { ...existing, [viewId]: payload };

  localStorage.setItem(PUBLISHED_VIEWS_KEY, JSON.stringify(updated));
  localStorage.setItem(PUBLISHED_LATEST_KEY, viewId);
  localStorage.setItem(LEGACY_LAYOUT_KEY, JSON.stringify(viewsData));
};

const normalizeCanvasElements = (items = []) => {
  const baseId = Date.now();
  return items.map((item, idx) => {
    const { id, x, y, ...rest } = item;
    return {
      id: id || baseId + idx,
      x: x ?? 100,
      y: y ?? 100,
      data: item.data ? { ...item.data } : { ...rest },
    };
  });
};

export const useOrganizarScada = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [canvasElements, setCanvasElements] = useState([]);
  const [publishedViews, setPublishedViews] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isPropsOpen, setIsPropsOpen] = useState(false);
  const [views, setViews] = useState([]);
  const [isLoadingViews, setIsLoadingViews] = useState(false);
  const [viewsError, setViewsError] = useState("");
  const [currentViewId, setCurrentViewId] = useState(null);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(false);
  const [skipRemoteViews, setSkipRemoteViews] = useState(false);
  const viewsRef = useRef([]);
  const [currentLayoutId, setCurrentLayoutId] = useState(location.state?.layoutId || null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(location.state?.editMode || false);
  const [exportName, setExportName] = useState(location.state?.layoutId ? location.state?.layOutName : "Nuevo Layout");

  useEffect(() => {
    viewsRef.current = views;
  }, [views]);

  const loadPublishedViews = useCallback(async () => {
    try {
      const response = await api.get("/api/scada-manager/my-layouts/");
      const layouts = response.data || [];
      const asArray = layouts.map((item) => ({
        id: item.id,
        name: item.button_name,
        updatedAt: item.updated_at || new Date().toISOString(),
        views_data: item.views_data,
        layout: item.elements,
        is_application: !!item.views_data,
      }));
      asArray.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      setPublishedViews(asArray);
      localStorage.setItem(PUBLISHED_VIEWS_KEY, JSON.stringify(
          asArray.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {})
      ));
    } catch (err) {
      console.error("Error cargando vistas publicadas:", err);
      const raw = localStorage.getItem(PUBLISHED_VIEWS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) || {};
        setPublishedViews(Object.values(parsed));
      }
    }
  }, []);

  const fetchUserViews = useCallback(async () => {
    if (skipRemoteViews) return viewsRef.current;
    setIsLoadingViews(true);
    try {
      const response = await api.get("/api/scada-manager/my-layouts/");
      const normalized = response.data.map((item) => ({
        id: item.id,
        layoutId: item.id,
        name: item.button_name || item.name || `Vista ${item.id}`,
        elements: Array.isArray(item.elements) ? normalizeCanvasElements(item.elements) : [],
        updatedAt: item.updated_at || item.updatedAt,
      }));
      setViews(normalized);
      return normalized;
    } catch (err) {
      setViewsError("Error al obtener vistas.");
      if (err.response?.status >= 500) setSkipRemoteViews(true);
      return viewsRef.current;
    } finally {
      setIsLoadingViews(false);
    }
  }, [skipRemoteViews]);

  const loadViewDetail = useCallback(async (viewId) => {
    const response = await api.get(`/api/scada-manager/layout/${viewId}/`);
    const data = response.data;
    const elementsRaw = Array.isArray(data) ? data : data?.elements || [];
    return {
      name: data?.button_name || data?.name,
      elements: normalizeCanvasElements(elementsRaw),
      updatedAt: data?.updated_at || data?.updatedAt,
      viewsData: data?.views_data,
    };
  }, []);

  const handleCreateView = useCallback(() => {
    const newView = {
      id: `view-${Date.now()}`,
      name: `Vista ${views.length + 1}`,
      elements: [],
      layoutId: currentLayoutId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setViews([...views, newView]);
    setCurrentViewId(newView.id);
    setCanvasElements([]);
    setIsEditMode(!!currentLayoutId);
    setExportName((prev) => prev || newView.name);
    localStorage.setItem(CURRENT_VIEW_KEY, newView.id);
    setSelectedId(null);
    return newView;
  }, [views, currentLayoutId]);

  const handleSelectView = useCallback(async (viewId, viewsArray) => {
    const viewsToUse = viewsArray || viewsRef.current;
    const view = viewsToUse.find((v) => v.id === viewId);
    if (!view) return;

    setSelectedId(null);
    setIsPropsOpen(false);
    setCurrentViewId(viewId);
    localStorage.setItem(CURRENT_VIEW_KEY, viewId);

    const layoutId = view.layoutId ?? currentLayoutId ?? null;
    if (view.elements?.length) {
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
      setViews((prev) => prev.map((v) => (v.id === viewId ? updatedView : v)));
      setCanvasElements(detail.elements);
      setCurrentLayoutId(updatedView.layoutId);
      setExportName(updatedView.name || "");
      setIsEditMode(true);
    } catch (err) {
      setCanvasElements(view.elements || []);
    } finally {
      setIsLoadingCanvas(false);
    }
  }, [currentLayoutId, loadViewDetail]);

  const handleDeleteView = useCallback(async (viewId) => {
    const targetView = viewsRef.current.find((v) => v.id === viewId);
    if (!targetView) return;
    const layoutIdToDelete = targetView.layoutId || viewId;

    if (!targetView.layoutId) {
      const updatedViews = viewsRef.current.filter((v) => v.id !== viewId);
      setViews(updatedViews);
      return;
    }

    try {
      await api.delete(`/api/scada-manager/layout/${layoutIdToDelete}/`);
      const updatedViews = viewsRef.current.filter((v) => v.id !== viewId);
      setViews(updatedViews);
      if (currentViewId === viewId) {
        if (updatedViews.length > 0) handleSelectView(updatedViews[0].id, updatedViews);
        else {
          setCurrentViewId(null);
          setCanvasElements([]);
        }
      }
    } catch (err) {
      alert("Error al eliminar la vista.");
    }
  }, [currentViewId, handleSelectView]);

  const addComponentToCanvas = useCallback((data) => {
    setCanvasElements((prev) => [...prev, { id: Date.now(), x: 100, y: 100, data: { ...data } }]);
  }, []);

  const handleUpdateComponent = useCallback((id, changes) => {
    setCanvasElements((prev) =>
      prev.map((item) => (
        item.id === id 
          ? { 
              ...item, 
              ...changes, 
              data: item.data ? { ...item.data, ...changes } : { ...changes } 
            } 
          : item
      ))
    );
  }, []);

  const handleDeleteComponent = useCallback((id) => {
    setCanvasElements((prev) => prev.filter((item) => item.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleDropFromSidebar = useCallback((event, canvasEl) => {
    if (!canvasEl) return;
    const tplRaw = event.dataTransfer.getData("application/x-scada-template");
    if (!tplRaw) return;
    try {
      const tpl = JSON.parse(tplRaw);
      const rect = canvasEl.getBoundingClientRect();
      const element = {
        id: Date.now(),
        x: event.clientX - rect.left - 110,
        y: event.clientY - rect.top - 110,
        width: 220,
        height: 220,
        data: tpl.data || tpl,
      };
      setCanvasElements((prev) => [...prev, element]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleLoadPublishedView = useCallback((viewId) => {
    const target = publishedViews.find((v) => v.id === viewId) || JSON.parse(localStorage.getItem(PUBLISHED_VIEWS_KEY))?.[viewId];
    if (!target) return;

    if (target.views_data?.views?.length) {
      const mapped = target.views_data.views.map((v) => ({ ...v, elements: normalizeCanvasElements(v.elements || []), layoutId: target.id }));
      setViews(mapped);
      setCurrentViewId(mapped[0].id);
      setCanvasElements(mapped[0].elements);
      setCurrentLayoutId(target.id);
      setIsEditMode(true);
    }
  }, [publishedViews]);

  const handleOpenPublishedView = useCallback((viewId) => {
    navigate(`/scada/production/${encodeURIComponent(viewId)}`);
  }, [navigate]);

  const handleDeletePublishedView = useCallback(async (viewId) => {
    if (!window.confirm("¿Eliminar aplicación?")) return;
    try {
      await api.delete(`/api/scada-manager/layout/${viewId}/`);
      loadPublishedViews();
    } catch (err) {
      alert("Error al eliminar.");
    }
  }, [loadPublishedViews]);

  const confirmExport = useCallback(async ({ filename, viewsData, isUpdating }) => {
    const apiUrl = isUpdating ? `/api/scada-manager/layout/${currentLayoutId}/` : `/api/scada-manager/save-layout/`;
    try {
      const response = await api({ url: apiUrl, method: isUpdating ? "PUT" : "POST", data: { button_name: filename, views_data: viewsData } });
      const savedId = isUpdating ? currentLayoutId : response.data.id;
      setCurrentLayoutId(savedId);
      setIsEditMode(true);
      persistPublishedView(savedId, viewsData, filename);
      loadPublishedViews();
      return savedId;
    } catch (err) {
      throw err;
    }
  }, [currentLayoutId, loadPublishedViews]);

  const exportToFile = useCallback((viewsData, exportName) => {
    const filename = (exportName || "Layout").replace(/\s+/g, "_");
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
    setCanvasElements([]);
    setCurrentLayoutId(null);
    setIsEditMode(false);
    const newView = { id: `view-${Date.now()}`, name: "Vista 1", elements: [], layoutId: null };
    setViews([newView]);
    setCurrentViewId(newView.id);
    window.history.replaceState({}, document.title);
  }, []);

  useEffect(() => {
    fetchUserViews();
  }, [fetchUserViews]);

  return {
    state: { canvasElements, publishedViews, selectedId, isPropsOpen, views, isLoadingViews, viewsError, currentViewId, isLoadingCanvas, currentLayoutId, showExportModal, isEditMode, exportName, location },
    setters: { setSelectedId, setIsPropsOpen, setViews, setCurrentViewId, setCanvasElements, setCurrentLayoutId, setShowExportModal, setIsEditMode, setExportName },
    loadPublishedViews, fetchUserViews, loadViewDetail, handleCreateView, handleSelectView, handleDeleteView, handleLoadPublishedView, handleOpenPublishedView, handleDeletePublishedView, addComponentToCanvas, handleUpdateComponent, handleDeleteComponent, handleDropFromSidebar, confirmExport, exportToFile, handleNewDashboard, normalizeCanvasElements
  };
};

export default useOrganizarScada;