# industrial_config_manager/services/gateway_builder.py

import yaml
from pathlib import Path
from industrial_config_manager.models import PLC

GATEWAY_CONFIG_PATH = Path("/opt/suite/config/gateway.yaml")

def build_gateway_yaml():
    """
    Genera gateway.yaml según PLCs enabled=true.
    Crea el archivo si no existe.
    """
    plcs = PLC.objects.filter(enabled=True)
    plcs = PLC.objects.filter(enabled=True)

    equipments = [
        {"items_file": f"/opt/suite/config/plc/{plc.name}.yaml"}
        for plc in plcs
    ]

    # Plantilla base del gateway
    data = {
        "gateway": {
            "name": "scada-gw-01",
            "log_level": "INFO",
            "publisher": {
                "mode": "mqtt",
                "url": "tcp://mosquitto:1883",
                "topic_prefix": "plant"
            }
        },
        "defaults": {
            "subscription": {
                "publishing_interval_ms": 500,
                "sampling_interval_ms": 200,
                "queue_size": 10,
                "discard_oldest": True
            },
            "polling": {
                "interval_ms": 5000
            },
            "on_change_only": False,
            "quality_on_bad": "drop",
            "deadband": {
                "type": "none",
                "value": 0
            }
        },
        "equipments": equipments
    }

    GATEWAY_CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(GATEWAY_CONFIG_PATH, "w") as f:
        yaml.safe_dump(data, f, sort_keys=False)

    return str(GATEWAY_CONFIG_PATH)
