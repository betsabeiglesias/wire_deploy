
from django.http import HttpResponse
from django.db import transaction
from django.utils.crypto import get_random_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MyLayOutsTitle, ProjectVariable
from .serializers import MyLayOutsTitleSerializer, ProjectVariableSerializer

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



@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def project_variables(request, title_id):
    """
    GET  /api/layouts/<title_id>/variables/  → lista variables del proyecto
    POST /api/layouts/<title_id>/variables/  → crear variable
    """
    # Verificar que el layout pertenece al usuario
    try:
        layout = MyLayOutsTitle.objects.get(id=title_id, user=request.user)
    except MyLayOutsTitle.DoesNotExist:
        return Response({"error": "No encontrado o no autorizado"}, status=404)
 
    if request.method == "GET":
        qs = ProjectVariable.objects.filter(layout=layout)
        # Filtro opcional por source: ?source=connection | ?source=local
        source = request.query_params.get("source")
        if source:
            qs = qs.filter(source=source)
        return Response(ProjectVariableSerializer(qs, many=True).data)
 
    elif request.method == "POST":
        data = {**request.data, "layout": layout.id}
        serializer = ProjectVariableSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
 
 
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def project_variable_detail(request, title_id, var_id):
    """
    GET    /api/layouts/<title_id>/variables/<var_id>/
    PATCH  /api/layouts/<title_id>/variables/<var_id>/
    DELETE /api/layouts/<title_id>/variables/<var_id>/
    """
    try:
        MyLayOutsTitle.objects.get(id=title_id, user=request.user)
    except MyLayOutsTitle.DoesNotExist:
        return Response({"error": "No encontrado o no autorizado"}, status=404)
 
    try:
        variable = ProjectVariable.objects.get(id=var_id, layout_id=title_id)
    except ProjectVariable.DoesNotExist:
        return Response({"error": "Variable no encontrada"}, status=404)
 
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
 
 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resolve_variable_id(request):
    """
    Resuelve un variable_id (UUID) → ProjectVariable completa.
    Usado por el WebSocket consumer para saber a qué tag real suscribirse.
 
    GET /api/variables/resolve/?variable_id=<uuid>
    """
    uid = request.query_params.get("variable_id")
    if not uid:
        return Response({"error": "Parámetro variable_id requerido"}, status=400)
    try:
        variable = ProjectVariable.objects.select_related("layout").get(variable_id=uid)
    except ProjectVariable.DoesNotExist:
        return Response({"error": "Variable no encontrada"}, status=404)
    # Solo devolver si el layout pertenece al usuario
    if variable.layout.user != request.user:
        return Response({"error": "No autorizado"}, status=403)
    return Response(ProjectVariableSerializer(variable).data)