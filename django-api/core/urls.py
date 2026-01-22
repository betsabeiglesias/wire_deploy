# core/urls.py
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from core.auth_manager.views import current_user


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from core.auth_manager import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    

    # ─── AUTH (infraestructura) ─────────────────────────────
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/check/', auth_views.token_health_check, name='token-health-check'),
    path("api/me/", current_user, name="current-user"),

    # ─── APPS DE DOMINIO ────────────────────────────────────
    path('api/scada-manager/', include('scada_manager.urls')),

    # path para la configuración de los plc
    path("api/config/", include("industrial_config_manager.urls")),
    path('api/management/', include('management.urls')),

    # path raw data api
    path('api/raw-data/', include('rawdata.urls')),


    path('api/powerbi-manager/', include('powerbi_manager.urls')),

   

    #path para favoritos
    path("api/favorites/", include("core.favorites.urls")),


]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
