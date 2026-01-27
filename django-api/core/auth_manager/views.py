
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from core.auth_manager.permissions import IsAuthenticatedAndActive
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticatedAndActive])
def token_health_check(request):
    
    return Response({
        "authenticated": True,
        "user": request.user.username,
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined, # <--- ESTE ES EL QUE PIDE USERPAGE
    })
