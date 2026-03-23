#django-api/scada_api/urls.py 
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'equipment', views.EquipmentViewSet, basename='equipment')
router.register(r'tag-config', views.TagConfigViewSet, basename='tag-config')

urlpatterns = [
    path('', include(router.urls)),
    
    # Endpoints de datos en tiempo real
    path('tags/history/', views.get_tag_history, name='tag-history'),
    path('tags/history/batch/', views.get_multiple_tags_history, name='multi-tag-history'),
    path('tags/current/<str:equipment_id>/', views.get_current_values, name='current-values'),
    
    # Metadatos
    path('equipment/list/', views.list_equipment, name='equipment-list'),
    path('equipment/<str:equipment_id>/variables/', views.list_variables, name='equipment-variables'),
    path('equipment/hierarchy/', views.hierarchical_equipment_data),
    path('api/scada/', include('scada_api.urls')),
]