/**
 * useRealtimeStore.js
 *
 * Estado global de tiempo real (WebSocket SCADA) en Zustand.
 * Sustituye al RealtimeContext para evitar re-renders en cascada:
 * cada componente suscribe solo el slice que consume.
 *
 * Ejemplo de uso con selector granular:
 *   const connected  = useRealtimeStore(s => s.connected);
 *   const allTags    = useRealtimeStore(s => s.allTags);
 *   const tagsMap    = useRealtimeStore(s => s.tagsMap);
 *
 * Para un tag específico (re-render solo cuando cambia ese tag):
 *   import { useShallow } from 'zustand/react/shallow';
 *   const entry = useRealtimeStore(
 *     useShallow(s => s.tagsMap.get('site/area/line/cell/equip:variable') ?? null)
 *   );
 */

import { create } from 'zustand';

const useRealtimeStore = create((set) => ({
  connected: false,
  dataStale: false,
  tagsMap: new Map(),
  allTags: [],

  /**
   * Llamado por RealtimeProvider cada vez que useRealtimeData emite nuevos valores.
   * Actualiza solo los slices que realmente cambiaron para minimizar re-renders.
   */
  _sync: ({ connected, dataStale, tagsMap, allTags }) =>
    set((prev) => {
      const patch = {};
      if (prev.connected !== connected) patch.connected = connected;
      if (prev.dataStale !== dataStale) patch.dataStale = dataStale;
      if (prev.tagsMap   !== tagsMap)   patch.tagsMap   = tagsMap;
      if (prev.allTags   !== allTags)   patch.allTags   = allTags;
      return patch;
    }),
}));

export default useRealtimeStore;
