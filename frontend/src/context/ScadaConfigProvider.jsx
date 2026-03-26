import { createContext, useContext, useEffect, useState } from "react";
// Importamos tu instancia de axios configurada
import api from "../services/api"; 
import { buildTagTree, buildTagIndex } from "../modules/organizarScada/utils/tagUtils";

const ScadaConfigContext = createContext(null);

export function ScadaConfigProvider({ children }) {
  // Inicializamos con la estructura esperada para evitar errores de 'undefined' en los componentes hijos
  const [config, setConfig] = useState({ tags: [], tagTree: {}, tagIndex: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        console.log("Context: Cargando configuración de tags desde el servidor...");
        
        const response = await api.get("/api/scada/edge/gateway/tags/");
        const tags = response.data;

        if (tags && Array.isArray(tags)) {
          console.log(`✅ [ScadaConfig] ${tags.length} tags recibidos.`);
          
          // Procesamos los datos usando las utilidades
          const tagTree  = buildTagTree(tags);
          const tagIndex = buildTagIndex(tags);
          
          setConfig({ tags, tagTree, tagIndex });
        } else {
          console.warn("⚠️ [ScadaConfig] La respuesta no tiene el formato esperado (Array):", tags);
        }

      } catch (err) {
        console.error("❌ [ScadaConfig] Error al cargar la configuración:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  // Siempre entregamos el objeto config (aunque esté vacío al inicio)
  return (
    <ScadaConfigContext.Provider value={{ config, loading }}>
      {children}
    </ScadaConfigContext.Provider>
  );
}

export function useScadaConfig() {
  const context = useContext(ScadaConfigContext);
  if (!context) {
    throw new Error("useScadaConfig must be used inside ScadaConfigProvider");
  }
  return context;
}