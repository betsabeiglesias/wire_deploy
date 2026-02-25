# auth_app/jwt/validator.py

import time
import jwt
import os
import json
from .context import AuthContext
from .exceptions import (
    MissingTokenError,
    InvalidTokenError,
    ExpiredTokenError,
    MalformedTokenError,
    InvalidIssuerError,
)

ALLOWED_ALGORITHMS = ["HS256"]

# def validate_jwt(token, secret_key, expected_issuer) -> AuthContext:
def validate_jwt(token, secret_key) -> AuthContext:
    """
    Validates a JWT and returns an AuthContext if valid.

    :param token: JWT token string
    :param secret_key: Secret key used to sign the token
    :raises JWTValidationError subclasses
    :return: AuthContext
    """

    # 1️⃣ Token presence
    if not token:
        raise MissingTokenError("JWT token is missing")
    

    # 🔍 DEBUG: decode WITHOUT signature verification
    debug_payload = jwt.decode(
        token,
        options={
            "verify_signature": False,
            "verify_exp": False,
        },
    )
    print("🧪 JWT DEBUG PAYLOAD (NO VERIFY):")
    print(json.dumps(debug_payload, indent=2))

    # 2️⃣ Decode & verify signature
    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=ALLOWED_ALGORITHMS,
            options={
                "verify_exp": False,  # we validate exp manually
            },
        )
    except jwt.PyJWTError as exc:
        raise InvalidTokenError("Invalid JWT token") from exc
    except jwt.InvalidTokenError as exc:
        raise InvalidTokenError(f"Invalid JWT token: {str(exc)}") from exc
    except Exception as exc:
        print(f"❌ Unexpected JWT error: {type(exc).__name__}: {exc}")
        raise InvalidTokenError(f"JWT validation failed: {exc}") from exc

    # RETOMAR HOMOGENEIZANDO TOKENS
    # # 3️⃣ Issuer validation
    # if payload.get("iss") != expected_issuer:
    #     raise InvalidIssuerError("Invalid token issuer")

    # 4️⃣ Required claims
    required_claims = [
        "user_id",
        "client_id",
        "roles",
        "scopes",
        "iat",
        "exp",
    ]

    for claim in required_claims:
        if claim not in payload:
            raise MalformedTokenError(f"Missing claim: {claim}")

    
    # # 5️⃣ Type validation
    if not isinstance(payload["roles"], list):
        raise MalformedTokenError("roles must be a list")

    if not isinstance(payload["scopes"], list):
        raise MalformedTokenError("scopes must be a list")

    # 6️⃣ Expiration check
    now = int(time.time())
    if now > int(payload["exp"]):
        raise ExpiredTokenError("JWT token has expired")

    # 7️⃣ Build AuthContext
    return AuthContext(
        user_id=str(payload["user_id"]),
        client_id=str(payload["client_id"]),
        roles=payload["roles"],
        scopes=payload["scopes"],
        issued_at=int(payload["iat"]),
        expires_at=int(payload["exp"]),
    )
