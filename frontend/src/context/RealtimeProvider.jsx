// frontend/src/realtime/RealtimeProvider.jsx
import { createContext, useContext } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeData";

const RealtimeContext = createContext(null);

export function RealtimeProvider({ tenant, children }) {
  const realtime = useRealtimeData(tenant);

  return (
    <RealtimeContext.Provider value={realtime}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
