import logging
import importlib

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
for app in getattr(settings, 'DYNAMIC_MODULES', []):

    endpoint = app.replace('_', '-')

    # Mapeos especiales
    if app == 'industrial_config_manager':
        route_path = 'api/config/'
    elif app == 'map_manager':
        route_path = 'api/map/'
    else:
        route_path = f'api/{endpoint}/'

    try:
        # 👇 CLAVE: comprobamos si el módulo existe de verdad
        importlib.import_module(app)

        urlpatterns.append(
            path(route_path, include(f'{app}.urls'))
        )

        logger.info(f"✅ Módulo cargado: {app} -> {route_path}")

    except ModuleNotFoundError:
        # 👇 Si el módulo NO está en el código, no rompe nada
        logger.warning(f"⚠️ Módulo NO instalado: {app}")

    except Exception as e:
        # 👇 Otros errores sí los queremos ver
        logger.error(f"❌ Error en módulo {app}: {e}")


# 3. Archivos estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)