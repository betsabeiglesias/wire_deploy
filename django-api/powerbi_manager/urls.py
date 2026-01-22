from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PowerBiViewSet

router = DefaultRouter()
router.register(r'mypowerbis', PowerBiViewSet, basename='mypowerbi')

urlpatterns = [
    path('', include(router.urls)),
]
