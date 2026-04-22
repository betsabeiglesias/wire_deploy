// modules/organizarScada/components/ScriptForm.jsx

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { TagSelector } from "./sidebar/TagSelector";

const OPERATORS = [
  { value: "eq", label: "Igual a" },
  { value: "gt", label: "Mayor que" },
  { value: "lt", label: "Menor que" },
  { value: "gte", label: "Mayor o igual" },
  { value: "lte", label: "Menor o igual" },
  { value: "between", label: "Entre" },
];

const inputClass = "h-8 w-full rounded-[4px] border border-slate-300 bg-white px-2 text-[12px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20";
const labelClass = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";

const ColorInput = ({ label, value, onChange }) => (
  <label className="flex min-w-0 flex-1 flex-col gap-1">
    <span className={labelClass}>{label}</span>
    <div className="flex h-8 overflow-hidden rounded-[4px] border border-slate-300 bg-white">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-10 cursor-pointer border-0 bg-transparent p-0"
      />
      <input
        value={value}
        maxLength={7}
        onChange={(e) => {
          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value);
        }}
        className="min-w-0 flex-1 border-0 px-2 text-[11px] font-mono text-slate-700 outline-none"
      />
    </div>
  </label>
);

export function ScriptForm({ selectedTag, setSelectedTag, onTemplateChange }) {
  const [rules, setRules] = useState([
    {
      operator: "gt",
      value: "",
      valueTo: "",
      fillColor: "#ef4444",
      borderColor: "#dc2626",
    },
  ]);

  const [defaultFill, setDefaultFill] = useState("#6b7280");
  const [defaultBorder, setDefaultBorder] = useState("#4b5563");

  function addRule() {
    setRules([
      ...rules,
      {
        operator: "gt",
        value: "",
        valueTo: "",
        fillColor: "#ef4444",
        borderColor: "#dc2626",
      },
    ]);
  }

  function removeRule(index) {
    setRules(rules.filter((_, i) => i !== index));
  }

  function updateRule(index, field, value) {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  }

  function buildTemplate() {
    if (!selectedTag) return;

    const parsedRules = rules
      .filter((r) => r.value !== "")
      .map((r) => ({
        operator: r.operator,
        value: Number(r.value),
        ...(r.operator === "between" && { valueTo: Number(r.valueTo) }),
        style: {
          fillColor: r.fillColor,
          borderColor: r.borderColor,
        },
      }));

    const template = {
      id: `tpl_${selectedTag.tagId}_${Date.now()}`,
      name: `Template ${selectedTag.variableName}`,
      defaultStyle: {
        fillColor: defaultFill,
        borderColor: defaultBorder,
      },
      rules: parsedRules,
    };

    onTemplateChange(template);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-[4px] border border-slate-300 bg-[#F9F9FA] p-2">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Variable
        </p>
        <TagSelector value={selectedTag} onChange={setSelectedTag} />
      </div>

      {selectedTag && (
        <>
          <div className="rounded-[4px] border border-slate-300 bg-[#F9F9FA] p-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
              Estilo por defecto
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ColorInput label="Relleno" value={defaultFill} onChange={setDefaultFill} />
              <ColorInput label="Borde" value={defaultBorder} onChange={setDefaultBorder} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
              Reglas
            </p>
            <button
              type="button"
              onClick={addRule}
              className="flex h-7 cursor-pointer items-center gap-1 rounded-[4px] border border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-700 transition-colors hover:border-[#29468B] hover:text-[#29468B]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Anadir</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="rounded-[4px] border border-slate-300 bg-white p-2"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Regla {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    title="Eliminar regla"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2">
                  <label className="flex min-w-0 flex-col gap-1">
                    <span className={labelClass}>Condicion</span>
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(index, "operator", e.target.value)}
                      className={inputClass}
                    >
                      {OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex min-w-0 flex-col gap-1">
                    <span className={labelClass}>Valor</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={rule.value}
                      onChange={(e) => updateRule(index, "value", e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-1">
                    <span className={labelClass}>Hasta</span>
                    <input
                      type="number"
                      placeholder="-"
                      value={rule.valueTo}
                      disabled={rule.operator !== "between"}
                      onChange={(e) => updateRule(index, "valueTo", e.target.value)}
                      className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                    />
                  </label>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <ColorInput
                    label="Relleno"
                    value={rule.fillColor}
                    onChange={(value) => updateRule(index, "fillColor", value)}
                  />
                  <ColorInput
                    label="Borde"
                    value={rule.borderColor}
                    onChange={(value) => updateRule(index, "borderColor", value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={buildTemplate}
            className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[4px] bg-[#29468B] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#1F3A73] active:scale-95"
          >
            <Check className="h-4 w-4" />
            <span>Aplicar reglas</span>
          </button>
        </>
      )}
    </div>
  );
}
