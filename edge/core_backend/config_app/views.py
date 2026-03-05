from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .services import export_gateway_config

class GatewayConfigExportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            data = export_gateway_config()
            return Response(data)
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