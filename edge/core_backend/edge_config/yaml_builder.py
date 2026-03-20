# edge_config/yaml_builder.py

import yaml
import os
from pathlib import Path

CONFIG_DIR = Path(os.getenv("SUITE_CONFIG_DIR", "/opt/suite/config"))
PLC_DIR = CONFIG_DIR / "plc"

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

    for eq in cfg["equipments"]:
        plc_name = eq["equipment_id"].split("/")[-1]
        plc_file = PLC_DIR / f"{plc_name}.yaml"
        _atomic_write(plc_file, eq)
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