from urllib.parse import parse_qs
import traceback

from auth_jwt.validator import validate_jwt
from auth_jwt.exceptions import JWTValidationError
from django.conf import settings


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # 1️⃣ Leer token de la query string
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]

        if not token:
            print("❌ No JWT token in query string")
            await send({"type": "websocket.close", "code": 4401})
            return

        secret_key = settings.SECRET_KEY
        if not secret_key:
            print("❌ SECRET_KEY not set")
            await send({"type": "websocket.close", "code": 4500})
            return

        # 2️⃣ Validar JWT
        try:
            auth = validate_jwt(
                token=token,
                secret_key=secret_key,
            )
            print(f"✅ JWT válido - User: {auth.user_id}, Client: {auth.client_id}")

        except JWTValidationError as exc:
            print(f"❌ JWT validation error: {exc}")
            print(traceback.format_exc())
            await send({"type": "websocket.close", "code": 4403})
            return

        except Exception as exc:
            print(f"❌ Unexpected error: {exc}")
            print(traceback.format_exc())
            await send({"type": "websocket.close", "code": 4500})
            return
        
        # 🔐 2.1️⃣ Validar scope realtime
        if "realtime" not in getattr(auth, "scopes", []):
            print("❌ Token sin scope realtime")
            await send({"type": "websocket.close", "code": 4403})
            return

        # 3️⃣ Inyectar contexto en scope (SIN tocar ORM)
        scope["auth"] = auth
        scope["user_id"] = auth.user_id
        scope["client_id"] = auth.client_id
        scope["exp"] = auth.expires_at

        # 4️⃣ Continuar handshake
        return await self.app(scope, receive, send)
