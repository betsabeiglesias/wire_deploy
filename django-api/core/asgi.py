import os
import importlib

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_asgi_app = get_asgi_application()

# 🔥 cargar rutas websocket dinámicamente
websocket_urlpatterns = []

for app in getattr(settings, "DYNAMIC_MODULES", []):
    try:
        routing = importlib.import_module(f"{app}.realtime.routing")
        websocket_urlpatterns += getattr(routing, "websocket_urlpatterns", [])
    except ModuleNotFoundError:
        continue

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(websocket_urlpatterns),
})