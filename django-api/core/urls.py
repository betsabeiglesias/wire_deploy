# core/urls.py
import logging
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

logger = logging.getLogger(__name__)

# 1. Rutas del CORE (Siempre presentes)
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # AUTH e INFRAESTRUCTURA
    path('api/auth/', include('core.auth_manager.urls')),
    path("api/realtime/", include("realtime.urls")),
    path("api/favorites/", include("core.favorites.urls")),
]

# 2. Carga DINÁMICA de aplicaciones de dominio
# Recorremos los módulos habilitados en settings.py (vienen del .env)
for app in getattr(settings, 'DYNAMIC_MODULES', []):
    # Creamos un endpoint amigable (ej: scada_manager -> scada-manager)
    endpoint = app.replace('_', '-')
    
    # Mapeo especial para mantener tus rutas originales
    # Si el app es industrial_config_manager, el path será api/config/
    if app == 'industrial_config_manager':
        route_path = 'api/config/'
    elif app == 'map_manager':
        route_path = 'api/map/'
    else:
        route_path = f'api/{endpoint}/'

    try:
        urlpatterns.append(
            path(route_path, include(f'{app}.urls'))
        )
        print(f"✅ Módulo cargado en ruta: {route_path}")
    except Exception as e:
        logger.error(f"❌ Error al cargar URLs del módulo {app}: {e}")

# 3. Archivos estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)