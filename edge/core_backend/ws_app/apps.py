from django.apps import AppConfig
import os
import logging

logger = logging.getLogger("ws.startup")



class WsAppConfig(AppConfig):
    # default_auto_field = 'django.db.models.BigAutoField'
    name = 'ws_app'

    # def ready(self):
    #     """
    #     Se ejecuta UNA VEZ cuando Django arranca.
    #     """
    #     print("🔥 WsAppConfig.ready() CALLED")
    #     print("🚀 Starting MQTT bridge")

    #     from mqtt_bridge.bridge import MQTTWebSocketBridge

    #     bridge = MQTTWebSocketBridge(
    #         mqtt_host=os.getenv("MQTT_HOST", "localhost"),
    #         mqtt_port=int(os.getenv("MQTT_PORT", "1883")),
    #         mqtt_username=os.getenv("MQTT_USER"),
    #         mqtt_password=os.getenv("MQTT_PASSWORD"),
    #         tenant=os.getenv("TENANT"),
    #     )

    #     bridge.start()