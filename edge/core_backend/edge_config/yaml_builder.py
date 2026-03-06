# edge_config/yaml_builder.py

"""
Generador de YAML en edge
"""

import yaml
from pathlib import Path

CONFIG_DIR = Path("/opt/suite/config")
PLC_DIR = CONFIG_DIR / "plc"


def build_yaml(cfg):

    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    PLC_DIR.mkdir(parents=True, exist_ok=True)

    equipments = []

    for eq in cfg["equipments"]:
        plc_name = eq["equipment_id"].split("/")[-1]
        plc_file = PLC_DIR / f"{plc_name}.yaml"
        with open(plc_file, "w") as f:
            yaml.safe_dump(eq, f, sort_keys=False)
        equipments.append({"items_file": str(plc_file)})

    gateway = {
        # RETOMAR
        "gateway": {
            "name": "scada-gw-01",
            "log_level": "INFO"
        },
        "equipments": equipments
    }

    with open(CONFIG_DIR / "gateway.yaml", "w") as f:
        yaml.safe_dump(gateway, f, sort_keys=False)