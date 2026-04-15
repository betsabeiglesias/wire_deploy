// src/modules/organizarScada/hooks/useProjectTags.js
import { useEffect, useMemo, useState } from "react";

export function useProjectTags(layoutId, tagsMap = new Map()) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!layoutId) {
      setTables([]);
      return;
    }

    setLoading(true);
    fetch(`/api/scada/layouts/${layoutId}/tables/`, { credentials: "include" })
      .then((r) => r.json())
      .then((responseTables) => setTables(Array.isArray(responseTables) ? responseTables : []))
      .catch(() => setTables([]))
      .finally(() => setLoading(false));
  }, [layoutId]);

  const tags = useMemo(() => {
    return tables.flatMap((table) =>
      (table.variables || []).map((v) => {
        if (v.source === "connection") {
          let equipmentId = v.equipment_id || "";

          // Cuando el layout no persistio equipment_id, lo resolvemos con el mapa realtime actual.
          if (!equipmentId) {
            for (const [, tag] of tagsMap.entries()) {
              if (tag.equipment === v.equipment && tag.variable === v.variable) {
                equipmentId = tag.equipment_id;
                break;
              }
            }
          }

          return {
            id: v.variable_id,
            name: v.name,
            source: "connection",
            tagId: equipmentId ? `${equipmentId}:${v.variable}` : null,
            equipment: v.equipment,
            variable: v.variable,
            unit: v.unit || "",
            datatype: v.datatype || "",
          };
        }

        return {
          id: v.variable_id,
          name: v.name,
          source: "local",
          tagId: null,
          initialValue: v.initial_value,
          datatype: v.datatype || "",
          unit: "",
        };
      })
    );
  }, [tables, tagsMap]);

  return { tags, loading };
}
