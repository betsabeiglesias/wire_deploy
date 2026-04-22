# edge/core_backend/mqtt_bridge/run.py

import os
import logging
from dotenv import load_dotenv  # ✅ Agregar

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from mqtt_bridge.bridge import MQTTEventBridge


def _env_flag(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}

def main():
    # ✅ Cargar .env
    load_dotenv()

    direct_central_replication = _env_flag(
        "ENABLE_DIRECT_CENTRAL_REDIS_REPLICATION",
        default=True,
    )
    
    bridge = MQTTEventBridge(
        tenant=os.environ["TENANT"],

        mqtt_host=os.environ["MQTT_HOST"],
        mqtt_port=int(os.environ.get("MQTT_PORT", 1883)),
        mqtt_username=os.environ.get("MQTT_USER"),
        mqtt_password=os.environ.get("MQTT_PASSWORD"),

        redis_host=os.environ["REDIS_HOST"],
        redis_port=int(os.environ.get("REDIS_PORT", 6379)),
        
        # Redis central (opcional)
        central_redis_host=(
            os.environ.get("CENTRAL_REDIS_HOST")
            if direct_central_replication
            else None
        ),
        central_redis_port=int(os.environ.get("CENTRAL_REDIS_PORT", 6379)),
        central_redis_password=(
            os.environ.get("CENTRAL_REDIS_PASSWORD")
            if direct_central_replication
            else None
        ),
    )

    bridge.start()

if __name__ == "__main__":
    main()
