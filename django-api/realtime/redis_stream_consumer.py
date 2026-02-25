# django-api/realtime/redis_stream_consumer.py

import asyncio
import json
import logging
import os
import redis.asyncio as redis
import django

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "core.settings"
)

django.setup()

from channels.layers import get_channel_layer

logger = logging.getLogger("redis.central.consumer")


class CentralRedisStreamConsumer:
    def __init__(
        self,
        *,
        redis_host: str,
        redis_port: int,
        block_ms: int = 2000,
    ):
        self.redis = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True,
        )
        self.block_ms = block_ms
        self.last_ids = {}  # tenant -> last_id
        self.channel_layer = get_channel_layer()

    async def run(self):
        while True:
            try:
                # 🔥 Descubrir streams dinámicamente
                streams = await self._get_streams()
                if not streams:
                    await asyncio.sleep(1)
                    continue

                result = await self.redis.xread(
                    streams=streams,
                    block=self.block_ms,
                    count=100,
                )

                if not result:
                    continue

                for stream_name, messages in result:
                    tenant = stream_name.split(":")[-1]

                    for msg_id, data in messages:
                        self.last_ids[stream_name] = msg_id
                        await self._handle_event(tenant, data)

            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("❌ Central Redis consumer error")
                await asyncio.sleep(1)

    async def _handle_event(self, tenant: str, data: dict):
        raw = data.get("event")
        if not raw:
            return

        event = json.loads(raw)

        # Fan-out al grupo WS del tenant
        await self.channel_layer.group_send(
            f"realtime.{tenant}",
            {
                "type": "realtime.event",
                "data": event,
            }
        )

        logger.debug("🔥 Event forwarded to WS (tenant=%s)", tenant)

    async def _get_streams(self):
        """
        Descubre dinámicamente scada:stream:*
        """
        keys = await self.redis.keys("scada:stream:*")
        streams = {}

        for key in keys:
            streams[key] = self.last_ids.get(key, "$")

        return streams


async def main():
    consumer = CentralRedisStreamConsumer(
        redis_host=os.getenv("REDIS_HOST", "redis-central"),
        redis_port=int(os.getenv("REDIS_PORT", 6379)),
    )
    await consumer.run()


if __name__ == "__main__":
    asyncio.run(main())
