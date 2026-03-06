# docker-suite\django-api\industrial_config_manager\api\views.py

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated


from industrial_config_manager.models import (
    Site, Area, WorkCenter, WorkUnit, PLC, Tag
)
from .serializers import (
    SiteSerializer, AreaSerializer,
    WorkCenterSerializer, WorkUnitSerializer,
    PLCSerializer, TagSerializer, TagMinimalSerializer,
    TagCreateSerializer, TagBulkToggleSerializer
)



# ========================================
# ISA-95 HIERARCHY VIEWSETS
# ========================================

class SiteViewSet(ModelViewSet):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer


class AreaViewSet(ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer


class WorkCenterViewSet(ModelViewSet):
    queryset = WorkCenter.objects.all()
    serializer_class = WorkCenterSerializer


class WorkUnitViewSet(ModelViewSet):
    queryset = WorkUnit.objects.all()
    serializer_class = WorkUnitSerializer


# ========================================
# PLC VIEWSET (ENDPOINTS JERÁRQUICOS)
# ========================================


class PLCViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = PLC.objects.all()
    serializer_class = PLCSerializer

    @action(detail=True, methods=["patch"])
    def toggle_enabled(self, request, pk=None):
        plc = self.get_object()

        enabled = request.data.get("enabled")

        if enabled is None:
            return Response(
                {"error": "Field 'enabled' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        plc.enabled = enabled
        plc.save()

        return Response(PLCSerializer(plc).data)
    
    @action(detail=True, methods=["get", "post"], url_path="tags")
    def tags(self, request, pk=None):
        """
        GET  /api/config/plc/{id}/tags/
        POST /api/config/plc/{id}/tags/
        """
        plc = self.get_object()

        # LIST TAGS
        if request.method == "GET":
            tags = plc.tags.all()
            serializer = TagMinimalSerializer(tags, many=True)
            return Response(serializer.data)

        # CREATE TAG
        elif request.method == "POST":
            data = request.data.copy()
            data["plc"] = plc.id

            serializer = TagCreateSerializer(data=data)
            serializer.is_valid(raise_exception=True)

            tag = serializer.save()

            return Response(TagSerializer(tag).data, status=201)
