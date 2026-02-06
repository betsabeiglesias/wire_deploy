# edge/core_backend/realtime/run.py

import asyncio
import os
import logging

from realtime.redis_consumer import RedisStreamConsumer

logging.basicConfig(level=logging.INFO)

async def main():
    consumer = RedisStreamConsumer(
        redis_host=os.getenv("REDIS_HOST"),
        redis_port=int(os.getenv("REDIS_PORT")),
        tenant=os.getenv("TENANT"),
    )
    await consumer.run()

if __name__ == "__main__":
    asyncio.run(main())
