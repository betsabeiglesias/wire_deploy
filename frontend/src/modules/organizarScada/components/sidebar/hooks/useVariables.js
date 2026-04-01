// hooks/useVariables.js
//
// Fetch del árbol tabla → variables desde la API y estado de expansión.
// Extraído de UnifiedSidebar sin cambios funcionales.
//
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../../../services/api";

export default function useVariables(layoutId) {
  const [variables,      setVariables]      = useState([]);
  const [varsLoading,    setVarsLoading]    = useState(false);
  const [expandedTables, setExpandedTables] = useState({});

  const fetchVariables = useCallback(async () => {
    if (!layoutId) return;
    setVarsLoading(true);
    try {
      const res = await api.get(`/api/scada/layouts/${layoutId}/tables/`);
      setVariables(res.data || []);
    } catch {
      setVariables([]);
    } finally {
      setVarsLoading(false);
    }
  }, [layoutId]);

  useEffect(() => {
    if (layoutId) fetchVariables();
    else setVariables([]);
  }, [layoutId, fetchVariables]);

  const totalVarsCount = useMemo(
    () => variables.reduce((acc, t) => acc + (t.variables?.length || 0), 0),
    [variables],
  );

  const toggleTable = (key) =>
    setExpandedTables((prev) => ({ ...prev, [key]: !prev[key] }));

  return {
    variables,
    varsLoading,
    totalVarsCount,
    expandedTables,
    toggleTable,
    fetchVariables,
  };
}
