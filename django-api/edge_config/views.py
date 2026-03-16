# gateway_config/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from .permissions import EdgeApiKeyPermission
from .services.export_config import export_gateway_config


CACHE_KEY = "edge_gateway_config"


def get_gateway_config():
    cfg = cache.get(CACHE_KEY)
    if not cfg:
        cfg = export_gateway_config()
        cache.set(CACHE_KEY, cfg, 30)
    return cfg


# ─── Edge (API key) ───────────────────────────────────────────────────────────

class EdgeConfigView(APIView):
    """
    Configuración completa para que el edge genere el YAML.
    GET /api/edge/config/
    """
    permission_classes = [EdgeApiKeyPermission]

    def get(self, request):
        return Response(get_gateway_config())


# ─── Frontend (JWT) ───────────────────────────────────────────────────────────

class GatewayTagsView(APIView):
    """
    Lista plana de tags con campos ISA-95 descompuestos.
    Consumida por ScadaConfigProvider para buildTagTree y buildTagIndex.
    GET /api/gateway/tags/
    GET /api/gateway/tags/?plc=PLC_01
    GET /api/gateway/tags/?equipment_id=Site/Area/Line/Cell/PLC_01
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cfg = get_gateway_config()
        filter_plc = request.query_params.get("plc")
        filter_equipment = request.query_params.get("equipment_id")

        tags = []
        for eq in cfg.get("equipments", []):
            equipment_id = eq.get("equipment_id", "")
            parts = equipment_id.split("/")
            plc = parts[-1] if parts else None

            if filter_plc and plc != filter_plc:
                continue
            if filter_equipment and equipment_id != filter_equipment:
                continue

            # Descomposición ISA-95 — los índices dependen de tu jerarquía
            site      = parts[0] if len(parts) > 0 else ""
            area      = parts[1] if len(parts) > 1 else ""
            line      = parts[2] if len(parts) > 2 else ""
            cell      = parts[3] if len(parts) > 3 else ""
            equipment = parts[4] if len(parts) > 4 else plc

            for item in eq.get("items", []):
                tags.append({
                    # Campos planos para buildTagTree y buildTagIndex
                    "site":         site,
                    "area":         area,
                    "line":         line,
                    "cell":         cell,
                    "equipment":    equipment,
                    "variable":     item.get("name"),
                    # Campos extra para el combobox y el designer
                    "equipment_id": equipment_id,
                    "datatype":     item.get("datatype"),
                    "unit":         item.get("unit", ""),
                    "address":      item.get("address", ""),
                    "description":  item.get("description", ""),
                })

        return Response(tags)


class GatewayPLCsView(APIView):
    """
    Lista de PLCs sin tags. Para poblar dropdowns de selección de equipo.
    GET /api/gateway/plcs/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cfg = get_gateway_config()
        plcs = []
        for eq in cfg.get("equipments", []):
            equipment_id = eq.get("equipment_id", "")
            parts = equipment_id.split("/")
            plcs.append({
                "equipment_id": equipment_id,
                "plc":          parts[-1] if parts else "",
                "driver":       eq.get("driver"),
                "tag_count":    len(eq.get("items", [])),
            })
        return Response(plcs)


class CacheInvalidateView(APIView):
    """
    Invalida el caché manualmente tras modificar PLCs o tags.
    POST /api/gateway/cache/invalidate/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cache.delete(CACHE_KEY)
        return Response({"detail": "Caché invalidado correctamente."})