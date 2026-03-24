from django.urls import path
from .views import (
    EdgeConfigView,
    GatewayTagsView,
    GatewayPLCsView,
    CacheInvalidateView,
)

urlpatterns = [
    # Edge
    path("config/",              EdgeConfigView.as_view(),      name="edge-config"),
    # Frontend
    path("gateway/tags/",             GatewayTagsView.as_view(),     name="gateway-tags"),
    path("gateway/plcs/",             GatewayPLCsView.as_view(),     name="gateway-plcs"),
    path("gateway/cache/invalidate/", CacheInvalidateView.as_view(), name="gateway-cache-invalidate"),
]