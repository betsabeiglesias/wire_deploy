# SI NO VAMOS A ANDAR MOVIENDO DE SITIO WS, PONEMOS FIJA LA DIRECCION. PARA ESO ESTE CODGIO:

# import os
# import sys
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter

# # 1. Configuración de Django
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
# django_asgi_app = get_asgi_application()

# # 2. Imports Directos (Sin vueltas)
# try:
#     from modules.scada_manager.realtime.routing import websocket_urlpatterns as scada_urls
#     from modules.scada_manager.realtime.middleware import JWTAuthMiddleware
#     print("🚀 [ASGI] Scada Realtime cargado correctamente.", file=sys.stderr, flush=True)
# except ImportError as e:
#     print(f"❌ [ASGI] Error crítico cargando módulos: {e}", file=sys.stderr, flush=True)
#     scada_urls = []
#     # Passthrough si falla el import
#     class JWTAuthMiddleware:
#         def __init__(self, app): self.app = app
#         async def __call__(self, scope, receive, send): return await self.app(scope, receive, send)

# # 3. Aplicación
# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     "websocket": JWTAuthMiddleware(
#         URLRouter(scada_urls)
#     ),
# })


# SI VAMOS A ANDAR CAMBIANDO LA DIRECCION DONDE TENEMOS WS NOS INTERESA COGERLA DE FORMA AUTOMATICA. PARA ESO UTILIZAR EL SIGUIENTE CODIGO:

import os
import importlib
import sys

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.conf import settings

# 1. Definimos el entorno y cargamos la app ASGI de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django_asgi_app = get_asgi_application()

# 2. Inicializamos contenedores de rutas
websocket_urlpatterns = []

print("\n🔌 [ASGI] Configurando entorno modular...", file=sys.stderr, flush=True)

# 3. CARGA DINÁMICA DE RUTAS
for app in getattr(settings, "DYNAMIC_MODULES", []):
    # Intentamos cargar routing.py
    for sub_path in [f"{app}.realtime.routing", f"{app}.routing"]:
        try:
            routing = importlib.import_module(sub_path)
            patterns = getattr(routing, "websocket_urlpatterns", [])
            if patterns:
                websocket_urlpatterns += patterns
                print(f"✅ [ASGI] Rutas cargadas: {sub_path}", file=sys.stderr, flush=True)
                break
        except ModuleNotFoundError:
            continue

# 4. CARGA DINÁMICA DEL MIDDLEWARE
# Intentamos usar el de scada_manager si está disponible, si no, usamos un passthrough
try:
    # Esta es la ruta que me acabas de pasar
    from modules.scada_manager.realtime.middleware import JWTAuthMiddleware
    print("🔐 [ASGI] Middleware JWT cargado correctamente.", file=sys.stderr, flush=True)
except ImportError:
    print("⚠️ [ASGI] Middleware JWT no encontrado. Usando conexión sin auth.", file=sys.stderr, flush=True)
    # Clase simple para no romper el flujo si el módulo de auth no está
    class JWTAuthMiddleware:
        def __init__(self, app): self.app = app
        async def __call__(self, scope, receive, send): return await self.app(scope, receive, send)

# 5. APLICACIÓN FINAL
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})