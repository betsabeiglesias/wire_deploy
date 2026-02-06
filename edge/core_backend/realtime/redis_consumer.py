# edge/core_backend/realtime/redis_consumer.py

import asyncio
import json
import logging
import redis.asyncio as redis

from ws_app.ws_manager import ws_manager

logger = logging.getLogger("redis.stream.consumer")


class RedisStreamConsumer:
    def __init__(
        self,
        *,
        redis_host: str,
        redis_port: int,
        tenant: str,
        block_ms: int = 2000,
    ):
        self.tenant = tenant
        self.stream_key = f"scada:stream:{tenant}"
        self.block_ms = block_ms
        self.last_id = "$"   # solo nuevos eventos

        self.redis = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True,
        )

    async def run(self):
        logger.info("🟢 RedisStreamConsumer started (%s)", self.stream_key)

        while True:
            try:
                result = await self.redis.xread(
                    streams={self.stream_key: self.last_id},
                    block=self.block_ms,
                    count=100,
                )

                if not result:
                    continue

                for stream, messages in result:
                    for msg_id, data in messages:
                        self.last_id = msg_id
                        self._handle_message(data)

            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("❌ Redis stream error")
                await asyncio.sleep(1)

    def _handle_message(self, data: dict):
        raw = data.get("event")
        if not raw:
            return

        event = json.loads(raw)

        # fan-out por tenant (ya viene filtrado)
        ws_manager.broadcast(
            tenant=self.tenant,
            message=event,
        )
        logger.info("🔥 Consumed event from Redis")
