# core/middleware/jwt.py

# RETOMAR - REVISAR
# from django.conf import settings
# from auth_app.jwt.validator import validate_jwt
# from auth_app.jwt.exceptions import JWTValidationError


# class JWTAuthenticationMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         token = request.COOKIES.get("access_token")

#         if token:
#             try:
#                 auth_ctx = validate_jwt(
#                     token=token,
#                     secret_key=settings.JWT_SECRET,
#                     expected_issuer=settings.JWT_ISSUER,
#                 )
#                 request.auth_context = auth_ctx
#             except JWTValidationError:
#                 request.auth_context = None
#         else:
#             request.auth_context = None

#         return self.get_response(request)


from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from auth_app.jwt.validator import validate_jwt
from auth_app.jwt.exceptions import JWTValidationError
from django.conf import settings

import jwt
from django.conf import settings

def validate_ws_token(token):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,  # 🔥 MISMA CLAVE QUE CENTRAL
            algorithms=["HS256"],
        )
        return payload
    except jwt.PyJWTError:
        return None

User = get_user_model()

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get("wire_access_token")

        if token:
            try:
                auth_ctx = validate_ws_token(
                    token=token,
                    secret_key=settings.JWT_SECRET,
                    expected_issuer=settings.JWT_ISSUER,
                )

                # 🔥 AQUÍ ESTÁ LA CLAVE
                user = User.objects.get(id=auth_ctx["user_id"])
                request.user = user
                request.auth_context = auth_ctx

            except Exception:
                request.user = AnonymousUser()
                request.auth_context = None
        else:
            request.user = AnonymousUser()
            request.auth_context = None

        return self.get_response(request)