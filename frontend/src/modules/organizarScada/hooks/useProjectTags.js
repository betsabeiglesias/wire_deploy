// src/modules/organizarScada/hooks/useProjectTags.js
import { useEffect, useState } from "react";


export function useProjectTags(layoutId, tagsMap = new Map()) {
  const [tags, setTags]       = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!layoutId) { setTags([]); return; }
    setLoading(true);
    fetch(`/api/scada-manager/layouts/${layoutId}/tables/`, { credentials: "include" })
      .then(r => r.json())
      .then(tables => {
        const all = tables.flatMap(table =>
          (table.variables || []).map(v => {
            if (v.source === "connection") {
              // 1. Usar equipment_id guardado en BD
              let equipmentId = v.equipment_id || "";

              // 2. Fallback: buscar en tagsMap por equipment + variable
              if (!equipmentId) {
                for (const [, tag] of tagsMap.entries()) {
                  if (tag.equipment === v.equipment && tag.variable === v.variable) {
                    equipmentId = tag.equipment_id;
                    break;
                  }
                }
              }

              return {
                id:        v.variable_id,
                name:      v.name,
                source:    "connection",
                tagId:     equipmentId ? `${equipmentId}:${v.variable}` : null,
                equipment: v.equipment,
                variable:  v.variable,
                unit:      v.unit || "",
                datatype:  v.datatype || "",
              };
            }

            return {
              id:           v.variable_id,
              name:         v.name,
              source:       "local",
              tagId:        null,
              initialValue: v.initial_value,
              datatype:     v.datatype || "",
              unit:         "",
            };
          })
        );
        setTags(all);
      })
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, [layoutId]);  // ← NO incluir tagsMap aquí, se resuelve en el momento del fetch

  return { tags, loading };
}