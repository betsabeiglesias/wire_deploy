from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

# Custom JWT
from core.auth_manager.tokens import CustomRefreshToken

# Permisos
from core.auth_manager.permissions import IsAuthenticatedAndActive


# 1. VISTA DE LOGIN (MULTITENANT + JWT EN COOKIES)
class LoginView(APIView):
    permission_classes = [AllowAny]

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

        # 🔎 Lógica multitenant: el usuario DEBE tener cliente activo
        membership = (
            user.memberships
            .filter(is_active=True)
            .select_related('client', 'role')
            .first()
        )

        # 🚨 Invariante de dominio (esto NO debería pasar nunca)
        if not membership:
            raise RuntimeError("Invariante rota: user sin cliente activo")

        # 🔐 Generamos el Refresh Token (fuente de verdad)
        refresh = CustomRefreshToken.for_user(user)

        # 🔐 Contexto multitenant y permisos (viven en el refresh)
        refresh['client_id'] = membership.client.id
        refresh['roles'] = [membership.role.code]
        refresh['scopes'] = membership.role.scopes

        # 🎟️ Tokens finales
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # 📦 Payload para el frontend
        data = {
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "client": {
                "id": membership.client.id,
                "name": membership.client.name,
                "role": membership.role.code,
                "scopes": membership.role.scopes,
            }
        }

        response = Response(data, status=status.HTTP_200_OK)

        # 🍪 Access Token en cookie HttpOnly
        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            value=access_token,
            expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            path='/',
        )

        # 🍪 Refresh Token en cookie HttpOnly
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            path='/',
        )

        return response


# 2. LOGOUT (BORRA COOKIES)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response(
        {"detail": "Sesión cerrada"},
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
    })


# 4. USUARIO ACTUAL
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
            "id": membership.client.id,
            "name": membership.client.name,
            "role": membership.role.code,
            "scopes": membership.role.scopes,
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
