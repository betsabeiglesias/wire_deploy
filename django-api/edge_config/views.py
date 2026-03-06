from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache
from .permissions import EdgeApiKeyPermission
from .services.export_config import export_gateway_config
from rest_framework.permissions import BasePermission
from django.conf import settings


CACHE_KEY = "edge_gateway_config"


def get_gateway_config():

    cfg = cache.get(CACHE_KEY)

    if not cfg:
        cfg = export_gateway_config()
        cache.set(CACHE_KEY, cfg, 30)

    return cfg


class EdgeApiKeyPermission(BasePermission):

    def has_permission(self, request, view):
        key = request.headers.get("X-EDGE-KEY")
        if not key:
            return False
        return key == settings.EDGE_API_KEY


class EdgeConfigView(APIView):

    permission_classes = [EdgeApiKeyPermission]

    def get(self, request):
        cfg = get_gateway_config()
        return Response(cfg)


class EdgeTagsView(APIView):

    permission_classes = [EdgeApiKeyPermission]

    def get(self, request):
        cfg = get_gateway_config()
        tags = []
        for eq in cfg["equipments"]:
            equipment_id = eq["equipment_id"]
            # PLC = última parte del equipment_id
            plc = equipment_id.split("/")[-1] if equipment_id else None
            for item in eq["items"]:
               tags.append({
                    "equipment_id": equipment_id,
                    "plc": plc,
                    "tag": item["name"],
                    "datatype": item["datatype"],
                    "unit": item["unit"],
                })

        return Response(tags)