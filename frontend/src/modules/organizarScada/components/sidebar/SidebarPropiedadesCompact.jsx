// frontend\src\modules\organizarScada\components\sidebar\SidebarPropiedadesCompact.jsx

import WidgetPreview from "../widgets/WidgetPreview";

const SidebarPropiedadesCompact = ({
  selectedElement,
  onOpenAdvanced
}) => {
  if (!selectedElement) return null;

  return (
    <div className="p-3 space-y-3">
      
      {/* Preview */}
      <div className="h-24 border rounded bg-slate-50">
        <WidgetPreview data={selectedElement.data} />
      </div>

      {/* Nombre */}
      <div className="text-sm font-medium text-slate-700">
        {selectedElement.data?.label || "Sin nombre"}
      </div>

      {/* Tipo */}
      <div className="text-xs text-slate-500">
        {selectedElement.data?.type}
      </div>

      {/* BOTÓN CLAVE */}
      <button
        onClick={onOpenAdvanced}
        className="w-full bg-slate-800 text-white py-2 rounded"
      >
        Editar
      </button>

    </div>
  );
};

export default SidebarPropiedadesCompact;