// modules/organizarScada/components/TagSelector.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import { useScadaConfig } from "../../../context/ScadaConfigProvider";

export function TagSelector({ value, onChange }) {
  const { config, loading } = useScadaConfig();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { tagIndex = {} } = config || {};

  const allOptions = useMemo(() => {
    return Object.values(tagIndex).map((tag) => ({
      tagId:       `${tag.equipment}.${tag.variable}`,
      label:       `${tag.equipment} › ${tag.variable}`,
      searchText:  `${tag.equipment} ${tag.variable} ${tag.unit || ""}`.toLowerCase(),
      equipment:   tag.equipment,
      variable:    tag.variable,
      datatype:    tag.datatype,
      unit:        tag.unit || "",
      site:        tag.site || "",
      area:        tag.area || "",
      line:        tag.line || "",
      cell:        tag.cell || "",
    }));
  }, [tagIndex]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allOptions.slice(0, 50);
    const q = query.toLowerCase();
    return allOptions.filter((opt) => opt.searchText.includes(q)).slice(0, 50);
  }, [allOptions, query]);

  const selectedOption = value?.tagId
    ? allOptions.find((o) => o.tagId === value.tagId)
    : null;

  const handleSelect = (opt) => {
    onChange({
      tagId:       opt.tagId,
      equipmentId: opt.equipment,
      variableName: opt.variable,
      datatype:    opt.datatype,
      unit:        opt.unit,
      site:        opt.site,
      area:        opt.area,
      line:        opt.line,
      cell:        opt.cell,
    });
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
  };

  if (loading) {
    return <div className="text-xs text-slate-400">Cargando tags...</div>;
  }

  return (
    <div ref={containerRef} className="relative w-full">

      {/* Input visible */}
      <div
        className="flex items-center border rounded px-2 py-1 bg-white cursor-text gap-1 min-h-[30px]"
        onClick={() => setOpen(true)}
      >
        {/* Cuando está cerrado muestra la selección; cuando abre, muestra el input */}
        {!open && selectedOption && (
          <span className="flex-1 text-xs text-slate-700 truncate">
            <span className="font-medium">{selectedOption.variable}</span>
            <span className="text-slate-400 ml-1">· {selectedOption.equipment}</span>
          </span>
        )}

        <input
          className={`text-xs outline-none bg-transparent ${!open && selectedOption ? "w-0 opacity-0" : "flex-1"}`}
          placeholder="Buscar tag..."
          value={open ? query : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />

        {selectedOption && (
          <button
            onMouseDown={handleClear}
            className="text-slate-300 hover:text-slate-600 text-xs ml-1 flex-shrink-0"
          >
            ✕
          </button>
        )}

        <span className="text-slate-300 text-xs flex-shrink-0">▾</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400">Sin resultados</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.tagId}
                onMouseDown={() => handleSelect(opt)}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-50 flex items-center justify-between gap-2 ${
                  value?.tagId === opt.tagId ? "bg-sky-100" : ""
                }`}
              >
                <span className="font-medium text-slate-800 truncate">{opt.variable}</span>
                <span className="text-slate-400 truncate text-right shrink-0 max-w-[120px]">{opt.equipment}</span>
                {opt.unit && (
                  <span className="text-slate-300 shrink-0">[{opt.unit}]</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
