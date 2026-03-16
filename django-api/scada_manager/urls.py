# from django.urls import path
# from . import views
# from .views import save_layout, my_layouts, layout_detail, reorder_layouts, project_variables, project_variable_detail, resolve_variable_id

# app_name = 'scada_manager'

# urlpatterns = [
#     # Vista de inicio (si aplica a esta app)
#     path('', views.home, name='home'),

#     # Rutas específicas de Layout
#     path("save-layout/", save_layout, name="save-layout"),
#     path("my-layouts/", my_layouts, name="my_layouts"),
#     path("layout/<int:title_id>/", layout_detail, name="layout_detail"),
#     path("reorder-layouts/", reorder_layouts, name="reorder_layouts"),

#     # Variables anidadas bajo el layout
#     path("layouts/<int:title_id>/variables/",
#          project_variables, name="project-variables"),
 
#     path("layouts/<int:title_id>/variables/<int:var_id>/",
#          project_variable_detail, name="project-variable-detail"),
 
#     # Resolución de UUID para el runtime WebSocket
#     path("variables/resolve/",
#          resolve_variable_id, name="variable-resolve"),
# ]

# scada_manager/urls.py — versión completa con tablas

from django.urls import path
from . import views
from .views import (
    save_layout,
    my_layouts,
    layout_detail,
    reorder_layouts,
    variable_tables,
    variable_table_detail,
    table_variables,
    table_variable_detail,
    resolve_variable_id,
)

app_name = 'scada_manager'

urlpatterns = [
    path('', views.home, name='home'),

    # ── Layout CRUD ───────────────────────────────────────────────────────────
    path("save-layout/",            save_layout,     name="save-layout"),
    path("my-layouts/",             my_layouts,      name="my_layouts"),
    path("layout/<int:title_id>/",  layout_detail,   name="layout_detail"),
    path("reorder-layouts/",        reorder_layouts, name="reorder_layouts"),

    # ── VariableTable CRUD ────────────────────────────────────────────────────
    # GET  → lista tablas con variables anidadas
    # POST → crear tabla { "name": "..." }
    path("layouts/<int:layout_id>/tables/",
         variable_tables, name="variable-tables"),

    # GET / PATCH / DELETE una tabla
    path("layouts/<int:layout_id>/tables/<int:table_id>/",
         variable_table_detail, name="variable-table-detail"),

    # ── ProjectVariable CRUD (anidado bajo tabla) ─────────────────────────────
    path("layouts/<int:layout_id>/tables/<int:table_id>/variables/",
         table_variables, name="table-variables"),

    path("layouts/<int:layout_id>/tables/<int:table_id>/variables/<int:var_id>/",
         table_variable_detail, name="table-variable-detail"),

    # ── Resolución UUID para runtime WebSocket ────────────────────────────────
    path("variables/resolve/",
         resolve_variable_id, name="variable-resolve"),
]

# Endpoints resultantes:
# GET  POST   /api/scada-manager/layouts/5/tables/
# GET  PATCH  DELETE  /api/scada-manager/layouts/5/tables/3/
# GET  POST   /api/scada-manager/layouts/5/tables/3/variables/
# GET  PATCH  DELETE  /api/scada-manager/layouts/5/tables/3/variables/12/
# GET  /api/scada-manager/variables/resolve/?variable_id=<uuid>