from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CountryViewSet, LocationViewSet, FactoryViewSet,
    AreaViewSet, ManufacturerViewSet, MachineViewSet
)

# Router para la jerarquía del mapa
router = DefaultRouter()
router.register(r'countries', CountryViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'factories', FactoryViewSet)
router.register(r'areas', AreaViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'machines', MachineViewSet)

app_name = 'map_manager'

urlpatterns = [
    # Todas las rutas del mapa (api/map/countries/, etc.)
    path('', include(router.urls)),
]