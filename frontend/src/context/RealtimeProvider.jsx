// frontend\src\context\RealtimeProvider.jsx
import { createContext, useContext, useEffect } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeData";

const RealtimeContext = createContext(null);

export function RealtimeProvider({ tenant, children }) {
  console.log("🏗️ REALTIME PROVIDER RENDERING con tenant:", tenant);
  
  useEffect(() => {
    console.log("✅ REALTIME PROVIDER MONTADO EN EL DOM");
    return () => console.log("❌ REALTIME PROVIDER DESMONTADO (UNMOUNT)");
  }, []);
  const { connected, allTags, tagsMap, dataStale } = useRealtimeData(tenant);
    return (
      <RealtimeContext.Provider value={{ connected, allTags, tagsMap, dataStale }}>
        {children}
      </RealtimeContext.Provider>
    );
  }

  export function useRealtime() {
    return useContext(RealtimeContext);
  }


