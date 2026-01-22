

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    CountryViewSet, LocationViewSet, FactoryViewSet,
    AreaViewSet, ManufacturerViewSet, MachineViewSet, 
    save_layout, my_layouts, layout_detail
)

# 🚀 Configuración del router para los ViewSets
router = DefaultRouter()
router.register(r'countries', CountryViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'factories', FactoryViewSet)
router.register(r'areas', AreaViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'machines', MachineViewSet)
# router.register(r'mypowerbis', PowerBiViewSet, basename='mypowerbi')

urlpatterns = [
    # Vistas normales
    path('', views.home, name='home'),
 

    # Vistas de DRF generadas automáticamente
    path('', include(router.urls)),  # todas las rutas del router bajo /api/
   
    path("save-layout/", save_layout, name="save-layout"),
    path("my-layouts/", my_layouts, name="my_layouts"),
    path("layout/<int:title_id>/", layout_detail, name="layout_detail"),

    #POWER BI
    


]
