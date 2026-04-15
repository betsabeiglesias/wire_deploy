/**
 * WidgetConfigPanel.jsx
 *
 * Modal de configuración de un widget del Historian Dashboard.
 * Sirve tanto para crear un widget nuevo como para editar uno existente.
 *
 * Props:
 *   widget   : objeto Widget (o { _isNew: true } para creación)
 *   onSave   : (widgetConfig) => void
 *   onCancel : () => void
 */
import { useState } from "react";
import { X, BarChart2, Table2, Activity } from "lucide-react";
import TagMultiSelect from "../components/TagMultiSelect";
import DateRangePicker from "../components/DateRangePicker";
import { TIME_PRESETS } from "./timePresets";

const TYPE_OPTIONS = [
  { value: "chart", label: "Gráfico de series",  icon: BarChart2 },
  { value: "table", label: "Tabla de datos",      icon: Table2   },
  { value: "kpi",   label: "KPI / Último valor",  icon: Activity },
];

const LIMIT_OPTIONS = [10, 50, 100, 500, 1000, 5000];


const DEFAULT_WIDGET = {
  type: "chart",
  title: "",
  tags: [],
  timePreset: "24h",
  start: null,
  stop: null,
  limit: 5000,
  colSpan: 1,
};

export default function WidgetConfigPanel({ widget, onSave, onCancel }) {
  const isNew = Boolean(widget?._isNew);
  const [form, setForm] = useState(() => ({
    ...DEFAULT_WIDGET,
    ...(isNew ? {} : widget),
    _isNew: undefined,
  }));

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.tags?.length) return;
    // _isNew se pasa explícitamente para que handleSaveWidget lo detecte correctamente.
    // No depender del spread de form porque form lo inicializa como undefined.
    const payload = isNew
      ? { ...form, id: crypto.randomUUID(), _isNew: true }
      : form;
    onSave(payload);
  };

  const canSave = form.tags?.length > 0 && form.title?.trim();

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {isNew ? "Nuevo widget" : "Configurar widget"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Título del widget <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="ej. Temperatura horno 1"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tipo de visualización
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("type", value)}
                  className={[
                    "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all",
                    form.type === value
                      ? "border-sky-400 bg-sky-50 text-sky-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tags <span className="text-red-400">*</span>
            </label>
            <TagMultiSelect
              selected={form.tags}
              onChange={(tags) => set("tags", tags)}
            />
          </div>

          {/* Rango de tiempo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Rango de tiempo
            </label>

            {/* Presets */}
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set("timePreset", p.value)}
                  className={[
                    "px-3 py-1.5 text-xs rounded-lg border font-medium transition-all",
                    form.timePreset === p.value
                      ? "border-sky-400 bg-sky-50 text-sky-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300",
                  ].join(" ")}
                >
                  Últimas {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => set("timePreset", null)}
                className={[
                  "px-3 py-1.5 text-xs rounded-lg border font-medium transition-all",
                  form.timePreset === null
                    ? "border-sky-400 bg-sky-50 text-sky-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300",
                ].join(" ")}
              >
                Personalizado
              </button>
            </div>

            {/* Rango personalizado */}
            {form.timePreset === null && (
              <DateRangePicker
                start={form.start ?? ""}
                stop={form.stop ?? ""}
                onStart={(v) => set("start", v)}
                onStop={(v) => set("stop", v)}
              />
            )}
          </div>

          {/* Límite de filas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Límite de registros
            </label>
            <select
              value={form.limit}
              onChange={(e) => set("limit", Number(e.target.value))}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 focus:border-sky-400 focus:outline-none"
            >
              {LIMIT_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v.toLocaleString()} registros
                </option>
              ))}
            </select>
          </div>

          {/* Ancho en el grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Ancho en el dashboard
            </label>
            <div className="flex gap-2">
              {[
                { value: 1, label: "Mitad (50%)" },
                { value: 2, label: "Completo (100%)" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("colSpan", value)}
                  className={[
                    "flex-1 py-2 text-xs rounded-lg border font-medium transition-all",
                    form.colSpan === value
                      ? "border-sky-400 bg-sky-50 text-sky-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 text-sm font-medium text-white bg-[#194b68] rounded-xl hover:bg-[#215f82] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isNew ? "Añadir widget" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
