# django-api/realtime/consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import time
import asyncio

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

        # Calcular TTL del token
        ttl = auth.expires_at - int(time.time())
        if ttl <= 0:
            await self.close(code=4401)
            return

        # Programar cierre automático
        self.expiry_task = asyncio.create_task(
            self._close_when_expired(ttl)
        )

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

    async def _close_when_expired(self, ttl):
        await asyncio.sleep(ttl)
        logger.info("⏱️ JWT expired, closing WS tenant=%s", self.tenant)
        await self.close(code=4401)

    async def disconnect(self, close_code):
        tenant = getattr(self, "tenant", "unknown")
        if hasattr(self, "expiry_task"):
            self.expiry_task.cancel()

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
