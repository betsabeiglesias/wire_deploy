# edge/core_backend/mqtt_bridge/run.py

import os
import logging
from dotenv import load_dotenv  # ✅ Agregar

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from mqtt_bridge.bridge import MQTTEventBridge

def main():
    # ✅ Cargar .env
    load_dotenv()
    
    bridge = MQTTEventBridge(
        tenant=os.environ["TENANT"],

        mqtt_host=os.environ["MQTT_HOST"],
        mqtt_port=int(os.environ.get("MQTT_PORT", 1883)),
        mqtt_username=os.environ.get("MQTT_USER"),
        mqtt_password=os.environ.get("MQTT_PASSWORD"),

        redis_host=os.environ["REDIS_HOST"],
        redis_port=int(os.environ.get("REDIS_PORT", 6379)),
        
        # Redis central (opcional)
        central_redis_host=os.environ.get("CENTRAL_REDIS_HOST"),
        central_redis_port=int(os.environ.get("CENTRAL_REDIS_PORT", 6379)),
        central_redis_password=os.environ.get("CENTRAL_REDIS_PASSWORD"),
    )

    bridge.start()

if __name__ == "__main__":
    main()