
import os
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('core.auth_manager.urls')),
    path('api/favorites/', include('core.favorites.urls')),
]

# 🔥 CARGA DINÁMICA REAL (sin lógica rara)
MODULES_DIR = os.path.join(settings.BASE_DIR, 'modules')

if os.path.exists(MODULES_DIR):
    for module_name in os.listdir(MODULES_DIR):
        module_path = os.path.join(MODULES_DIR, module_name)

        if os.path.isdir(module_path) and os.path.exists(os.path.join(module_path, 'urls.py')):
            urlpatterns.append(
                path('api/', include(f'modules.{module_name}.urls'))
            )

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)