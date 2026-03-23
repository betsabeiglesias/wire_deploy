// fronted/src/hooks/useGatewayData.js

import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

// Build MQTT WebSocket URL
const scheme = window.location.protocol === "https:" ? "wss" : "ws";
const host = import.meta?.env?.VITE_MQTT_HOST || window.location.hostname;
const port = import.meta?.env?.VITE_MQTT_PORT || "9001";
const MQTT_URL = `${scheme}://${host}:${port}`;

// Parses ISA-95-like topic hierarchy
function parseTopicHierarchy(topic) {
  const parts = topic.split("/").filter(Boolean);
  const levels = {
    site: null,
    area: null,
    line: null,
    cell: null,
    equipment: null,
    variable: null,
  };

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const val = parts[i + 1];

    if (key === "plant" && val) levels.site = val;
    if (key === "area" && val) levels.area = val;
    if (key === "line" && val) levels.line = val;
    if (key === "cell" && val) levels.cell = val;
    if (key === "equip" && val) levels.equipment = val;
  }

  // ✔ variable = todo lo que viene después de "tag"
  const tagIndex = parts.indexOf("tag");
  if (tagIndex >= 0) {
    levels.variable = parts.slice(tagIndex + 1).join("/");
  }

  return levels;
}

export function useGatewayData() {
  const [connected, setConnected] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const [dataStale, setDataStale] = useState(false);

  const clientRef = useRef(null);

  useEffect(() => {
    // 🔑 EXTRAEMOS EL TOKEN PARA MQTT
    // Asegúrate de que el nombre coincide con cómo lo guardas tras el login ('token' o 'access')
    const token = localStorage.getItem("token") || localStorage.getItem("access");

    const mqttOptions = {
      reconnectPeriod: 1500,
      clientId: `web_client_${Math.random().toString(16).slice(2, 8)}`,
      // Enviamos el token como password
      username: "jwt", 
      password: token || "", 
    };

    const c = mqtt.connect(MQTT_URL, mqttOptions);
    clientRef.current = c;

    c.on("connect", () => {
      console.log("✅ MQTT Conectado con Token");
      setConnected(true);
      c.subscribe("plant/#");
    });

    c.on("close", () => {
      console.warn("❌ MQTT Conexión cerrada");
      setConnected(false);
    });

    c.on("error", (err) => {
      console.error("MQTT error:", err.message);
    });

    // -----------------------------------------------------
    // MESSAGE HANDLER
    // -----------------------------------------------------
    c.on("message", (topic, payload) => {
      setLastMessageAt(Date.now());
      setDataStale(false);

      try {
        const msg = JSON.parse(payload.toString());

        const { site, area, line, cell, equipment, variable } =
          parseTopicHierarchy(topic);

        const equipment_id =
          msg.equipment_id ||
          equipment ||
          msg.source?.ip ||
          msg.source?.endpoint ||
          "unknown_equipment";

        // Ignorar tópicos de estado del gateway
        if (topic.includes("/status/")) return;

        // Solo procesar tópicos que contengan "tag/"
        if (!topic.includes("/tag/")) return;

        // Validación final de variable
        if (!variable) return;

        const entry = {
          site,
          area,
          line,
          cell,
          equipment,
          equipment_id,
          variable,
          value: msg.value,
          unit: msg.unit,
          quality: msg.quality,
          timestamp: msg.timestamp,
          source: msg.source || {},
          raw: msg,
        };

        // ----------- DEDUPLICACIÓN ROBUSTA -----------
        setAllTags((prev) => {
          const key = `${entry.equipment_id}:${entry.variable}`;
          const map = new Map(
            prev.map((t) => [`${t.equipment_id}:${t.variable}`, t])
          );
          map.set(key, { ...map.get(key), ...entry });
          return Array.from(map.values());
        });

      } catch (err) {
        console.warn("Mensaje MQTT inválido:", err);
      }
    });

    // CLEANUP CORRECTO
    return () => {
      if (c) {
        try {
          c.end(true);
        } catch (_) {}
      }
    };
  }, []); // Se ejecuta una vez al montar

  // -------- WATCHDOG -----------
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastMessageAt) {
        setDataStale(true);
        return;
      }
      if (Date.now() - lastMessageAt > 10000) {
        setDataStale(true);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [lastMessageAt]);

  return { connected, dataStale, allTags, lastMessageAt };
}