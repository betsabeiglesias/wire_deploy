# edge_config/yaml_builder.py

import yaml
import os
from pathlib import Path


# RETOMAR
CONFIG_DIR = Path(os.getenv("SUITE_CONFIG_DIR", "/opt/suite/config"))
PLC_DIR = CONFIG_DIR / "plc"

def normalize_opcua(eq: dict) -> dict:
    out = eq.copy()

    conn = eq.get("connection_data", {})
    if not conn:
        raise ValueError("OPCUA requires connection_data")

    # ---------------------------
    # CONNECTION (solo lo permitido por schema)
    # ---------------------------
    new_conn = {
        "endpoint": conn["endpoint"]
    }

    for k in [
        "namespace_uri",
        "security_mode",
        "security_policy",
        "certificate",
        "private_key",
        "application_uri",
        "cert_uri",
        "username",
        "password",
        "timeouts_ms",
        "reconnect",
    ]:
        if k in conn:
            new_conn[k] = conn[k]

    out["connection"] = new_conn

    # ---------------------------
    # SUBSCRIPTION (SALE de connection_data)
    # ---------------------------
    if "subscription" in conn:
        out["subscription"] = conn["subscription"]

    # ---------------------------
    # ITEMS (normalización mínima segura)
    # ---------------------------
    new_items = []

    for item in out.get("items", []):
        new_item = {
            "datatype": item["datatype"]
        }

        if "name" in item:
            new_item["name"] = item["name"]

        # addressing (clave OPCUA)
        addressing = item.get("addressing", {})

        if "node_id" in addressing:
            new_item["addressing"] = {"node_id": addressing["node_id"]}

        elif "address" in addressing:
            # fallback frontend
            new_item["addressing"] = {"node_id": addressing["address"]}

        elif "browse_path" in addressing:
            new_item["addressing"] = {"browse_path": addressing["browse_path"]}

        # CDC (permitido por schema)
        if "cdc" in item:
            new_item["cdc"] = item["cdc"]

        if "unit" in item:
            new_item["unit"] = item["unit"]

        if "description" in item:
            new_item["description"] = item["description"]

        new_items.append(new_item)

    out["items"] = new_items

    # ---------------------------
    # LIMPIEZA CAMPOS API (CRÍTICO)
    # ---------------------------
    out.pop("connection_data", None)
    out.pop("connection_string", None)
    out.pop("id", None)

    return out

def normalize_snap7(eq: dict) -> dict:
    out = eq.copy()

    # ---------------------------
    # CONNECTION
    # ---------------------------
    conn = out.get("connection_data", {})
    ip = conn.get("ip") or conn.get("hostname")
    if not ip:
        raise ValueError(f"Snap7 requires ip/hostname: {eq.get('equipment_id')}")

    rack = conn.get("rack")
    slot = conn.get("slot")

    if "rack" not in conn or "slot" not in conn:
        print(f"[WARNING] Snap7 missing rack/slot → default used (0,1) for {eq.get('equipment_id')}")

    new_conn = {
        "ip": ip,
        "rack": rack,
        "slot": slot,
    }

    if "timeout_ms" in conn:
        new_conn["timeout_ms"] = conn["timeout_ms"]

    if "pdu_size" in conn:
        new_conn["pdu_size"] = conn["pdu_size"]

    out["connection"] = new_conn

    # ---------------------------
    # POLLING (snap7 usa bloque separado)
    # ---------------------------
    poll_ms = conn.get("poll_ms") or eq.get("poll_ms")
    if poll_ms:
        out["polling"] = {"interval_ms": poll_ms}

    # ---------------------------
    # LIMPIAR CAMPOS NO PERMITIDOS
    # ---------------------------
    # snap7 NO permite esto en connection
    for k in ["poll_ms", "reconnect", "hostname"]:
        out["connection"].pop(k, None)

    # ---------------------------
    # ITEMS
    # ---------------------------
    new_items = []
    for item in out.get("items", []):
        addr = item.get("addressing", {}).get("address")

        new_item = {
            "name": item.get("name"),
            "datatype": item["datatype"],
            "address": addr,
        }

        if item.get("unit"):
            new_item["unit"] = item["unit"]

        new_items.append(new_item)

    out["items"] = new_items

    return out

def normalize_modbus(eq: dict) -> dict:
    conn = eq.get("connection_data", {})
    items = eq.get("items", [])

    # =========================
    # 🔌 CONNECTION (ALINEADO DRIVER)
    # =========================
    host = conn.get("host")
    if not host:
        raise ValueError("Modbus: 'host' is required")

    connection = {
        "host": host,
        "port": conn.get("port", 502),
        "poll_rate_ms": conn.get("poll_rate_ms", 500),
        "unit_id": conn.get("unit_id", 1),  # importante para multi-slave
    }

    # =========================
    # 🔁 FORMATO MODBUS (CLAVE)
    # =========================
    modbus_format = {
        "byte_order": conn.get("byte_order", "big"),
        "word_order": conn.get("word_order", "little"),  # S7 default correcto
    }

    # =========================
    # 📡 ITEMS (ALINEADO DRIVER)
    # =========================
    norm_items = []

    for item in items:
        addr = item.get("addressing", {})

        if "address" not in addr:
            raise ValueError(f"Modbus item '{item.get('name')}' missing address")

        norm_item = {
            "name": item["name"],
            "datatype": item.get("datatype", "Int16"),
            "unit": item.get("unit", ""),
            "description": item.get("description", ""),

            # 🔥 DRIVER USA address directo
            "address": addr["address"],

            # 🔥 FC
            "fc": addr.get("fc", 3),

            # 🔥 OPCIONAL (para overrides por tag)
            "format": item.get("format", {}),
            
            # passthrough
            "cdc": item.get("cdc", {}),
        }

        norm_items.append(norm_item)

    # =========================
    # 🧩 FINAL STRUCTURE
    # =========================
    return {
        "equipment_id": eq["equipment_id"],
        "driver": "modbus",

        "connection": connection,
        "modbus_format": modbus_format,  # 👈 CLAVE para tu driver
        "isa95": eq.get("isa95", {}),
        "items": norm_items,
    }


def normalize_equipment(eq: dict) -> dict:
    driver = eq.get("driver", "").lower().replace("-", "")

    if driver == "snap7":
        return normalize_snap7(eq)
    elif driver == "opcua":
        return normalize_opcua(eq)
    elif driver == "modbus":   # 👈 AÑADIR ESTO
        return normalize_modbus(eq)
    else:
        raise ValueError(f"Unknown driver {driver}")

def _atomic_write(path: Path, data: dict):
    """Escribe en un .tmp y luego hace rename para evitar lecturas parciales."""
    tmp = path.with_suffix(".yaml.tmp")
    with open(tmp, "w") as f:
        yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)
    tmp.rename(path)


def build_yaml(cfg):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    PLC_DIR.mkdir(parents=True, exist_ok=True)

    equipments = []

    # ---------------------------
    # CLEAN OLD FILES
    # ---------------------------
    existing_files = set(p.name for p in PLC_DIR.glob("*.yaml"))

    expected_files = set()
    for eq in cfg["equipments"]:
        plc_name = eq["equipment_id"].split("/")[-1]
        expected_files.add(f"{plc_name}.yaml")

    to_delete = existing_files - expected_files

    for fname in to_delete:
        (PLC_DIR / fname).unlink()
        print(f"Deleted obsolete config: {fname}")

    for eq in cfg["equipments"]:
        plc_name = eq["equipment_id"].split("/")[-1]
        plc_file = PLC_DIR / f"{plc_name}.yaml"
        normalized = normalize_equipment(eq)
        _atomic_write(plc_file, normalized)
        equipments.append({"items_file": f"plc/{plc_name}.yaml"})

    gateway = {
        "gateway": {
            "name": os.getenv("GATEWAY_NAME", "scada-gw-01"),
            "tenant": os.getenv("TENANT"),
            "log_level": os.getenv("GATEWAY_LOG_LEVEL", "INFO"),
            "publisher": {
                "mode": "mqtt",
                "url": os.getenv("MQTT_URL", "tcp://mosquitto:1883"),
                "topic_prefix": os.getenv("MQTT_TOPIC_PREFIX", "plant"),
            },
        },
        "defaults": {
            "subscription": {
                "publishing_interval_ms": 500,
                "sampling_interval_ms": 200,
                "queue_size": 10,
                "discard_oldest": True,
            },
            "polling": {"interval_ms": 5000},
            "on_change_only": False,
            "quality_on_bad": "drop",
            "deadband": {"type": "none", "value": 0},
        },
        "equipments": equipments,
    }

    _atomic_write(CONFIG_DIR / "gateway.yaml", gateway)