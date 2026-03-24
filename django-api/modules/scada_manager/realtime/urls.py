from django.urls import path
from .views import realtime_token

urlpatterns = [
    path("token/", realtime_token, name="realtime-token"),
]
