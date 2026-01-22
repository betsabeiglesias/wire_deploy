# rawdata/urls.py
from django.urls import path
from .views import RawDataView

urlpatterns = [
    path("", RawDataView.as_view(), name="raw-data"),
]
