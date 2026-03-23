# django-api\industrial_config_manager\urls.py

from django.urls import include, path

urlpatterns = [
    path("", include("industrial_config_manager.api.urls")),
]