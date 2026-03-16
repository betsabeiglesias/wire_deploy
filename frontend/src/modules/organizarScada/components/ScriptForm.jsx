// modules/organizarScada/components/ScriptForm.jsx

import { useState } from "react";
import { TagSelector } from "./sidebar/TagSelector";

const OPERATORS = [
  { value: "eq", label: "Igual a" },
  { value: "gt", label: "Mayor que" },
  { value: "lt", label: "Menor que" },
  { value: "gte", label: "Mayor o igual" },
  { value: "lte", label: "Menor o igual" },
  { value: "between", label: "Entre" },
];

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Selector de TAG */}
      <TagSelector value={selectedTag} onChange={setSelectedTag} />

      {selectedTag && (
        <>

          {/* Color por defecto */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label>Color normal</label>
            <input
              type="color"
              value={defaultFill}
              onChange={(e) => setDefaultFill(e.target.value)}
            />

            <label>Borde</label>
            <input
              type="color"
              value={defaultBorder}
              onChange={(e) => setDefaultBorder(e.target.value)}
            />
          </div>

          {/* RULE BUILDER */}
          {rules.map((rule, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >

              <div style={{ display: "flex", gap: "0.5rem" }}>

                <select
                  value={rule.operator}
                  onChange={(e) =>
                    updateRule(index, "operator", e.target.value)
                  }
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Valor"
                  value={rule.value}
                  onChange={(e) =>
                    updateRule(index, "value", e.target.value)
                  }
                />

                {rule.operator === "between" && (
                  <input
                    type="number"
                    placeholder="Hasta"
                    value={rule.valueTo}
                    onChange={(e) =>
                      updateRule(index, "valueTo", e.target.value)
                    }
                  />
                )}

              </div>

              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>

                <label>Fill</label>
                <input
                  type="color"
                  value={rule.fillColor}
                  onChange={(e) =>
                    updateRule(index, "fillColor", e.target.value)
                  }
                />

                <label>Border</label>
                <input
                  type="color"
                  value={rule.borderColor}
                  onChange={(e) =>
                    updateRule(index, "borderColor", e.target.value)
                  }
                />

                <button onClick={() => removeRule(index)}>
                  Eliminar
                </button>

              </div>

            </div>
          ))}

          <button onClick={addRule}>
            + Añadir regla
          </button>

          <button onClick={buildTemplate}>
            Aplicar
          </button>

        </>
      )}
    </div>
  );
}