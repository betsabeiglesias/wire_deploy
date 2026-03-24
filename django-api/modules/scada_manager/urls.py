# modules/scada_manager/urls.py

from django.urls import path, include
from . import views

urlpatterns = [
    path("scada/", include([
        
        path('', views.home, name='home'),

        path("save-layout/", views.save_layout),
        path("my-layouts/", views.my_layouts),
        path("layout/<int:title_id>/", views.layout_detail),
        path("reorder-layouts/", views.reorder_layouts),

        path("layouts/<int:layout_id>/tables/", views.variable_tables),
        path("layouts/<int:layout_id>/tables/<int:table_id>/", views.variable_table_detail),
        path("layouts/<int:layout_id>/tables/<int:table_id>/variables/", views.table_variables),
        path("layouts/<int:layout_id>/tables/<int:table_id>/variables/<int:var_id>/", views.table_variable_detail),

        path("variables/resolve/", views.resolve_variable_id),

        # submódulos bien colgados
        path('edge/', include('modules.scada_manager.edge_config.urls')),
        path('realtime/', include('modules.scada_manager.realtime.urls')),
        path('api/', include('modules.scada_manager.scada_api.urls')),

    ])),
]