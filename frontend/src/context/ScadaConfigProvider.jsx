// context/ScadaConfigProvider.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { buildTagTree, buildTagIndex } from "../modules/organizarScada/utils/tagUtils";

const ScadaConfigContext = createContext(null);

export function ScadaConfigProvider({ children }) {

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadConfig() {

      try {

        const response = await fetch("/api/edge/gateway/tags/", {
          credentials: "include",  // esto envía las cookies automáticamente
        });

        if (!response.ok) throw new Error("Error loading config");

        const tags = await response.json();
        console.log("Tags recibidos:", tags.length, tags[0]);
        const tagTree  = buildTagTree(tags);
        const tagIndex = buildTagIndex(tags);
        console.log("tagTree:", tagTree);  
        console.log("tagIndex:", tagIndex);

        setConfig({ tags, tagTree, tagIndex });

      } catch (err) {

        console.error("Error loading SCADA config", err);

      } finally {

        setLoading(false);

      }

    }

    loadConfig();

  }, []);

  return (
    <ScadaConfigContext.Provider value={{ config, loading }}>
      {children}
    </ScadaConfigContext.Provider>
  );

}

export function useScadaConfig() {
  const context = useContext(ScadaConfigContext);
  if (!context) throw new Error("useScadaConfig must be used inside ScadaConfigProvider");
  return context;
}