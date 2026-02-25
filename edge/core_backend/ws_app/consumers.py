# edge/core_backend/ws_app/consumers.py

from urllib.parse import parse_qs
from django.conf import settings

from auth_app.jwt.validator import validate_jwt
from ws_app.ws_manager import ws_manager

class RealtimeConsumer:
    """
    WebSocket autenticado mínimo
    """

    def __init__(self, scope):
        self.scope = scope
        self.auth_context = None

    async def __call__(self, receive, send):
        #  Extraer token de la URL (?token=...)
        print("🟢 RealtimeConsumer invoked")
        query_string = self.scope["query_string"].decode()
        params = parse_qs(query_string)

        token = params.get("token", [None])[0]
        print("TOKEN:", token)


        #  Validar JWT
        try:
            self.auth_context = validate_jwt(
                token=token,
                secret_key=settings.JWT_SECRET,
                expected_issuer=settings.JWT_ISSUER,
            )
            print("AUTH OK:", self.auth_context.client_id)

        except Exception:
            # ❌ Rechazar conexión
            await send({
                "type": "websocket.close",
                "code": 4401,
            })
            return
        
        #  Autorizar acceso al canal realtime
        if not self.auth_context.has_scope("realtime:read"):
            print("❌ Missing scope realtime:read")
            await send({
                "type": "websocket.close",
                "code": 4403,  # Forbidden
            })
            return

        # Aceptar conexión
        await send({
            "type": "websocket.accept"
        })
        ws_manager.register(
            tenant=self.auth_context.client_id,
            ws=self,
        )

        await send({
            "type": "websocket.send",
            "text": f"connected as client {self.auth_context.client_id}"
        })

        # Loop (de momento vacío)
        while True:
            message = await receive()

            if message["type"] == "websocket.disconnect":
                ws_manager.unregister(
                    tenant=self.auth_context.client_id,
                    ws=self,
                )
                print("🔌 WS disconnected")
                break
