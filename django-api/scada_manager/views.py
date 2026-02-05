# from django.http import HttpResponse
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from django.utils.crypto import get_random_string
# from rest_framework import viewsets
# from django.db import transaction
# from django.db.models import Q
# # from .serializers import MyLayOutsTitleSerializer # Nota: ya se importa abajo, pero se mantiene si lo usas aquí
# from .models import Country, Location, Factory, Area, Manufacturer, Machine, MyLayOut, MyLayOutsTitle 
# from .serializers import (
#     CountrySerializer,
#     LocationSerializer,
#     FactorySerializer,
#     AreaSerializer,
#     ManufacturerSerializer,
#     MachineSerializer, 
#     MyLayOutSerializer, 
#     MyLayOutsTitleSerializer, 
#     # MyPowerBiSerializer # <-- AÑADIDO DE LA RAMA 'principal'
# )

# # ----- Vistas normales -----
# def home(request):
#     return HttpResponse("¡Bienvenido a Industry4 Suite!")

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def protected_api_view(request):
#     return Response({"message": "¡Acceso autorizado!"})

# # ----- ViewSets para DRF -----
# class CountryViewSet(viewsets.ModelViewSet):
#     queryset = Country.objects.all()
#     serializer_class = CountrySerializer

# class LocationViewSet(viewsets.ModelViewSet):
#     queryset = Location.objects.all()
#     serializer_class = LocationSerializer

# class FactoryViewSet(viewsets.ModelViewSet):
#     queryset = Factory.objects.all()
#     serializer_class = FactorySerializer

# class AreaViewSet(viewsets.ModelViewSet):
#     queryset = Area.objects.all()
#     serializer_class = AreaSerializer

# class ManufacturerViewSet(viewsets.ModelViewSet):
#     queryset = Manufacturer.objects.all()
#     serializer_class = ManufacturerSerializer

# class MachineViewSet(viewsets.ModelViewSet):
#     queryset = Machine.objects.all()
#     serializer_class = MachineSerializer




# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def save_layout(request):
#     button_name = request.data.get("button_name")
#     elements = request.data.get("elements", [])
#     views_data = request.data.get("views_data")  # Nuevo: datos de multi-vista

#     if not button_name:
#         return Response({"error": "button_name es obligatorio"}, status=400)

#     with transaction.atomic():
#         # Crear el título con views_data si existe
#         title_obj = MyLayOutsTitle.objects.create(
#             button_name=button_name,
#             views_data=views_data,  # Guardar views_data directamente
#             user=request.user
#         )

#         # Si no hay views_data, guardar elements tradicionales (backward compatibility)
#         if not views_data and isinstance(elements, list):
#             for el in elements:
#                 # Usamos un ID único por si el frontend no lo pasa
#                 instance_id = el.get("id")
#                 if not instance_id:
#                     instance_id = get_random_string(12)

#                 serializer = MyLayOutSerializer(data={
#                     'id': instance_id,
#                     'x': el.get("x", 0),
#                     'y': el.get("y", 0),
#                     'data': el.get("data", {}),
#                 })
#                 serializer.is_valid(raise_exception=True)
#                 serializer.save(user=request.user, button_name=title_obj)

#     # Devolver el título con todos los layouts guardados
#     response_serializer = MyLayOutsTitleSerializer(title_obj)
#     return Response(response_serializer.data)


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def my_layouts(request):
#     """
#     Devuelve todos los layouts creados por el usuario logueado
#     """
#     titles = MyLayOutsTitle.objects.filter(user=request.user).distinct()
#     serializer = MyLayOutsTitleSerializer(titles, many=True)
#     return Response(serializer.data)

# # Añadir PUT y DELETE para permitir la actualización y eliminación
# @api_view(["GET", "PUT", "DELETE"]) 
# @permission_classes([IsAuthenticated])
# def layout_detail(request, title_id):
#     # 1. Buscar el título y verificar permisos
#     try:
#         title = MyLayOutsTitle.objects.get(id=title_id)
#     except MyLayOutsTitle.DoesNotExist:
#         return Response({"error": "No encontrado"}, status=404)

#     # Comprobar si el usuario es dueño directo o tiene layouts asociados
#     if not (title.user == request.user or title.mylayout_set.filter(user=request.user).exists()):
#         return Response({"error": "No autorizado"}, status=403)


#     # --- GET (Devolver el detalle) ---
#     if request.method == "GET":
#         if title.views_data:
#             return Response({
#                 "id": title.id,
#                 "button_name": title.button_name,
#                 "views_data": title.views_data
#             })
#         else:
#             serializer = MyLayOutSerializer(title.mylayout_set.filter(user=request.user), many=True)
#             return Response({
#                 "id": title.id,
#                 "button_name": title.button_name,
#                 "elements": serializer.data
#             })

#     # --- PUT (Actualizar el detalle) ---
#     elif request.method == "PUT":
#         button_name = request.data.get("button_name")
#         elements = request.data.get("elements", [])
#         views_data = request.data.get("views_data")  # Nuevo: datos de multi-vista

#         if not button_name:
#             return Response({"error": "button_name es obligatorio"}, status=400)

#         with transaction.atomic():
#             # A. Actualizar el nombre del Título y views_data
#             title.button_name = button_name
#             title.views_data = views_data  # Actualizar views_data
#             title.user = request.user
#             title.save()
            
#             # B. Si no hay views_data, actualizar elements tradicionales (backward compatibility)
#             if not views_data:
#                 # Normaliza el payload para aceptar objetos anidados u otras formas
#                 if isinstance(elements, dict):
#                     if isinstance(elements.get("elements"), list):
#                         elements = elements.get("elements")
#                     else:
#                         elements = list(elements.values())
                
#                 if not isinstance(elements, list):
#                     return Response({"error": "elements debe ser una lista"}, status=400)
                
#                 # Eliminar los layouts antiguos del usuario actual asociados a este título
#                 title.mylayout_set.filter(user=request.user).delete()
                
#                 # C. Guardar los nuevos elementos
#                 new_layouts = []
#                 for el in elements:
#                     instance_id = el.get("id")
#                     if not instance_id:
#                         instance_id = get_random_string(12)

#                     serializer = MyLayOutSerializer(data={
#                         'id': instance_id,
#                         'x': el.get("x", 0),
#                         'y': el.get("y", 0),
#                         'data': el.get("data", {}),
#                     })
#                     serializer.is_valid(raise_exception=True)
#                     new_layouts.append(serializer.save(user=request.user, button_name=title))

#         # 4. Devolver la respuesta de éxito (devuelve el título actualizado)
#         response_serializer = MyLayOutsTitleSerializer(title)
#         return Response(response_serializer.data)

#     # --- DELETE (Borrar el detalle) ---
#     elif request.method == "DELETE":
#         # Borra el título, que debería eliminar en cascada los MyLayOuts asociados.
#         title.delete()
#         return Response(status=204)
    

from django.http import HttpResponse
from django.db import transaction
from django.utils.crypto import get_random_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MyLayOut, MyLayOutsTitle 
from .serializers import MyLayOutSerializer, MyLayOutsTitleSerializer

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
    button_name = request.data.get("button_name")
    elements = request.data.get("elements", [])
    views_data = request.data.get("views_data")

    if not button_name:
        return Response({"error": "button_name es obligatorio"}, status=400)

    with transaction.atomic():
        title_obj = MyLayOutsTitle.objects.create(
            button_name=button_name,
            views_data=views_data,
            user=request.user
        )

        if not views_data and isinstance(elements, list):
            for el in elements:
                instance_id = el.get("id") or get_random_string(12)
                serializer = MyLayOutSerializer(data={
                    'id': instance_id,
                    'x': el.get("x", 0),
                    'y': el.get("y", 0),
                    'data': el.get("data", {}),
                })
                serializer.is_valid(raise_exception=True)
                # IMPORTANTE: El modelo MyLayOut no tiene campo 'user', 
                # lo guarda a través de la relación con MyLayOutsTitle.
                serializer.save(button_name=title_obj)

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
        button_name = request.data.get("button_name")
        views_data = request.data.get("views_data")
        elements = request.data.get("elements", [])

        with transaction.atomic():
            title.button_name = button_name
            title.views_data = views_data
            title.save()
            
            if not views_data:
                # Limpiar y recrear elementos si es el formato antiguo
                title.mylayout_set.all().delete()
                for el in elements:
                    instance_id = el.get("id") or get_random_string(12)
                    serializer = MyLayOutSerializer(data={
                        'id': instance_id,
                        'x': el.get("x", 0),
                        'y': el.get("y", 0),
                        'data': el.get("data", {}),
                    })
                    serializer.is_valid(raise_exception=True)
                    serializer.save(button_name=title)

        return Response(MyLayOutsTitleSerializer(title).data)

    elif request.method == "DELETE":
        title.delete()
        return Response(status=204)