
from django.http import HttpResponse
from django.db import transaction
from django.utils.crypto import get_random_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MyLayOutsTitle, ProjectVariable, VariableTable
from .serializers import MyLayOutsTitleSerializer
from .serializers import (
    VariableTableSerializer,
    VariableTableLightSerializer,
    ProjectVariableSerializer,
)

# Vista genérica del proyecto (puedes moverla a una app 'core' si prefieres)
def home(request):
    return HttpResponse("¡Bienvenido a Industry4 Suite!")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_api_view(request):
    return Response({"message": "¡Acceso autorizado!"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_layout(request):
    name = request.data.get("name")
    views_data = request.data.get("views_data") or []

    if not name:
        return Response({"error": "name es obligatorio"}, status=400)

    with transaction.atomic():
        title_obj = MyLayOutsTitle.objects.create(
            name=name,
            views_data=views_data,
            user=request.user
        )

    response_serializer = MyLayOutsTitleSerializer(title_obj)
    return Response(response_serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_layouts(request):
    titles = MyLayOutsTitle.objects.filter(user=request.user)
    serializer = MyLayOutsTitleSerializer(titles, many=True)
    return Response(serializer.data)

@api_view(["GET", "PUT", "DELETE"]) 
@permission_classes([IsAuthenticated])
def layout_detail(request, title_id):
    try:
        title = MyLayOutsTitle.objects.get(id=title_id, user=request.user)
    except MyLayOutsTitle.DoesNotExist:
        return Response({"error": "No encontrado o no autorizado"}, status=404)

    if request.method == "GET":
        serializer = MyLayOutsTitleSerializer(title)
        return Response(serializer.data)

    elif request.method == "PUT":
        name = request.data.get("name")
        views_data = request.data.get("views_data")

        with transaction.atomic():
            title.name = name
            title.views_data = views_data
            title.save()
            
        return Response(MyLayOutsTitleSerializer(title).data)

    elif request.method == "DELETE":
        title.delete()
        return Response(status=204)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def reorder_layouts(request):
    layouts_data = request.data.get("layouts", [])
    
    with transaction.atomic():
        for item in layouts_data:
            layout_id = item.get("id")
            new_order = item.get("order")
            # Solo actualizamos si el layout pertenece al usuario actual
            MyLayOutsTitle.objects.filter(id=layout_id, user=request.user).update(order=new_order)
            
    return Response({"message": "Orden actualizado correctamente"}, status=200)



 
# ── Helpers ───────────────────────────────────────────────────────────────────
 
def get_layout_or_404(request, layout_id):
    """Devuelve el layout si pertenece al usuario, o None."""
    try:
        return MyLayOutsTitle.objects.get(id=layout_id, user=request.user)
    except MyLayOutsTitle.DoesNotExist:
        return None
 
 
# ── VariableTable CRUD ────────────────────────────────────────────────────────
 
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def variable_tables(request, layout_id):
    """
    GET  /api/scada/layouts/<layout_id>/tables/
         → lista de tablas con sus variables anidadas
    POST /api/scada/layouts/<layout_id>/tables/
         → crear tabla  { "name": "Mi tabla" }
    """
    layout = get_layout_or_404(request, layout_id)
    if not layout:
        return Response({"error": "No encontrado o no autorizado"}, status=404)
 
    if request.method == "GET":
        tables = VariableTable.objects.filter(layout=layout).prefetch_related("variables")
        return Response(VariableTableSerializer(tables, many=True).data)
 
    elif request.method == "POST":
        data = {**request.data, "layout": layout.id}
        serializer = VariableTableSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
 
 
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def variable_table_detail(request, layout_id, table_id):
    """
    GET    /api/scada/layouts/<layout_id>/tables/<table_id>/
    PATCH  → renombrar tabla  { "name": "Nuevo nombre" }
    DELETE → eliminar tabla y todas sus variables
    """
    layout = get_layout_or_404(request, layout_id)
    if not layout:
        return Response({"error": "No encontrado o no autorizado"}, status=404)
 
    try:
        table = VariableTable.objects.get(id=table_id, layout=layout)
    except VariableTable.DoesNotExist:
        return Response({"error": "Tabla no encontrada"}, status=404)
 
    if request.method == "GET":
        return Response(VariableTableSerializer(table).data)
 
    elif request.method == "PATCH":
        serializer = VariableTableSerializer(table, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
 
    elif request.method == "DELETE":
        table.delete()
        return Response(status=204)
 
 
# ── ProjectVariable CRUD (anidado bajo tabla) ─────────────────────────────────
 
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def table_variables(request, layout_id, table_id):
    """
    GET  /api/scada/layouts/<layout_id>/tables/<table_id>/variables/
    POST /api/scada/layouts/<layout_id>/tables/<table_id>/variables/
    """
    layout = get_layout_or_404(request, layout_id)
    if not layout:
        return Response({"error": "No encontrado o no autorizado"}, status=404)
 
    try:
        table = VariableTable.objects.get(id=table_id, layout=layout)
    except VariableTable.DoesNotExist:
        return Response({"error": "Tabla no encontrada"}, status=404)
 
    if request.method == "GET":
        qs = ProjectVariable.objects.filter(table=table)
        source = request.query_params.get("source")
        if source:
            qs = qs.filter(source=source)
        return Response(ProjectVariableSerializer(qs, many=True).data)
 
    elif request.method == "POST":
        data = {**request.data, "table": table.id}
        serializer = ProjectVariableSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
 
 
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def table_variable_detail(request, layout_id, table_id, var_id):
    """
    GET    /api/scada/layouts/<layout_id>/tables/<table_id>/variables/<var_id>/
    PATCH  → editar variable
    DELETE → eliminar variable
    """
    layout = get_layout_or_404(request, layout_id)
    if not layout:
        return Response({"error": "No encontrado o no autorizado"}, status=404)
 
    try:
        table = VariableTable.objects.get(id=table_id, layout=layout)
        variable = ProjectVariable.objects.get(id=var_id, table=table)
    except (VariableTable.DoesNotExist, ProjectVariable.DoesNotExist):
        return Response({"error": "No encontrado"}, status=404)
 
    if request.method == "GET":
        return Response(ProjectVariableSerializer(variable).data)
 
    elif request.method == "PATCH":
        serializer = ProjectVariableSerializer(variable, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
 
    elif request.method == "DELETE":
        variable.delete()
        return Response(status=204)
 
 
# ── Resolución de UUID para el runtime WebSocket ──────────────────────────────
 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resolve_variable_id(request):
    """
    GET /api/scada/variables/resolve/?variable_id=<uuid>
    Resuelve un variable_id UUID a su ProjectVariable completa.
    Usado por el WebSocket consumer para saber a qué tag real suscribirse.
    """
    uid = request.query_params.get("variable_id")
    if not uid:
        return Response({"error": "Parámetro variable_id requerido"}, status=400)
    try:
        variable = ProjectVariable.objects.select_related("table__layout").get(variable_id=uid)
    except ProjectVariable.DoesNotExist:
        return Response({"error": "Variable no encontrada"}, status=404)
    if variable.table.layout.user != request.user:
        return Response({"error": "No autorizado"}, status=403)
    return Response(ProjectVariableSerializer(variable).data)
 