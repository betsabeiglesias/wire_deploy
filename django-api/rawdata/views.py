from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework.exceptions import ValidationError

from .services import query_raw_data
from .serializers import RawDataPointSerializer

class RawDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from_ts = request.query_params.get("from")
        to_ts = request.query_params.get("to")
        machine_id = request.query_params.get("machine_id")
        variable = request.query_params.get("variable")

        try:
            limit = int(request.query_params.get("limit", 10000))
        except ValueError:
            raise ValidationError("limit must be an integer")

        if not from_ts or not to_ts:
            raise ValidationError("'from' and 'to' query parameters are mandatory")

        if limit <= 0 or limit > 100000:
            raise ValidationError("limit must be between 1 and 100000")

        rows, meta = query_raw_data(
            from_ts=from_ts,
            to_ts=to_ts,
            machine_id=machine_id,
            variable=variable,
            limit=limit,
        )

        serializer = RawDataPointSerializer(rows, many=True)

        return Response({
            "meta": meta,
            "data": serializer.data
        })

