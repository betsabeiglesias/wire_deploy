# modules/industrial_config_manager/urls.py

from django.urls import path, include

urlpatterns = [
    path("config/", include("modules.industrial_config_manager.api.urls")),
]