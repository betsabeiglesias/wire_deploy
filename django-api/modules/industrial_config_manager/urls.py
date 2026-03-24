# industrial_config_manager/urls.py

from django.urls import path, include

urlpatterns = [
    path("", include("industrial_config_manager.api.urls")),
]