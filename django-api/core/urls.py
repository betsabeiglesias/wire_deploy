# core/urls.py
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

# Importamos tus vistas personalizadas
from core.auth_manager.views import LoginView, logout_view, current_user, token_health_check

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # ─── AUTH (Infraestructura con Cookies) ───────────────────
    # Sustituimos TokenObtainPairView por tu nueva LoginView
    path('api/token/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', logout_view, name='logout'),
    path('api/auth/check/', token_health_check, name='token-health-check'),
    path("api/me/", current_user, name="current-user"),

    # ─── APPS DE DOMINIO ────────────────────────────────────
    path('api/scada-manager/', include('scada_manager.urls')),

    # Path para la configuración de los PLC
    path("api/config/", include("industrial_config_manager.urls")),
    path('api/management/', include('management.urls')),

    # Path raw data API
    path('api/raw-data/', include('rawdata.urls')),

    path('api/powerbi-manager/', include('powerbi_manager.urls')),

    # Path para favoritos
    path("api/favorites/", include("core.favorites.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)