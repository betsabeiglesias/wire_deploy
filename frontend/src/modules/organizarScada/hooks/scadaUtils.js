// organizarScada/hooks/useScadaConfig.js

import { useEffect, useState } from "react";
import axios from "axios";

export function useScadaConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    axios.get("/api/scada/api/tag-config/")              // OJO!!!! creo que es esta ruta, pero no estoy segura 100%
      .then(res => setConfig(res.data))
      .catch(err => console.error("Config error:", err));
  }, []);

  return config;
}