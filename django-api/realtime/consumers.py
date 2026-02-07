# django-api/realtime/consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)


class RealtimeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        auth = self.scope.get("auth")

        if not auth:
            await self.close()
            return

        self.tenant = auth.client_id
        self.group_name = f"realtime.{self.tenant}"

        logger.info("🟢 WS connect - tenant=%s", self.tenant)

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "hello",
            "tenant": self.tenant,
            "message": "WebSocket connected",
        }))

    async def disconnect(self, close_code):
        tenant = getattr(self, "tenant", "unknown")
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name,
            )
        logger.info("🔴 WS disconnect - tenant=%s", tenant)

    async def realtime_event(self, event):
        """
        Evento enviado desde el consumer Redis central
        """
        await self.send(
            text_data=json.dumps(event["data"])
        )
