# edge/core_backend/realtime/redis_bridge.py

import asyncio
import json
import logging
import redis.asyncio as redis
import os

logger = logging.getLogger("redis.bridge")


class RedisStreamBridge:
    def __init__(
        self,
        *,
        tenant: str,
        local_redis_host: str,
        local_redis_port: int,
        central_redis_host: str,
        central_redis_port: int,
        block_ms: int = 2000,
    ):
        self.tenant = tenant
        self.stream_key = f"scada:stream:{tenant}"
        self.block_ms = block_ms
        self.last_id = "$"

        self.local_redis = redis.Redis(
            host=local_redis_host,
            port=local_redis_port,
            decode_responses=True,
        )

        self.central_redis = redis.Redis(
            host=central_redis_host,
            port=central_redis_port,
            decode_responses=True,
        )

    async def run(self):
        logger.info("🟢 RedisStreamBridge started (%s)", self.stream_key)

        while True:
            try:
                result = await self.local_redis.xread(
                    streams={self.stream_key: self.last_id},
                    block=self.block_ms,
                    count=100,
                )

                if not result:
                    continue

                for stream, messages in result:
                    for msg_id, data in messages:
                        self.last_id = msg_id
                        await self._forward(data)

            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("❌ Redis bridge error")
                await asyncio.sleep(1)

    async def _forward(self, data: dict):
        raw = data.get("event")
        if not raw:
            return

        # reenviar TAL CUAL, pero al Redis central
        await self.central_redis.xadd(
            name=f"scada:stream:{self.tenant}",
            fields={"event": raw},
        )

        logger.debug("➡️ forwarded event to central (%s)", self.tenant)


async def main():
    bridge = RedisStreamBridge(
        tenant=os.getenv("TENANT_ID"),
        local_redis_host=os.getenv("LOCAL_REDIS_HOST"),
        local_redis_port=int(os.getenv("LOCAL_REDIS_PORT", 6379)),
        central_redis_host=os.getenv("CENTRAL_REDIS_HOST"),
        central_redis_port=int(os.getenv("CENTRAL_REDIS_PORT", 6379)),
    )

    await bridge.run()


if __name__ == "__main__":
    asyncio.run(main())
