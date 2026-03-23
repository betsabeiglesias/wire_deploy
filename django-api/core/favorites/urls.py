from django.urls import path
from .views import FavoriteViewSet

urlpatterns = [
    path("", FavoriteViewSet.as_view({"get": "list", "post": "create"})),
]
