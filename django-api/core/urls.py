# core/urls.py
import os
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.auth_manager.urls')),
    path("api/favorites/", include("core.favorites.urls")),
]

# CARGA DINÁMICA
MODULES_DIR = os.path.join(settings.BASE_DIR, 'modules')

if os.path.exists(MODULES_DIR):
    for module_name in os.listdir(MODULES_DIR):
        module_path = os.path.join(MODULES_DIR, module_name)
        if os.path.isdir(module_path) and os.path.exists(os.path.join(module_path, 'urls.py')):
            url_prefix = module_name.replace('_', '-')
            if module_name == 'map_manager': url_prefix = 'map'
            
            # Esto cargará modules/scada_manager/urls.py 
            # y ese archivo a su vez cargará edge, realtime y scada_api
            urlpatterns.append(
                path(f'api/{url_prefix}/', include(f'modules.{module_name}.urls'))
            )

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)