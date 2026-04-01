# modules/map_manager/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CountryViewSet, LocationViewSet, FactoryViewSet,
    AreaViewSet, ManufacturerViewSet, MachineViewSet
)

router = DefaultRouter()
router.register(r'countries', CountryViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'factories', FactoryViewSet)
router.register(r'areas', AreaViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'machines', MachineViewSet)

urlpatterns = [
    path("map/", include(router.urls)),
]