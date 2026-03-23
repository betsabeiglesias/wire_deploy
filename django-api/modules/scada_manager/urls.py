from django.urls import path
from . import views
from .views import save_layout, my_layouts, layout_detail, reorder_layouts

app_name = 'scada_manager'

urlpatterns = [
    # Vista de inicio (si aplica a esta app)
    path('', views.home, name='home'),

    # Rutas específicas de Layout
    path("save-layout/", save_layout, name="save-layout"),
    path("my-layouts/", my_layouts, name="my_layouts"),
    path("layout/<int:title_id>/", layout_detail, name="layout_detail"),
    path("reorder-layouts/", reorder_layouts, name="reorder_layouts"),
]