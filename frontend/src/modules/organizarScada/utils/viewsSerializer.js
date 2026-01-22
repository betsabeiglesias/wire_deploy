// Utilidades para serializar/normalizar vistas antes de publicar/guardar.

const sanitizeForSave = (value) =>
  JSON.parse(
    JSON.stringify(value, (_k, v) => {
      if (typeof v === "function") return undefined;
      if (v === undefined) return null;
      return v;
    })
  );

export const buildViewsData = (views = [], currentViewId = null) => {
  const normalizeElementsForSave = (els = []) =>
    els.map((el) => ({
      ...el,
      x: Math.round(el.x ?? 0),
      y: Math.round(el.y ?? 0),
      data: sanitizeForSave(el.data || {}),
    }));

  const viewsPayload = views.map((v) => ({
    id: v.id,
    name: v.name,
    elements: normalizeElementsForSave(v.elements || []),
  }));

  const currentViewIndex = Math.max(
    0,
    viewsPayload.findIndex((v) => v.id === currentViewId)
  );

  return { views: viewsPayload, currentViewIndex };
};

export default buildViewsData;
