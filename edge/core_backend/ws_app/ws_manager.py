# edge/core_backend/ws_app/ws_manager.py

import asyncio
import logging
from collections import defaultdict
from typing import Dict, Set

logger = logging.getLogger("ws.manager")


class WSManager:
    """
    Registry en memoria de conexiones WebSocket por tenant.
    """

    def __init__(self):
        self._connections: Dict[str, Set] = defaultdict(set)

    def _on_send_done(self, task: asyncio.Task):
        try:
            task.result()
        except Exception as exc:
            logger.warning("❌ WS async send failed: %s", exc)


    # ----------------------------
    # Registro
    # ----------------------------

    def register(self, tenant: str, ws):
        self._connections[tenant].add(ws)
        logger.info(
            "🧩 WS registered tenant=%s total=%d",
            tenant,
            len(self._connections[tenant]),
        )

    def unregister(self, tenant: str, ws):
        self._connections[tenant].discard(ws)
        logger.info(
            "🔌 WS unregistered tenant=%s total=%d",
            tenant,
            len(self._connections[tenant]),
        )

        if not self._connections[tenant]:
            del self._connections[tenant]

    # ----------------------------
    # Emisión
    # ----------------------------

    def broadcast(self, tenant: str, message: dict):
        """
        Envía un mensaje JSON a todos los WS del tenant.
        """
        connections = self._connections.get(tenant)
        if not connections:
            return

        for ws in list(connections):
            try:
                task = asyncio.create_task(
                    ws.send_json(message)
                )
                task.add_done_callback(self._on_send_done)
            except Exception as exc:
                logger.warning("❌ WS send failed: %s", exc)
                connections.discard(ws)


# Singleton global
ws_manager = WSManager()
