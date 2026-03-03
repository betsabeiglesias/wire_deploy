from django.shortcuts import render
from .serializers import MyPowerBiSerializer
from .models import MyPowerBi
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db import transaction

class PowerBiViewSet(viewsets.ModelViewSet):
    serializer_class = MyPowerBiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MyPowerBi.objects.filter(user=self.request.user)

    @action(detail=False, methods=['put'], url_path='reorder')
    def reorder(self, request):
        pbis_data = request.data.get("pbis", [])
        with transaction.atomic():
            for item in pbis_data:
                pbi_id = item.get("id")
                new_order = item.get("order")
                MyPowerBi.objects.filter(id=pbi_id, user=request.user).update(order=new_order)
        return Response({"message": "Orden de PowerBI actualizado"}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        membership = self.request.user.memberships.filter(is_active=True).first()
        if not membership:
            raise ValidationError({"detail": "No tienes un cliente activo asignado."})
        
        # Asignamos orden al final por defecto
        max_order = MyPowerBi.objects.filter(user=self.request.user).count()
        powerbi = serializer.save(client=membership.client, order=max_order)
        powerbi.user.add(self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()