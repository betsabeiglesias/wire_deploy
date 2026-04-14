from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import HistorianDashboard
from .serializers import HistorianDashboardSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard_list(request):
    """
    GET  /api/historian/dashboards/  → lista todos los dashboards del usuario
    POST /api/historian/dashboards/  → crea un nuevo dashboard
    """
    if request.method == 'GET':
        dashboards = HistorianDashboard.objects.filter(user=request.user)
        serializer = HistorianDashboardSerializer(dashboards, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = HistorianDashboardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def dashboard_detail(request, dashboard_id):
    """
    GET    /api/historian/dashboards/<id>/  → devuelve un dashboard
    PUT    /api/historian/dashboards/<id>/  → reemplaza el dashboard completo
    DELETE /api/historian/dashboards/<id>/  → elimina el dashboard
    """
    try:
        dashboard = HistorianDashboard.objects.get(id=dashboard_id, user=request.user)
    except HistorianDashboard.DoesNotExist:
        return Response({'error': 'No encontrado o no autorizado'}, status=404)

    if request.method == 'GET':
        return Response(HistorianDashboardSerializer(dashboard).data)

    elif request.method == 'PUT':
        serializer = HistorianDashboardSerializer(dashboard, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        dashboard.delete()
        return Response(status=204)
