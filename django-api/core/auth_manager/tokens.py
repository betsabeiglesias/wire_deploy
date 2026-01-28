from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

class CustomRefreshToken(RefreshToken):

    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)

        # Claims globales del sistema
        token['iss'] = settings.JWT_ISSUER
        token['user_id'] = user.id  # redundante pero explícito

        return token
