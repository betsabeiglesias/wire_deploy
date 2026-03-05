import { useCallback, useEffect, useMemo, useState } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { formatValueWithDecimals } from "@/modules/organizarScada/utils/formatters";
import { parseNumericValue } from "@/modules/organizarScada/utils/numbers";

export default function useLiveTag(data) {
  const { allTags } = useRealtimeData();
  const [valueHistory, setValueHistory] = useState([]);

  const resolveLive = useCallback(() => {
    const settings = data?.settings || {};
    const eq = settings.equipment || data?.equipment;
    const variable = settings.variable || settings.attributeKey || data?.variable;
    const site = settings.site;
    const area = settings.area;
    const line = settings.line;
    const cell = settings.cell;

    if (!eq || !variable) return { value: undefined, unit: settings.unit };

    const candidate =
      allTags.find(
        (t) =>
          (t.equipment === eq || t.equipment_id === eq) &&
          t.variable === variable &&
          (!site || t.site === site) &&
          (!area || t.area === area) &&
          (!line || t.line === line) &&
          (!cell || t.cell === cell)
      ) || allTags.find((t) => t.equipment === eq && t.variable === variable);

    return {
      value: candidate?.value,
      unit: candidate?.unit || settings.unit,
      site: candidate?.site || site,
      area: candidate?.area || area,
      line: candidate?.line || line,
      cell: candidate?.cell || cell,
      equipment: candidate?.equipment || eq,
      variable: candidate?.variable || variable,
      timestamp: candidate?.timestamp,
    };
  }, [allTags, data]);

  useEffect(() => {
    const resolved = resolveLive();
    if (typeof resolved.value === "undefined") return;
    const timestamp = resolved.timestamp || new Date().toISOString();
    setValueHistory((prev) => {
      const last = prev.at(-1);
      if (last && last.timestamp === timestamp && last.value === resolved.value) {
        return prev;
      }
      const entry = {
        ...resolved,
        timestamp,
        displayValue: formatValueWithDecimals(resolved.value),
        numericValue: parseNumericValue(resolved.value),
      };
      const next = [...prev, entry];
      return next.slice(-20);
    });
  }, [resolveLive]);

  const live = useMemo(() => resolveLive(), [resolveLive]);

  return { live, valueHistory };
}
