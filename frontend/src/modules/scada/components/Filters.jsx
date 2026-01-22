// frontend/src/modules/scada/components/Filters.jsx

import React from "react";

export function Filters({ filters, setFilters, sites, areas, lines, cells, equipments }) {
  return (
    <div className="filters-container">
      {/* SITE */}
      <select
        value={filters.site}
        onChange={(e) =>
          setFilters({ ...filters, site: e.target.value, area: "", line: "", cell: "", equipment_id: "" })
        }
      >
        <option value="">Site (todos)</option>
        {sites.map((s, i) => (
          <option key={i} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* AREA */}
      <select
        value={filters.area}
        onChange={(e) =>
          setFilters({ ...filters, area: e.target.value, line: "", cell: "", equipment_id: "" })
        }
      >
        <option value="">Area (todas)</option>
        {areas.map((s, i) => (
          <option key={i} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* LINE */}
      <select
        value={filters.line}
        onChange={(e) =>
          setFilters({ ...filters, line: e.target.value, cell: "", equipment_id: "" })
        }
      >
        <option value="">Línea (todas)</option>
        {lines.map((s, i) => (
          <option key={i} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* CELL */}
      <select
        value={filters.cell}
        onChange={(e) =>
          setFilters({ ...filters, cell: e.target.value, equipment_id: "" })
        }
      >
        <option value="">Celda (todas)</option>
        {cells.map((s, i) => (
          <option key={i} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* EQUIPMENT (CORREGIDO → equipment_id) */}
      <select
        value={filters.equipment_id}
        onChange={(e) =>
          setFilters({ ...filters, equipment_id: e.target.value })
        }
      >
        <option value="">Equipo (todos)</option>
        {equipments.map((eq, i) => (
          <option key={i} value={eq}>
            {eq}
          </option>
        ))}
      </select>
    </div>
  );
}
