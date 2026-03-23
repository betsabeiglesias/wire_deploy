from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import TaskViewSet

# 🚀 Configuración del router para los ViewSets
router = DefaultRouter()
router.register(r'tasks', TaskViewSet)


urlpatterns = [
    # Vistas de DRF generadas automáticamente
    path('management/', include(router.urls)),  # todas las rutas del router bajo /api/
    #path('api/custom', views.custom_view, name = "custom_view")
]