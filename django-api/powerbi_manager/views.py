from django.shortcuts import render
from .serializers import MyPowerBiSerializer
from .models import MyPowerBi
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import viewsets




class PowerBiViewSet(viewsets.ModelViewSet):
    serializer_class = MyPowerBiSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MyPowerBi.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        powerbi = serializer.save()
        powerbi.user.add(self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()
