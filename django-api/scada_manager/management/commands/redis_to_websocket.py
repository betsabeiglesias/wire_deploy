import json
import os
import threading
import time
import redis

from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


OFFSET_DIR = "/var/lib/scada/offsets"
RECONNECT_DELAY = 5  # segundos


class Command(BaseCommand):
    help = "Bridge Redis Streams (edge) to WebSockets (central), multi-tenant"

    def add_arguments(self, parser):
        parser.add_argument(
            "--tenants",
            type=str,
            default=os.getenv("TENANTS", "cliente1"),
            help="Comma-separated tenants (cliente1,customerB,...)",
        )

    def handle(self, *args, **options):
        tenants = [t.strip() for t in options["tenants"].split(",")]

        self.stdout.write(
            self.style.SUCCESS(f"🌐 Starting Redis → WS bridge for tenants: {tenants}")
        )

        os.makedirs(OFFSET_DIR, exist_ok=True)

        threads = []
        for tenant in tenants:
            config = self.get_redis_config(tenant)
            t = threading.Thread(
                target=self.run_tenant_loop,
                args=(tenant, config),
                daemon=True,
            )
            t.start()
            threads.append(t)

        try:
            for t in threads:
                t.join()
        except KeyboardInterrupt:
            self.stdout.write("\n🛑 Shutdown requested. Exiting...")

    # ------------------------------------------------------------------

    def get_redis_config(self, tenant):
        return {
            "host": os.getenv(
                f"REDIS_HOST_{tenant.upper()}",
                os.getenv("REDIS_HOST", "localhost"),
            ),
            "port": int(
                os.getenv(
                    f"REDIS_PORT_{tenant.upper()}",
                    os.getenv("REDIS_PORT", 6379),
                )
            ),
        }

    # ------------------------------------------------------------------

    def run_tenant_loop(self, tenant, config):
        """
        Loop infinito:
        - conecta a Redis
        - lee stream
        - reintenta si hay fallo
        """
        stream_key = f"scada:stream:{tenant}"
        group_name = f"realtime.{tenant}"
        channel_layer = get_channel_layer()

        while True:
            try:
                self.stdout.write(f"🔄 [{tenant}] Trying Redis connection...")
                r = redis.Redis(
                    host=config["host"],
                    port=config["port"],
                    decode_responses=True,
                )
                r.ping()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"🟢 [{tenant}] Connected to Redis {config['host']}:{config['port']}"
                    )
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"📡 [{tenant}] Listening to stream {stream_key}"
                    )
                )

                last_id = self.load_offset(tenant)

                while True:
                    self.stdout.write(f"👂 [{tenant}] Waiting for data on {stream_key} from {last_id}")
                    messages = r.xread(
                        {stream_key: last_id},
                        count=10,
                        block=1000,
                    )

                    if not messages:
                        continue

                    for _, entries in messages:
                        for entry_id, entry_data in entries:
                            last_id = entry_id
                            self.save_offset(tenant, last_id)

                            event_json = entry_data.get("event")
                            if not event_json:
                                continue

                            try:
                                event = json.loads(event_json)
                            except json.JSONDecodeError:
                                self.stderr.write(
                                    f"❌ [{tenant}] Invalid JSON: {event_json}"
                                )
                                continue

                            event["tenant"] = tenant

                            # self.stdout.write(
                            #     f"📩 [{tenant}] "
                            #     f"{event.get('equipment_id')}/"
                            #     f"{event.get('variable')} = "
                            #     f"{event.get('value')}"
                            # )

                            async_to_sync(channel_layer.group_send)(
                                group_name,
                                {
                                    "type": "realtime_message",
                                    "data": event,
                                },
                            )

            except Exception as e:
                self.stderr.write(
                    f"🔴 [{tenant}] Redis connection lost: {e}"
                )
                time.sleep(RECONNECT_DELAY)

    # ------------------------------------------------------------------

    def offset_path(self, tenant):
        return os.path.join(OFFSET_DIR, f"{tenant}.offset")

    def load_offset(self, tenant):
        path = self.offset_path(tenant)
        if os.path.exists(path):
            with open(path, "r") as f:
                return f.read().strip()
        return "0-0"  # replay completo si es la primera vez

    def save_offset(self, tenant, offset):
        path = self.offset_path(tenant)
        with open(path, "w") as f:
            f.write(offset)
