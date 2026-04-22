// modules/organizarScada/components/widgets/ConditionalTagWidget.jsx

import { CheckCircle2, Circle } from "lucide-react";
import { useConditionalFormat } from "@/modules/organizarScada/utils/useConditionalFormat";

export function ConditionalTagWidget({ tagDescriptor, template }) {
  const { style, setValue, value, isMatched } = useConditionalFormat(
    tagDescriptor.tagId,
    template,
    { initialValue: null }
  );

  const StateIcon = isMatched ? CheckCircle2 : Circle;

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Valor de prueba
        </span>
        <input
          type="number"
          placeholder="Introduce un valor..."
          onChange={(e) => setValue(e.target.value === "" ? null : Number(e.target.value))}
          className="h-8 rounded-[4px] border border-slate-300 bg-white px-2 text-[12px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20"
        />
      </label>

      <div
        className="rounded-[6px] border p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors"
        style={{
          backgroundColor: style.fillColor ?? "#F9F9FA",
          borderColor: style.borderColor ?? "#D6D9E2",
        }}
      >
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-700">
          {tagDescriptor.variableName}
        </p>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-[18px] font-semibold text-slate-900">
            {value ?? "--"}
          </span>
          <span className="pb-[2px] text-[11px] font-semibold text-slate-600">
            {tagDescriptor.unit}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-[4px] border border-slate-300 bg-white px-2 py-1.5">
        <StateIcon className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-[11px] text-slate-600">
          {isMatched ? "Regla activa" : "Sin coincidencia"}
        </span>
      </div>
    </div>
  );
}
