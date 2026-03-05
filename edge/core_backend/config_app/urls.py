from django.urls import path
from .views import GatewayConfigExportView

urlpatterns = [
    path("config/export/", GatewayConfigExportView.as_view()),
]