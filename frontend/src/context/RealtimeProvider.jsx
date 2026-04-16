/**
 * RealtimeProvider.jsx
 *
 * Thin wrapper que arranca el WebSocket (useRealtimeData) y sincroniza
 * el resultado al store global de Zustand (useRealtimeStore).
 *
 * Ya NO usa React Context. Los consumidores deben importar el store:
 *   import useRealtimeStore from '@/store/useRealtimeStore';
 *
 * La función useRealtime() se conserva como shim de compatibilidad
 * TEMPORAL para facilitar la migración progresiva. No usa useContext.
 */

import { useEffect } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import useRealtimeStore from "@/store/useRealtimeStore";

export function RealtimeProvider({ tenant, children }) {
  const { connected, allTags, tagsMap, dataStale } = useRealtimeData(tenant);
  const _sync = useRealtimeStore((s) => s._sync);

  useEffect(() => {
    _sync({ connected, allTags, tagsMap, dataStale });
  }, [connected, allTags, tagsMap, dataStale, _sync]);

  return children;
}
