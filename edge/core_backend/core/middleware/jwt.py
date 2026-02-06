# core/middleware/jwt.py

from django.conf import settings
from auth_app.jwt.validator import validate_jwt
from auth_app.jwt.exceptions import JWTValidationError


class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get("access_token")

        if token:
            try:
                auth_ctx = validate_jwt(
                    token=token,
                    secret_key=settings.JWT_SECRET,
                    expected_issuer=settings.JWT_ISSUER,
                )
                request.auth_context = auth_ctx
            except JWTValidationError:
                request.auth_context = None
        else:
            request.auth_context = None

        return self.get_response(request)
