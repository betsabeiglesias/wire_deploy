from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .services import export_gateway_config
from django.core.cache import cache

def get_gateway_config():
    cfg = cache.get("gateway_config")

    if not cfg:
        cfg = export_gateway_config()
        cache.set("gateway_config", cfg, 10)

    return cfg

class GatewayConfigExportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            cfg = get_gateway_config()
            return Response(cfg)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )
        


#RETOMAR USAR UNA API KEY INTERNA, PORQUE ESTE ENDPOINT NO ES DE USUARIO, ES DE INFRAESTRUCTURA SCAD
# class GatewayConfigExportView(APIView):
    # def get(self, request):
    #     key = request.headers.get("X-EDGE-KEY")
    #     if key != "dev-secret":
    #         return Response({"error": "unauthorized"}, status=403)
    #     data = export_gateway_config()
    #     return Response(data)

# Y EN EL FRONT
# axios.get("/api/config/export/", {
#   headers: {
#     "X-EDGE-KEY": "dev-secret"
#   }
# })

class GatewayTagsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            cfg = get_gateway_config()

            tags = []

            for eq in cfg.get("equipments", []):
                isa = eq.get("isa95", {})

                for item in eq.get("items", []):
                    cdc = item.get("cdc", {})
                    tag = cdc.get("tag")

                    if not tag:
                        continue

                    tags.append({
                        "tag": tag,
                        "unit": cdc.get("unit"),
                        "datatype": item.get("datatype"),

                        "site": isa.get("site"),
                        "area": isa.get("area"),
                        "line": isa.get("work_center"),
                        "equipment": isa.get("work_unit"),

                        "equipment_id": eq.get("equipment_id"),
                        "name": item.get("name"),
                    })

            return Response(tags)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

# RETOMAR
# class GatewayReloadView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         try:
#             reload_gateway()
#             return Response({"status": "reloaded"})
#         except Exception as e:
#             return Response({"error": str(e)}, status=500)