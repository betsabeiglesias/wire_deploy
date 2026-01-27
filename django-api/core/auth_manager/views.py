from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

# Importamos tus cosas originales
from core.auth_manager.permissions import IsAuthenticatedAndActive
from .serializers import UserSerializer

# 1. LA NUEVA VISTA DE LOGIN (GESTIONA COOKIES)
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is not None:
            if not user.is_active:
                return Response({"detail": "Usuario inactivo"}, status=status.HTTP_401_UNAUTHORIZED)

            # Generamos los tokens de JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Datos que queremos devolver al frontend para el store
            data = {
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }

            response = Response(data, status=status.HTTP_200_OK)

            # Inyectamos el Access Token en una Cookie HttpOnly
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path='/'
            )

            # Inyectamos el Refresh Token en otra Cookie
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path='/'
            )

            return response
        
        return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

# 2. VISTA DE LOGOUT (BORRA COOKIES)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response({"detail": "Sesión cerrada"}, status=status.HTTP_200_OK)
    response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
    response.delete_cookie('refresh_token')
    return response

# 3. TUS VISTAS ORIGINALES (MANTENIDAS)
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
    # Aquí es donde en el futuro añadiremos el campo 'cliente'
    return Response({
        'username': user.username,
        'email': user.email,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
    })