// historian/components/TagMultiSelect.jsx
// Selector multi-tag filtrable. Usa useScadaConfig() igual que DeviceManagerModal.
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useScadaConfig } from "@/context/ScadaConfigProvider";

/**
 * Props:
 *   selected  : [{equipment_id, variable}]
 *   onChange  : (newSelected) => void
 */
export default function TagMultiSelect({ selected = [], onChange }) {
  const { config, loading } = useScadaConfig();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lista plana de tags disponibles
  const allTags = useMemo(() => {
    if (!config?.tagIndex) return [];
    return Object.values(config.tagIndex).map((t) => ({
      equipment_id: [
          t.site,
          t.area,
          t.line,
          t.cell,
          t.equipment
        ].filter(Boolean).join("/"),
      variable: t.variable,
      unit: t.unit || "",
      datatype: t.datatype || "",
      label: `${t.equipment || t.equipment_id} · ${t.variable}`,
    }));
  }, [config]);
  console.log(allTags);
  // Filtrado por búsqueda
  const filtered = useMemo(() => {
    if (!search.trim()) return allTags;
    const q = search.toLowerCase();
    return allTags.filter((t) => t.label.toLowerCase().includes(q));
  }, [allTags, search]);

  const isSelected = (tag) =>
    selected.some(
      (s) => s.equipment_id === tag.equipment_id && s.variable === tag.variable
    );

  const toggle = (tag) => {
    if (isSelected(tag)) {
      onChange(
        selected.filter(
          (s) => !(s.equipment_id === tag.equipment_id && s.variable === tag.variable)
        )
      );
    } else {
      onChange([...selected, { equipment_id: tag.equipment_id, variable: tag.variable }]);
    }
  };

  const removeChip = (tag, e) => {
    e.stopPropagation();
    onChange(
      selected.filter(
        (s) => !(s.equipment_id === tag.equipment_id && s.variable === tag.variable)
      )
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Campo con chips */}
      <div
        className="min-h-[38px] flex flex-wrap gap-1 items-center border border-slate-300 rounded-md px-2 py-1.5 bg-white cursor-text focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400"
        onClick={() => setOpen(true)}
      >
        {selected.length === 0 && (
          <span className="text-slate-400 text-sm select-none">
            {loading ? "Cargando tags…" : "Selecciona tags…"}
          </span>
        )}
        {selected.map((s) => (
          <span
            key={`${s.equipment_id}|${s.variable}`}
            className="flex items-center gap-1 bg-sky-100 text-sky-800 text-xs font-medium px-2 py-0.5 rounded-full"
          >
            <span className="max-w-[180px] truncate" title={`${s.equipment_id} · ${s.variable}`}>
              {s.variable}
            </span>
            <button
              type="button"
              onClick={(e) => removeChip(s, e)}
              className="text-sky-500 hover:text-sky-800 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            className="ml-auto text-slate-400 hover:text-slate-700 text-xs px-1"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg flex flex-col max-h-72">
          {/* Búsqueda */}
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar equipo · variable…"
              className="w-full text-sm border border-slate-200 rounded px-2 py-1 focus:border-sky-400 focus:outline-none"
            />
          </div>

          {/* Lista */}
          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="px-3 py-4 text-xs text-slate-400">Cargando…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-slate-400">Sin resultados</div>
            )}
            {filtered.map((tag) => {
              const sel = isSelected(tag);
              return (
                <div
                  key={`${tag.equipment_id}|${tag.variable}`}
                  onClick={() => toggle(tag)}
                  className={[
                    "flex items-center gap-2 px-3 py-2 cursor-pointer text-xs hover:bg-slate-50",
                    sel ? "bg-sky-50" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      sel
                        ? "bg-sky-500 border-sky-500 text-white"
                        : "border-slate-300",
                    ].join(" ")}
                  >
                    {sel && "✓"}
                  </span>
                  <span className="flex-1 truncate">
                    <span className="text-slate-500">{tag.equipment_id}</span>
                    <span className="mx-1 text-slate-300">·</span>
                    <span className="font-medium text-slate-800">{tag.variable}</span>
                    {tag.unit && (
                      <span className="ml-1 text-slate-400">[{tag.unit}]</span>
                    )}
                  </span>
                  <span className="text-slate-300 shrink-0">{tag.datatype}</span>
                </div>
              );
            })}
          </div>

          {/* Footer con conteo */}
          <div className="px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>{filtered.length} tags disponibles</span>
            <span>{selected.length} seleccionados</span>
          </div>
        </div>
      )}
    </div>
  );
}
