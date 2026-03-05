import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

User = get_user_model()

class CookieJWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        token = request.COOKIES.get("wire_access_token")

        print("TOKEN:", token)

        if not token:
            return None

        try:
            payload = jwt.decode(
                token,
                options={"verify_signature": False}
            )

            print("PAYLOAD:", payload)

            user_id = payload.get("user_id") or payload.get("sub")
            print("USER_ID:", user_id)

            user = User.objects.get(id=user_id)
            return (user, None)

        except Exception as e:
            print("AUTH ERROR:", str(e))
            raise AuthenticationFailed(f"Invalid JWT: {str(e)}")