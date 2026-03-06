from django.urls import path
from .views import (
    EdgeConfigView,
    EdgeTagsView,
)

urlpatterns = [
    path("config/", EdgeConfigView.as_view()),
    path("tags/", EdgeTagsView.as_view()),
]