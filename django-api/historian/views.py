# # historian/views.py
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import serializers, status

# from . import services


# # ── Serializer de entrada ────────────────────────────────────────────────────

# class TagItemSerializer(serializers.Serializer):
#     equipment_id = serializers.CharField()
#     variable = serializers.CharField()


# class HistorianQuerySerializer(serializers.Serializer):
#     tags = TagItemSerializer(many=True, min_length=1)
#     start = serializers.DateTimeField(input_formats=["iso-8601"])
#     stop = serializers.DateTimeField(input_formats=["iso-8601"])
#     limit = serializers.IntegerField(default=5000, min_value=1, max_value=50_000)


# # ── Endpoint ─────────────────────────────────────────────────────────────────

# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def historian_query(request):
#     """
#     POST /api/historian/query/

#     Body:
#     {
#         "tags":  [{"equipment_id": "...", "variable": "..."}],
#         "start": "2026-03-22T00:00:00",
#         "stop":  "2026-03-23T00:00:00",
#         "limit": 5000
#     }

#     Response:
#     {
#         "rows": [
#             {
#                 "timestamp":    "2026-03-22T10:00:00",
#                 "equipment_id": "...",
#                 "variable":     "...",
#                 "value":        42.5,
#                 "datatype":     "float",
#                 "unit":         "°C",
#                 "quality":      "good"
#             }
#         ],
#         "count":     1234,
#         "truncated": false
#     }
#     """
#     ser = HistorianQuerySerializer(data=request.data)
#     if not ser.is_valid():
#         return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

#     d = ser.validated_data

#     # DateTimeField ya parsea a datetime → convertir a string ISO para SQL Server
#     start_iso = d["start"].strftime("%Y-%m-%dT%H:%M:%S")
#     stop_iso = d["stop"].strftime("%Y-%m-%dT%H:%M:%S")

#     try:
#         result = services.query_history(
#             tags=d["tags"],
#             start=start_iso,
#             stop=stop_iso,
#             limit=d["limit"],
#         )
#     except Exception as exc:
#         import traceback
#         print(traceback.format_exc())
#         return Response(
#             {"error": str(exc)},
#             status=status.HTTP_503_SERVICE_UNAVAILABLE,
#         )

#     return Response(result)
