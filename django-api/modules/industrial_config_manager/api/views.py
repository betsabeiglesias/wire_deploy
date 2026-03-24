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
        
    @action(detail=True, methods=["get", "patch", "delete"], url_path="tags/(?P<tag_pk>[^/.]+)")
    def tag_detail(self, request, pk=None, tag_pk=None):
        """
        GET    /api/config/plc/{id}/tags/{tag_pk}/
        PATCH  /api/config/plc/{id}/tags/{tag_pk}/
        DELETE /api/config/plc/{id}/tags/{tag_pk}/
        """
        plc = self.get_object()
        tag = get_object_or_404(Tag, pk=tag_pk, plc=plc)

        if request.method == "GET":
            return Response(TagSerializer(tag).data)

        elif request.method == "PATCH":
            serializer = TagSerializer(tag, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        elif request.method == "DELETE":
            tag.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=["patch"], url_path="tags/(?P<tag_pk>[^/.]+)/toggle")
    def tag_toggle(self, request, pk=None, tag_pk=None):
        """
        PATCH /api/config/plc/{id}/tags/{tag_pk}/toggle/
        """
        plc = self.get_object()
        tag = get_object_or_404(Tag, pk=tag_pk, plc=plc)

        enabled = request.data.get("enabled")
        if enabled is None:
            return Response(
                {"error": "Field 'enabled' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        tag.enabled = enabled
        tag.save()
        return Response(TagSerializer(tag).data)
