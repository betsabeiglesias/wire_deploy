from django.shortcuts import render
from .serializers import MyPowerBiSerializer
from .models import MyPowerBi
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError

class PowerBiViewSet(viewsets.ModelViewSet):
    serializer_class = MyPowerBiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filtramos para que cada usuario solo vea los PowerBIs 
        donde está explícitamente listado.
        """
        return MyPowerBi.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Lógica implícita: Extraemos el cliente del usuario logueado
        antes de guardar en la base de datos.
        """
        # Buscamos la membresía activa del usuario
        membership = self.request.user.memberships.filter(is_active=True).first()
        
        if not membership:
            raise ValidationError(
                {"detail": "No tienes un cliente activo asignado. Contacta con el administrador."}
            )

        # Guardamos el objeto inyectando el cliente automáticamente
        powerbi = serializer.save(client=membership.client)
        
        # Añadimos al usuario actual a la relación ManyToMany
        powerbi.user.add(self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()