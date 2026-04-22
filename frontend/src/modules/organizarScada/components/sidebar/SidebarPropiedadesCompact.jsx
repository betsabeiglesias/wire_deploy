// frontend\src\modules\organizarScada\components\sidebar\SidebarPropiedadesCompact.jsx

import { useState } from "react";
import { Code2, SlidersHorizontal, X } from "lucide-react";
import { ScriptEditor } from "../../pages/ScriptEditor";
import WidgetPreview from "../widgets/WidgetPreview";

const SidebarPropiedadesCompact = ({
  selectedElement,
  onOpenAdvanced
}) => {
  const [isScriptOpen, setIsScriptOpen] = useState(false);

  if (!selectedElement) {
    return (
      <div className="p-3">
        <div className="rounded-[4px] border border-slate-300 bg-[#F9F9FA] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
            Propiedades
          </p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">
            Selecciona un elemento del lienzo para editar sus ajustes.
          </p>
        </div>
      </div>
    );
  }

  const label = selectedElement.data?.label || selectedElement.label || "Sin nombre";
  const type = selectedElement.data?.type || selectedElement.type || "Elemento";

  return (
    <>
      <div className="flex flex-col gap-2 p-3">
        <div className="rounded-[4px] border border-[#D6D9E2] bg-[#F9F9FA] p-2">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
            Vista previa
          </p>
          <div className="h-24 overflow-hidden rounded-[4px] border border-slate-300 bg-white">
            <div className="flex h-full w-full items-center justify-center p-2">
              <WidgetPreview data={selectedElement.data} />
            </div>
          </div>
        </div>

        <div className="rounded-[4px] border border-slate-300 bg-white p-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
            Elemento
          </p>
          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-slate-800">
                {label}
              </p>
              <p className="mt-1 truncate text-[11px] text-slate-500">
                {type}
              </p>
            </div>
            <span className="shrink-0 rounded-[4px] bg-[#EDF8EF] px-1.5 py-[2px] text-[8px] font-bold text-[#2A8B4B]">
              ACTIVO
            </span>
          </div>
        </div>

        <div className="rounded-[4px] border border-slate-300 bg-[#F9F9FA] p-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
            Automatizacion
          </p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            Reglas condicionales sobre variables locales o tags del proyecto.
          </p>
          <button
            onClick={() => setIsScriptOpen(true)}
            className="mt-2 flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-slate-300 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:border-[#29468B] hover:bg-[#EEF3FF] hover:text-[#29468B] active:scale-95"
          >
            <Code2 className="h-4 w-4" />
            <span>Editar reglas</span>
          </button>
        </div>

        <button
          onClick={onOpenAdvanced}
          className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[4px] bg-[#29468B] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#1F3A73] active:scale-95"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Editar avanzado</span>
        </button>
      </div>

      {isScriptOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30">
          <aside className="h-full w-[760px] max-w-[92vw] border-l border-slate-300 bg-[#EFEFEF] shadow-lg">
            <header className="flex h-[36px] items-center justify-between bg-[#29468B] px-4 shadow-sm">
              <div className="flex min-w-0 items-center gap-2">
                <Code2 className="h-4 w-4 shrink-0 text-white/90" />
                <span className="truncate text-[13px] font-medium uppercase tracking-[0.08em] text-white">
                  Reglas de variable
                </span>
              </div>
              <button
                onClick={() => setIsScriptOpen(false)}
                title="Cerrar reglas"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <ScriptEditor embedded />
          </aside>
        </div>
      )}
    </>
  );
};

export default SidebarPropiedadesCompact;
