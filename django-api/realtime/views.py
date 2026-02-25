from datetime import datetime, timedelta, timezone
import jwt

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def realtime_token(request):
    """
    Devuelve un JWT de corta duración SOLO para WebSocket realtime
    """
    user = request.user

    # ⚠️ misma lógica multitenant que ya usas en /api/me/
    membership = (
        user.memberships
        .filter(is_active=True)
        .select_related("client", "role")
        .first()
    )

    if not membership:
        return Response(
            {"detail": "Usuario sin cliente activo"},
            status=403,
        )

    
    payload = {
        "user_id": user.id,
        "client_id": str(membership.client.id),
        "scopes": ["realtime"],
        "roles": [], # RETOMAR
        "iat": int(datetime.now(tz=timezone.utc).timestamp()),
        "exp": int((datetime.now(tz=timezone.utc) + timedelta(minutes=5)).timestamp()),
        "iss": "realtime-gateway",
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256",
    )

    return Response({
        "token": token,
        "expires_in": 300,
    })

