from django.urls import path
from .views import (
    EdgeConfigView,
    GatewayTagsView,
    GatewayPLCsView,
    CacheInvalidateView,
)

urlpatterns = [
    path("config/", EdgeConfigView.as_view(), name="edge-config"),
    path("gateway/tags/", GatewayTagsView.as_view(), name="gateway-tags"),
    path("gateway/plcs/", GatewayPLCsView.as_view(), name="gateway-plcs"),
    path("gateway/cache/invalidate/", CacheInvalidateView.as_view(), name="gateway-cache-invalidate"),
]