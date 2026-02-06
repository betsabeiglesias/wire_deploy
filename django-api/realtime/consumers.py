from channels.generic.websocket import AsyncWebsocketConsumer
import json


class RealtimeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        ws://host/ws/realtime/customerA/
        """
        self.tenant = self.scope["url_route"]["kwargs"]["tenant"]
        self.group_name = f"realtime_data_{self.tenant}"

        print(f"🟢 WS connect - tenant={self.tenant}")

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

        await self.send(
            text_data=json.dumps({
                "type": "hello",
                "tenant": self.tenant,
                "message": "WebSocket connected",
            })
        )

    async def disconnect(self, close_code):
        print(f"🔴 WS disconnected - tenant={self.tenant}")
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def realtime_message(self, event):
        """
        Mensajes enviados desde redis_to_websocket
        """
        await self.send(
            text_data=json.dumps(event["data"])
        )
