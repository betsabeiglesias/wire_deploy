from django.urls import path, include
from . import views

app_name = 'scada_manager'

urlpatterns = [
    path('', views.home, name='home'),

    # ── Layout CRUD ───────────────────────────────────────────────────────────
    path("save-layout/",           views.save_layout,     name="save-layout"),
    path("my-layouts/",            views.my_layouts,      name="my_layouts"),
    path("layout/<int:title_id>/",  views.layout_detail,   name="layout_detail"),
    path("reorder-layouts/",         views.reorder_layouts, name="reorder_layouts"),

    # ── VariableTable & ProjectVariable ───────────────────────────────────────
    path("layouts/<int:layout_id>/tables/",
         views.variable_tables, name="variable-tables"),
    path("layouts/<int:layout_id>/tables/<int:table_id>/",
         views.variable_table_detail, name="variable-table-detail"),
    path("layouts/<int:layout_id>/tables/<int:table_id>/variables/",
         views.table_variables, name="table-variables"),
    path("layouts/<int:layout_id>/tables/<int:table_id>/variables/<int:var_id>/",
         views.table_variable_detail, name="table-variable-detail"),

    # ── Resolución UUID ───────────────────────────────────────────────────────
    path("variables/resolve/",
         views.resolve_variable_id, name="variable-resolve"),

    # ── INCLUSIÓN DE SUB-MÓDULOS INTERNOS ────────────────────────────────────
    # Esto permite que api/scada-manager/edge/... funcione
    path('edge/', include('modules.scada_manager.edge_config.urls')),
    path('realtime/', include('modules.scada_manager.realtime.urls')),
    path('api/', include('modules.scada_manager.scada_api.urls')),
]