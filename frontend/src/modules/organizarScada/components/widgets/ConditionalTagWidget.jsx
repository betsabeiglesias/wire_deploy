// modules/organizarScada/components/widgets/ConditionalTagWidget.jsx

import { useConditionalFormat } from "@/modules/organizarScada/utils/useConditionalFormat";

export function ConditionalTagWidget({ tagDescriptor, template }) {
  const { style, setValue, value, isMatched } = useConditionalFormat(
    tagDescriptor.tagId,
    template,
    { initialValue: null }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

      {/* Input de prueba */}
      <input
        type="number"
        placeholder="Introduce un valor de prueba..."
        onChange={(e) => setValue(e.target.value === "" ? null : Number(e.target.value))}
        style={{ padding: "0.4rem", borderRadius: "4px", border: "1px solid #555" }}
      />

      {/* Widget preview */}
      <div
        style={{
          backgroundColor: style.fillColor ?? "#222",
          border: `2px solid ${style.borderColor ?? "#444"}`,
          padding: "1rem",
          borderRadius: "8px",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
          {tagDescriptor.variableName}
        </div>
        <div style={{ fontSize: "1.5rem" }}>
          {value ?? "--"} {tagDescriptor.unit}
        </div>
        <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
          {isMatched ? "✅ Regla activa" : "⬜ Sin match (estilo por defecto)"}
        </div>
      </div>

    </div>
  );
}