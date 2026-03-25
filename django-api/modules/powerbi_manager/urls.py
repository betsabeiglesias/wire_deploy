# modules/powerbi_manager/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PowerBiViewSet

router = DefaultRouter()
router.register(r'mypowerbis', PowerBiViewSet, basename='mypowerbi')

urlpatterns = [
    path("powerbi/", include(router.urls)),
]