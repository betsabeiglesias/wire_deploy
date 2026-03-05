
from django.http import HttpResponse
from django.db import transaction
from django.utils.crypto import get_random_string
from django.apps import apps
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MyLayOutsTitle, CustomTagGroup, CustomTag
from .serializers import (
    MyLayOutsTitleSerializer,
    CustomTagGroupSerializer,
    CustomTagSerializer,
)


class CustomTagGroupViewSet(viewsets.ModelViewSet):
    queryset = CustomTagGroup.objects.all().order_by("-created_at")
    serializer_class = CustomTagGroupSerializer
    permission_classes = [IsAuthenticated]

    def _resolve_client_for_request(self):
        user = self.request.user
        membership_model = apps.get_model("auth_manager", "ClientMembership")

        requested_client_id = self.request.query_params.get("client_id")
        memberships = membership_model.objects.filter(user=user, is_active=True)

        if requested_client_id:
            allowed = memberships.filter(client_id=requested_client_id).exists()
            if not allowed and not user.is_superuser:
                raise PermissionDenied("No tienes acceso a ese client_id.")
            return requested_client_id

        first_membership = memberships.order_by("created_at").first()
        if first_membership:
            return first_membership.client_id
        return None

    def get_queryset(self):
        queryset = super().get_queryset()
        client_id = self._resolve_client_for_request()
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        elif not self.request.user.is_superuser:
            queryset = queryset.none()
        return queryset

    def perform_create(self, serializer):
        client_id = self._resolve_client_for_request()
        if not client_id:
            raise ValidationError(
                {"client": "No se pudo resolver el cliente para el usuario autenticado."},
            )
        serializer.save(client_id=client_id)


class CustomTagViewSet(viewsets.ModelViewSet):
    queryset = CustomTag.objects.all().order_by("-updated_at")
    serializer_class = CustomTagSerializer
    permission_classes = [IsAuthenticated]

    def _resolve_client_for_request(self):
        user = self.request.user
        membership_model = apps.get_model("auth_manager", "ClientMembership")
        requested_client_id = self.request.query_params.get("client_id")
        memberships = membership_model.objects.filter(user=user, is_active=True)

        if requested_client_id:
            allowed = memberships.filter(client_id=requested_client_id).exists()
            if not allowed and not user.is_superuser:
                raise PermissionDenied("No tienes acceso a ese client_id.")
            return requested_client_id

        first_membership = memberships.order_by("created_at").first()
        if first_membership:
            return first_membership.client_id
        return None

    def get_queryset(self):
        queryset = super().get_queryset()
        client_id = self._resolve_client_for_request()
        if client_id:
            queryset = queryset.filter(group__client_id=client_id)
        elif not self.request.user.is_superuser:
            queryset = queryset.none()
        return queryset

    def perform_create(self, serializer):
        client_id = self._resolve_client_for_request()
        group = serializer.validated_data.get("group")
        if not group:
            raise ValidationError({"group": "Este campo es obligatorio."})
        if client_id and str(group.client_id) != str(client_id) and not self.request.user.is_superuser:
            raise PermissionDenied("El grupo no pertenece al cliente autenticado.")
        serializer.save()

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
    views_data = request.data.get("views_data")

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
