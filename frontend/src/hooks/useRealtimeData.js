import { useEffect, useRef, useState } from "react";
import api from "@/services/api";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8002";

export function useRealtimeData(tenant) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error
  const [allTags, setAllTags] = useState([]);
  const [tagsMap, setTagsMap] = useState(new Map());
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const [dataStale, setDataStale] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    if (!tenant) {
      console.warn("⏳ Esperando tenant para iniciar realtime...");
      return;
    }

    console.log("🚀 Iniciando realtime con tenant:", tenant);

    async function connect() {
      if (cancelledRef.current) return;

      try {
        setStatus("connecting");

        // 🔐 Pedir token
        console.log("🔑 Pidiendo token realtime…");
        const res = await api.get("/api/scada/realtime/token/");
        const token = res.data.token;

        if (cancelledRef.current) return;

        // 🔒 Cerrar conexión previa si existe
        if (wsRef.current) {
          console.log("♻️ Cerrando WS previo");
          wsRef.current.close();
          wsRef.current = null;
        }

        console.log("🔌 Conectando WS…");

        const ws = new WebSocket(`${WS_URL}/ws/realtime/?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("🟢 Realtime WS connected");
          setConnected(true);
          setStatus("connected");
          retryCountRef.current = 0;

          // 👉 Aquí podrías enviar suscripción si tu backend lo requiere
          // ws.send(JSON.stringify({ type: "subscribe", variables: [...] }));
        };

        ws.onmessage = (evt) => {
          setLastMessageAt(Date.now());
          setDataStale(false);

          try {
            const msg = JSON.parse(evt.data);
            const parts = (msg.equipment_id || "").split("/");

            const entry = {
              site: parts[0] || msg.site || "",
              area: parts[1] || msg.area || "",
              line: parts[2] || msg.line || "",
              cell: parts[3] || msg.cell || "",
              equipment: parts[4] || msg.equipment || "",
              equipment_id: msg.equipment_id,
              variable: msg.variable,
              value: msg.value,
              unit: msg.unit,
              quality: msg.quality,
              timestamp: msg.timestamp,
              source: msg.source || {},
              raw: msg,
            };

            const tagKey = `${entry.equipment_id}:${entry.variable}`;

            setTagsMap((prev) => {
              const next = new Map(prev);
              next.set(tagKey, { ...next.get(tagKey), ...entry });
              return next;
            });

            setAllTags((prev) => {
              const map = new Map(
                prev.map((t) => [`${t.equipment_id}:${t.variable}`, t])
              );
              map.set(tagKey, { ...map.get(tagKey), ...entry });
              return Array.from(map.values());
            });

          } catch (err) {
            console.warn("⚠️ Mensaje WS inválido:", err);
          }
        };

        ws.onerror = (err) => {
          console.error("❌ WS error", err);
          setStatus("error");
        };

        ws.onclose = (event) => {
          console.warn("🔌 WS cerrado", event.code);
          setConnected(false);
          setStatus("idle");

          if (cancelledRef.current) return;

          // 🔁 Reconnect SIEMPRE (con backoff)
          const retryDelay = Math.min(1000 * 2 ** retryCountRef.current, 10000);
          retryCountRef.current += 1;

          console.log(`🔄 Reintentando conexión en ${retryDelay} ms`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, retryDelay);
        };

      } catch (err) {
        console.error("❌ Error obteniendo token realtime", err);
        setStatus("error");

        // retry también si falla token
        if (!cancelledRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 2000);
        }
      }
    }

    connect();

    return () => {
      console.log("🧹 Cleanup realtime hook");

      cancelledRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [tenant]);

  // -------- WATCHDOG (detección de datos congelados) --------
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

  return {
    connected,
    status,
    dataStale,
    allTags,
    tagsMap,
    lastMessageAt,
  };
}