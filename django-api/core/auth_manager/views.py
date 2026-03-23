from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.views import TokenRefreshView

# Custom JWT e Invariantes
from core.auth_manager.tokens import CustomRefreshToken

# Permisos personalizados
from core.auth_manager.permissions import IsAuthenticatedAndActive


# 1. VISTA DE LOGIN (MULTITENANT + JWT EN COOKIES)
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Credenciales inválidas"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"detail": "Usuario inactivo"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 🔎 Lógica multitenant: buscamos membresía activa
        membership = (
            user.memberships
            .filter(is_active=True)
            .select_related('client', 'role')
            .first()
        )

        if not membership:
            return Response(
                {"detail": "El usuario no tiene un cliente asignado o activo."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 🔐 Generamos el Refresh Token
        refresh = CustomRefreshToken.for_user(user)

        # 🛡️ Manejo de Rol opcional (Invariante de seguridad)
        role_code = membership.role.code if membership.role else "no_role"
        role_name = membership.role.name if membership.role else "Sin Rol"
        role_scopes = membership.role.scopes if membership.role else []

        # 🔐 Inyectamos contexto en el payload del token
        # Forzamos str() en el ID por si es un UUID de base de datos
        refresh['client_id'] = str(membership.client.id)
        refresh['roles'] = [role_code]
        refresh['scopes'] = role_scopes

        # 📦 Payload para el estado de Zustand en el frontend
        data = {
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "client": {
                "id": str(membership.client.id),
                "name": membership.client.name,
                "role": role_code,
                "role_display": role_name,
                "scopes": role_scopes,
            }
        }

        response = Response(data, status=status.HTTP_200_OK)

        # 🍪 Cookie del Access Token
        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            value=str(refresh.access_token),
            expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            path='/',
        )

        # 🍪 Cookie del Refresh Token
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            path='/',
        )

        return response


# 2. LOGOUT (BORRA TODAS LAS COOKIES)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response(
        {"detail": "Sesión cerrada correctamente"},
        status=status.HTTP_200_OK
    )
    response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
    response.delete_cookie('refresh_token')
    return response


# 3. HEALTH CHECK DEL TOKEN
@api_view(['GET'])
@permission_classes([IsAuthenticatedAndActive])
def token_health_check(request):
    return Response({
        "authenticated": True,
        "user": request.user.username,
        "is_active": request.user.is_active
    })


# 4. USUARIO ACTUAL (ENDPOINT /api/auth/me/)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user

    membership = (
        user.memberships
        .filter(is_active=True)
        .select_related('client', 'role')
        .first()
    )

    client_info = None
    if membership:
        client_info = {
            "id": str(membership.client.id),
            "name": membership.client.name,
            "role": membership.role.code if membership.role else "no_role",
            "role_display": membership.role.name if membership.role else "Sin Rol",
            "scopes": membership.role.scopes if membership.role else [],
        }

    return Response({
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "date_joined": user.date_joined,
        "client": client_info,
    })


# 5. REFRESH TOKEN DESDE COOKIES
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # 1. Extraemos el refresh token de la cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        # 2. Si existe, lo inyectamos en el body para que la vista madre lo procese
        if refresh_token:
            request.data['refresh'] = refresh_token
        
        response = super().post(request, *args, **kwargs)
        
        # 3. Si la renovación fue exitosa, actualizamos la cookie del Access Token
        if response.status_code == 200:
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=response.data['access'],
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path='/',
            )
            # Opcional: Eliminar el access del body para que solo viaje en cookies
            del response.data['access']
            
        return response


# 6. MÓDULOS ACTIVOS (NUEVO)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_modules(request):
    """
    Devuelve la lista de módulos dinámicos habilitados en el .env 
    definidos en settings.DYNAMIC_MODULES
    """
    return Response({
        "modules": getattr(settings, 'DYNAMIC_MODULES', [])
    })