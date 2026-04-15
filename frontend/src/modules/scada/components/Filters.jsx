// frontend/src/modules/scada/components/Filters.jsx

import React from "react";

const selectCls = `
  h-control-md w-full px-3
  text-base text-slate-800
  bg-white border border-border-default rounded-sm
  focus:outline-none focus:ring-1 focus:ring-border-accent focus:border-border-accent
  transition-colors duration-150
  disabled:bg-surface-subtle disabled:text-slate-400
`;

export function Filters({ filters, setFilters, sites, areas, lines, cells, equipments }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* SITE */}
      <select
        value={filters.site}
        onChange={(e) =>
          setFilters({ ...filters, site: e.target.value, area: "", line: "", cell: "", equipment_id: "" })
        }
        className={selectCls}
        style={{ minWidth: 140, maxWidth: 180 }}
      >
        <option value="">Site (todos)</option>
        {sites.map((s, i) => (
          <option key={i} value={s}>{s}</option>
        ))}
      </select>

      {/* AREA */}
      <select
        value={filters.area}
        onChange={(e) =>
          setFilters({ ...filters, area: e.target.value, line: "", cell: "", equipment_id: "" })
        }
        className={selectCls}
        style={{ minWidth: 140, maxWidth: 180 }}
      >
        <option value="">Área (todas)</option>
        {areas.map((s, i) => (
          <option key={i} value={s}>{s}</option>
        ))}
      </select>

      {/* LINE */}
      <select
        value={filters.line}
        onChange={(e) =>
          setFilters({ ...filters, line: e.target.value, cell: "", equipment_id: "" })
        }
        className={selectCls}
        style={{ minWidth: 140, maxWidth: 180 }}
      >
        <option value="">Línea (todas)</option>
        {lines.map((s, i) => (
          <option key={i} value={s}>{s}</option>
        ))}
      </select>

      {/* CELL */}
      <select
        value={filters.cell}
        onChange={(e) =>
          setFilters({ ...filters, cell: e.target.value, equipment_id: "" })
        }
        className={selectCls}
        style={{ minWidth: 140, maxWidth: 180 }}
      >
        <option value="">Celda (todas)</option>
        {cells.map((s, i) => (
          <option key={i} value={s}>{s}</option>
        ))}
      </select>

      {/* EQUIPMENT */}
      <select
        value={filters.equipment_id}
        onChange={(e) =>
          setFilters({ ...filters, equipment_id: e.target.value })
        }
        className={selectCls}
        style={{ minWidth: 160, maxWidth: 220 }}
      >
        <option value="">Equipo (todos)</option>
        {equipments.map((eq, i) => (
          <option key={i} value={eq}>{eq}</option>
        ))}
      </select>
    </div>
  );
}
