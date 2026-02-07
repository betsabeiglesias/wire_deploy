# edge/mqtt_bridge/bridge.py

import json
import threading
import logging
from typing import Optional
import signal
import paho.mqtt.client as mqtt
import redis

from gateway_domain.process_value import ProcessValue

logger = logging.getLogger("edge.mqtt_bridge")


def extract_tenant_from_topic(topic: str) -> Optional[str]:
    """
    Extrae el tenant del topic MQTT.
    Ej:
      clienteA/area/line/equip/tag/temp -> clienteA
    """
    if not topic:
        return None
    return topic.split("/", 1)[0]


class MQTTEventBridge:
    """
    Bridge MQTT → Redis (Realtime Events)

    - Siempre activo
    - No depende del frontend
    - No conoce Django ni WebSockets
    - ✅ NUEVO: Replica a Redis central (opcional)
    """

    def __init__(
        self,
        *,
        tenant: str,
        mqtt_host: str,
        mqtt_port: int,
        mqtt_username: str,
        mqtt_password: str,
        redis_host: str,
        redis_port: int,
        # ✅ NUEVO: Redis central para replicación
        central_redis_host: Optional[str] = None,
        central_redis_port: int = 6379,
        central_redis_password: Optional[str] = None,
        client_id: Optional[str] = None,
        use_tls: bool = False,
    ):
        self.tenant = tenant
        self.client_id = client_id or f"{tenant}-mqtt-bridge"

        # ---------- MQTT ----------
        self._mqtt = mqtt.Client(
            client_id=self.client_id,
            clean_session=True,
            callback_api_version=mqtt.CallbackAPIVersion.VERSION1,
        )
        self._mqtt.username_pw_set(mqtt_username, mqtt_password)

        if use_tls:
            self._mqtt.tls_set()

        self._mqtt.on_connect = self._on_connect
        self._mqtt.on_disconnect = self._on_disconnect
        self._mqtt.on_message = self._on_message

        self._mqtt_host = mqtt_host
        self._mqtt_port = mqtt_port

        # ---------- Redis Local (Edge) ----------
        self._redis = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True,
        )
        logger.info(f"📍 Local Redis: {redis_host}:{redis_port}")

        # ---------- Redis Central (Opcional) ----------
        self._central_redis = None
        if central_redis_host:
            try:
                self._central_redis = redis.Redis(
                    host=central_redis_host,
                    port=central_redis_port,
                    password=central_redis_password,
                    decode_responses=True,
                )
                # Test connection
                self._central_redis.ping()
                logger.info(f"🌐 Central Redis connected: {central_redis_host}:{central_redis_port}")
            except Exception as e:
                logger.error(f"❌ Failed to connect to central Redis: {e}")
                logger.warning("⚠️  Continuing WITHOUT central replication")
                self._central_redis = None

        self._thread: Optional[threading.Thread] = None

    # ---------------------------------------------------------
    # MQTT callbacks
    # ---------------------------------------------------------

    def _on_connect(self, client, userdata, flags, rc):
        if rc != 0:
            logger.error("❌ MQTT connection failed (rc=%s)", rc)
            return

        topic = f"{self.tenant}/#"
        logger.info("🟢 MQTT connected. Subscribing to %s", topic)
        client.subscribe(topic, qos=1)

    def _on_disconnect(self, client, userdata, rc):
        logger.warning("🔌 MQTT disconnected (rc=%s)", rc)

    def _on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload_raw = msg.payload.decode("utf-8")

            tenant = extract_tenant_from_topic(topic)
            if tenant != self.tenant:
                return  # seguridad extra

            data = json.loads(payload_raw)

            if data.get("schema") != "v1.tag":
                return

            pv = ProcessValue.from_tag(data)
            if not pv:
                logger.warning(
                    "❌ Discarded tag | tenant=%s topic=%s equipment_id=%s variable=%s",
                    self.tenant,
                    topic,
                    data.get("equipment_id"),
                    data.get("variable"),
                )
                return

            event = pv.to_event(tenant=self.tenant)
            stream_key = f"scada:stream:{tenant}"
            last_key = f"scada:last:{tenant}:{pv.equipment_id}:{pv.variable}"
            event_json = json.dumps(event)

            # ✅ 1. Escribir en Redis LOCAL (siempre)
            try:
                self._redis.xadd(
                    stream_key,
                    {"event": event_json},
                    maxlen=10000,
                    approximate=True
                )
                self._redis.set(last_key, event_json)
                
                logger.debug(
                    "📡 Local Redis | tenant=%s equip=%s var=%s",
                    tenant,
                    pv.equipment_id,
                    pv.variable,
                )
            except Exception as e:
                logger.error(f"❌ Error writing to local Redis: {e}")

            # ✅ 2. Replicar a Redis CENTRAL (si está configurado)
            if self._central_redis:
                try:
                    self._central_redis.xadd(
                        stream_key,
                        {"event": event_json},
                        maxlen=10000,
                        approximate=True
                    )
                    self._central_redis.set(last_key, event_json)
                    
                    logger.debug(
                        "🌐 Central Redis | tenant=%s equip=%s var=%s",
                        tenant,
                        pv.equipment_id,
                        pv.variable,
                    )
                except Exception as e:
                    # No fallar si la replicación falla
                    logger.warning(f"⚠️  Failed to replicate to central Redis: {e}")

            logger.info(
                "Bridge RX | topic=%s | payload_len=%d",
                msg.topic,
                len(msg.payload),
            )

        except Exception as exc:
            logger.exception("❌ Error processing MQTT message: %s", exc)

    # ---------------------------------------------------------
    # Lifecycle
    # ---------------------------------------------------------

    def start(self):
        def shutdown(signum, frame):
            logger.info("🛑 Shutting down MQTT bridge")
            self._mqtt.disconnect()
            self._mqtt.loop_stop()
            raise SystemExit(0)

        signal.signal(signal.SIGTERM, shutdown)
        signal.signal(signal.SIGINT, shutdown)

        self._mqtt.connect(self._mqtt_host, self._mqtt_port, keepalive=30)
        self._mqtt.loop_forever()