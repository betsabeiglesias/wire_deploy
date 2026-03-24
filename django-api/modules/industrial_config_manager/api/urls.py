# docker-suite\django-api\industrial_config_manager\api\urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SiteViewSet, AreaViewSet, WorkCenterViewSet, WorkUnitViewSet,
    PLCViewSet)

router = DefaultRouter()
router.register(r'sites', SiteViewSet, basename='site')
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'workcenters', WorkCenterViewSet, basename='workcenter')
router.register(r'workunits', WorkUnitViewSet, basename='workunit')
router.register(r'plc', PLCViewSet, basename='plc')


urlpatterns = [
    path('', include(router.urls)),
  
]