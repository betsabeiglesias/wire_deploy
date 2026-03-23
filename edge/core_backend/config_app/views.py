# from rest_framework.views import APIView
# from rest_framework.response import Response
# from django.core.cache import cache
# from django.conf import settings

# from .services.export_config import export_gateway_config
# from .permissions import EdgeApiKeyPermission


# CACHE_KEY = "edge_gateway_config"


# def get_gateway_config():

#     cfg = cache.get(CACHE_KEY)

#     if not cfg:
#         cfg = export_gateway_config()
#         cache.set(CACHE_KEY, cfg, 30)

#     return cfg


# class EdgeConfigView(APIView):

#     permission_classes = [EdgeApiKeyPermission]

#     def get(self, request):
#         cfg = get_gateway_config()
#         return Response(cfg)


# class EdgeTagsView(APIView):

#     permission_classes = [EdgeApiKeyPermission]

#     def get(self, request):

#         cfg = get_gateway_config()

#         tags = []

#         for eq in cfg.get("equipments", []):

#             equipment_id = eq.get("equipment_id")

#             # PLC = última parte del equipment_id
#             plc = equipment_id.split("/")[-1] if equipment_id else None

#             for item in eq.get("items", []):

#                 tags.append({
#                     "equipment_id": equipment_id,
#                     "plc": plc,
#                     "tag": item.get("name"),
#                     "datatype": item.get("datatype"),
#                     "unit": item.get("unit"),
#                 })

#         return Response(tags)