from django.urls import path
from . import views
from .views import save_layout, my_layouts, layout_detail, reorder_layouts, project_variables, project_variable_detail, resolve_variable_id

app_name = 'scada_manager'

urlpatterns = [
    # Vista de inicio (si aplica a esta app)
    path('', views.home, name='home'),

    # Rutas específicas de Layout
    path("save-layout/", save_layout, name="save-layout"),
    path("my-layouts/", my_layouts, name="my_layouts"),
    path("layout/<int:title_id>/", layout_detail, name="layout_detail"),
    path("reorder-layouts/", reorder_layouts, name="reorder_layouts"),

    # Variables anidadas bajo el layout
    path("layouts/<int:title_id>/variables/",
         project_variables, name="project-variables"),
 
    path("layouts/<int:title_id>/variables/<int:var_id>/",
         project_variable_detail, name="project-variable-detail"),
 
    # Resolución de UUID para el runtime WebSocket
    path("variables/resolve/",
         resolve_variable_id, name="variable-resolve"),
]