import { useEffect, useRef, useState } from "react";
import api from "@/services/api";

export function useRealtimeData(tenant) {
  const [connected, setConnected] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const [dataStale, setDataStale] = useState(false);

  const wsRef = useRef(null);

  useEffect(() => {
    if (!tenant) return;

    let ws;
    let cancelled = false;

    async function connect() {
      try {
        console.log("🔑 Pidiendo token realtime…");

        const res = await api.get("/api/realtime/token/");
        const token = res.data.token;

        if (cancelled) return;

        console.log("🔌 Conectando WS");

        ws = new WebSocket(
          `ws://localhost:8002/ws/realtime/?token=${token}`
        );

        wsRef.current = ws;

        ws.onopen = () => {
          console.log("🟢 Realtime WS connected");
          setConnected(true);
        };

        ws.onclose = () => {
          console.warn("🔌 Realtime WS closed");
          setConnected(false);
        };

        ws.onerror = (err) => {
          console.error("❌ Realtime WS error", err);
        };

        ws.onmessage = (evt) => {
          setLastMessageAt(Date.now());
          setDataStale(false);

          try {
            const msg = JSON.parse(evt.data);

            const entry = {
              equipment_id: msg.equipment_id,
              variable: msg.variable,
              value: msg.value,
              unit: msg.unit,
              quality: msg.quality,
              timestamp: msg.timestamp,
              source: msg.source || {},
              raw: msg,
            };

            setAllTags((prev) => {
              const key = `${entry.equipment_id}:${entry.variable}`;
              const map = new Map(
                prev.map((t) => [`${t.equipment_id}:${t.variable}`, t])
              );
              map.set(key, { ...map.get(key), ...entry });
              return Array.from(map.values());
            });
          } catch (err) {
            console.warn("Mensaje WS inválido:", err);
          }
        };
      } catch (err) {
        console.error("❌ No se pudo obtener token realtime", err);
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [tenant]);

  // -------- WATCHDOG --------
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
