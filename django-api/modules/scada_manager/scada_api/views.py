
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.core.cache import cache
from modules.scada_manager.scada_api.services.influx_services import InfluxService
from modules.scada_manager.scada_api.models import Equipment, TagConfig
from modules.scada_manager.scada_api.serializers import (
    EquipmentSerializer, 
    TagConfigSerializer,
    TagHistoryRequestSerializer,
    MultiTagRequestSerializer
)

influx_service = InfluxService()


class EquipmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para gestionar equipos"""
    queryset = Equipment.objects.filter(active=True)
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticated]


class TagConfigViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para gestionar configuración de tags"""
    queryset = TagConfig.objects.filter(active=True)
    serializer_class = TagConfigSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        equipment_id = self.request.query_params.get('equipment_id')
        
        if equipment_id:
            queryset = queryset.filter(equipment__equipment_id=equipment_id)
        
        return queryset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tag_history(request):
    """
    GET /api/scada/tags/history/?equipment_id=XXX&variable=YYY&start=-12h&window=30s
    """
    serializer = TagHistoryRequestSerializer(data=request.query_params)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    try:
        # Intentar obtener de caché (opcional)
        cache_key = f"tag_history:{data['equipment_id']}:{data['variable']}:{data['start']}:{data['window']}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response({
                'cached': True,
                **cached_data
            })
        
        # Consultar InfluxDB
        history = influx_service.get_tag_history(
            equipment_id=data['equipment_id'],
            variable=data['variable'],
            start=data['start'],
            stop=data['stop'],
            window=data['window'],
            aggregation=data['aggregation']
        )
        
        response_data = {
            'equipment_id': data['equipment_id'],
            'variable': data['variable'],
            'start': data['start'],
            'stop': data['stop'],
            'window': data['window'],
            'data_points': len(history),
            'data': history
        }
        
        # Cachear por 30 segundos
        cache.set(cache_key, response_data, 30)
        
        return Response(response_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_multiple_tags_history(request):
    """
    POST /api/scada/tags/history/batch/
    Body: {
        "tags": [
            {"equipment_id": "XXX", "variable": "YYY"},
            {"equipment_id": "XXX", "variable": "ZZZ"}
        ],
        "start": "-12h",
        "window": "30s"
    }
    """
    serializer = MultiTagRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    try:
        history = influx_service.get_multiple_tags_history(
            tags=data['tags'],
            start=data['start'],
            window=data['window']
        )
        
        return Response({
            'tags_count': len(data['tags']),
            'start': data['start'],
            'window': data['window'],
            'data': history
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_values(request, equipment_id):
    """
    GET /api/scada/tags/current/{equipment_id}/
    """
    try:
        # Cachear por 5 segundos
        cache_key = f"current_values:{equipment_id}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response({'cached': True, **cached_data})
        
        tags = influx_service.get_current_values(equipment_id)
        
        response_data = {
            'equipment_id': equipment_id,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'tags': tags
        }
        
        cache.set(cache_key, response_data, 5)
        
        return Response(response_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_equipment(request):
    """
    GET /api/scada/equipment/list/
    """
    try:
        cache_key = "equipment_list"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response({'cached': True, **cached_data})
        
        equipment = influx_service.get_equipment_list()
        
        response_data = {
            'count': len(equipment),
            'equipment': equipment
        }
        
        # Cachear por 5 minutos
        cache.set(cache_key, response_data, 300)
        
        return Response(response_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_variables(request, equipment_id):
    """
    GET /api/scada/equipment/{equipment_id}/variables/
    """
    try:
        cache_key = f"variables:{equipment_id}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response({'cached': True, **cached_data})
        
        variables = influx_service.get_available_variables(equipment_id)
        
        response_data = {
            'equipment_id': equipment_id,
            'count': len(variables),
            'variables': variables
        }
        
        # Cachear por 5 minutos
        cache.set(cache_key, response_data, 300)
        
        return Response(response_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def hierarchical_equipment_data(request):
    result = []
    
    # Filtrar solo equipos activos
    equipments = Equipment.objects.filter(active=True).prefetch_related('tags')
    
    for eq in equipments:
        variables = list(eq.tags.filter(active=True).values_list('variable', flat=True))
        result.append({
            "site": eq.site,
            "area": eq.area,
            "line": eq.line,
            "cell": eq.cell,
            "equipment_id": eq.equipment_id,
            "name": eq.name,
            "variables": variables,
        })

    return Response(result)