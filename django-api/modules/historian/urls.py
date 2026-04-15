from django.urls import path
from . import views

urlpatterns = [
    path('historian/dashboards/', views.dashboard_list),
    path('historian/dashboards/<uuid:dashboard_id>/', views.dashboard_detail),
]
