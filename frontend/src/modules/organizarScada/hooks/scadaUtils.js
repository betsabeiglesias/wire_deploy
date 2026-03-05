// organizarScada/hooks/useScadaConfig.js

import { useEffect, useState } from "react";
import axios from "axios";

export function useScadaConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    axios.get("/api/config/export/")
      .then(res => setConfig(res.data))
      .catch(err => console.error("Config error:", err));
  }, []);

  return config;
}