# edge/core_backend/ws_app/routing.py

from ws_app.consumers import RealtimeConsumer

websocket_urlpatterns = [
    (r"ws/realtime/", RealtimeConsumer),
]
