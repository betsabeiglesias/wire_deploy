# gateway/publishers.py
import json
from importlib import import_module
import os
from typing import Callable, Dict, Any, Optional
from datetime import datetime, timezone
from urllib.parse import urlparse
import time
import paho.mqtt.client as mqtt
from domain.process_value import ProcessValue
from collections import deque

import logging
logger = logging.getLogger("gateway.mqtt")

def _utc_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def _iso_to_epoch_ms(ts: str) -> int:
    return int(
        datetime.fromisoformat(ts.replace("Z", "+00:00"))
        .timestamp() * 1000
    )

def _topic_for_tag(tag: Dict[str, Any]) -> str:
    """
    Construye el topic MQTT siguiendo jerarquía ISA-95.

    - Usa campos explícitos (site, area, line, cell, equipment) si existen.
    - Si no, intenta inferirlos desde equipment_id.
    """


    site = tag.get("site")
    area = tag.get("area")
    line = tag.get("line")
    cell = tag.get("cell")
    equipment = tag.get("equipment")

    # Inferir desde equipment_id si no vienen separados
    if not any([site, area, line, cell, equipment]):
        eqid = tag.get("equipment_id", "")
        parts = [p for p in eqid.split("/") if p]
        if len(parts) >= 5:
            site, area, line, cell, equipment = parts[:5]
        elif len(parts) == 4:
            site, area, line, equipment = parts
        elif len(parts) == 3:
            site, area, equipment = parts
        elif len(parts) == 2:
            site, area = parts
            equipment = parts[-1]
        elif len(parts) == 1:
            site = equipment = parts[0]
            area, line, cell = None, None, None
        else:
            site, area, equipment = "Unknown", "Unknown", "Unknown"

    variable = tag.get("variable", "unknown")

    # --- Construcción del topic ---
    topic_parts = []

    # jerarquía ISA-95
    if site: topic_parts += [site]
    if area: topic_parts += ["area", area]
    if line: topic_parts += ["line", line]
    if cell: topic_parts += ["cell", cell]
    if equipment: topic_parts += ["equip", equipment]
    
    # variable o señal final
    topic_parts += ["tag", variable]

    topic = "/".join(topic_parts)
    return topic


def _status_topics(tenant: str, gateway_name: str) -> Dict[str, str]:
    """
    Topics de estado del gateway (online / heartbeat).
    Aislados por tenant.
    """
    base = f"{tenant}/gateway/{gateway_name}/status"
    return {
        "online": f"{base}/online",
        "heartbeat": f"{base}/heartbeat",
    }


def make_publisher(root_cfg: Dict[str, Any]) -> Callable[[ProcessValue], None]:
    print(">>> MQTT PUBLISH LLAMADO <<<")
    gw = root_cfg.get("gateway") or {}
    tenant = gw.get("tenant")
    if not tenant:
        raise ValueError("gateway.tenant es obligatorio para modo mqtt")

    pub = gw.get("publisher") or {}
    mode = (pub.get("mode") or "pretty").lower()

    if mode != "mqtt":
        raise ValueError(f"publisher.mode no soportado: {mode}")
   
    # --- Config --- (puedes tomar de YAML o de ENV)
    mqtt_url     = pub.get("url") or os.getenv("MQTT_URL", "tcp://localhost:1883")
    mqtt_user    = pub.get("username") or os.getenv("GATEWAY_MQTT_USER", "")
    mqtt_pass    = pub.get("password") or os.getenv("GATEWAY_MQTT_PASS", "")
    if not mqtt_user or not mqtt_pass:
        raise ValueError("Credenciales MQTT no configuradas (username/password)")

    # QoS/retain por tipo (defaults recomendados)
    qos_tag      = int(pub.get("qos_tag", 1))
    retain_tag   = bool(pub.get("retain_tag", True))
    qos_event    = int(pub.get("qos_event", 1))
    retain_event = bool(pub.get("retain_event", False))
    qos_status   = int(pub.get("qos_status", 1))
    retain_status= bool(pub.get("retain_status", True))

    # Equipamiento lógico principal para birth/LWT
    gateway_name = gw.get("name", "gw")
    status_tp = _status_topics(tenant, gateway_name)

    # Parse URL (tcp://host:port | ssl://host:port)
    parsed = urlparse(mqtt_url)
    scheme = parsed.scheme or "tcp"
    host   = parsed.hostname or "localhost"
    port   = parsed.port or (8883 if scheme == "ssl" else 1883)
    use_tls = scheme == "ssl"

    client_id = gw.get('name', f"{tenant}-gateway")
    client = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION1,
            client_id=client_id,
            clean_session=False,
            
        )
    
    client.username_pw_set(mqtt_user, password=mqtt_pass)
    client.username_pw_set(mqtt_user, password=mqtt_pass)

    if mqtt_user:
        client.username_pw_set(mqtt_user, mqtt_pass)

    if use_tls:
        client.tls_set()

    # LWT (last will & testament)
    client.will_set(
            status_tp["online"],
            payload=json.dumps({"online": False, "ts": _utc_iso()}),
            qos=qos_status,
            retain=retain_status
        )

    connected = {"ok": False}

    buffer = deque(maxlen=1000)  # Buffer circular de seguridad

    def on_connect(_cli, _ud, _flags, rc, _props=None):
        if rc == 0:
            connected["ok"] = True
            logger.info("MQTT conectado correctamente")

            # Publicar birth
            birth = json.dumps(
                {"online": True, "ts": _utc_iso()},
                ensure_ascii=False
            )
            _cli.publish(
                status_tp["online"],
                birth,
                qos=qos_status,
                retain=retain_status
            )

            # 🔥 Flush del buffer
            flushed = 0
            while buffer:
                t, p = buffer.popleft()
                _cli.publish(t, p, qos=qos_tag, retain=retain_tag)
                flushed += 1

            if flushed:
                logger.info(f"Buffer MQTT vaciado: {flushed} mensajes reenviados")

        else:
            connected["ok"] = False
            logger.error(f"Error conectando a MQTT: rc={rc}")


    def on_disconnect(_cli, _ud, rc):
        connected["ok"] = False
        logger.warning(f"MQTT desconectado rc={rc}")

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect

    client.reconnect_delay_set(min_delay=1, max_delay=30)

    client.on_disconnect = on_disconnect

    client.reconnect_delay_set(min_delay=1, max_delay=30)

    client.connect(host, port, keepalive=30)
    client.loop_start()

    # --- Publicador MQTT ---
    def _mqtt_publish(pv: ProcessValue) -> None:
        payload = {
            "schema": "v1.tag",
            "timestamp": _iso_to_epoch_ms(pv.timestamp),
            "equipment_id": pv.equipment_id,
            "variable": pv.variable,
            "datatype": pv.datatype,
            "unit": pv.unit,
            "quality": pv.quality,
            "value": pv.value,
            "source": pv.source,
        }

        dt = pv.datatype
        val = pv.value

        if dt == "Boolean":
            payload["value_bool"] = bool(val)
        elif dt in ("Int16", "Int32", "UInt16", "UInt32"):
            payload["value_int"] = int(val)
        elif dt in ("Float", "Double"):
            payload["value_float"] = float(val)
        elif dt in ("String", "Char"):
            payload["value_str"] = str(val)
        elif dt == "DateTime":
            payload["value_time"] = pv.timestamp
        else:
            logger.warning(
                "Datatype no soportado: %s (equipment=%s variable=%s)",
                dt, pv.equipment_id, pv.variable
            )
            return

        semantic_topic = _topic_for_tag(payload)
        topic = f"{tenant}/{semantic_topic}"
        payload_str = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))

        logger.info("[MQTT PUBLISH] topic=%s payload=%s", topic, payload_str)

        # 🔐 Si no hay conexión → buffer
        if not connected["ok"]:
            logger.warning("Broker no conectado, mensaje almacenado en buffer")
            buffer.append((topic, payload_str))
            return

        # 🚀 Publicación normal
        client.publish(
            topic,
            payload_str,
            qos=qos_tag,
            retain=retain_tag
        )
        info.wait_for_publish()

    return _mqtt_publish
