# auth_app/jwt/validator.py

import time
import jwt
import os

from .context import AuthContext
from .exceptions import (
    MissingTokenError,
    InvalidTokenError,
    ExpiredTokenError,
    MalformedTokenError,
    InvalidIssuerError,
)

ALLOWED_ALGORITHMS = ["HS256"]

def validate_jwt(token, secret_key, expected_issuer) -> AuthContext:
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

    # 3️⃣ Issuer validation
    if payload.get("iss") != expected_issuer:
        raise InvalidIssuerError("Invalid token issuer")

    # 4️⃣ Required claims
    required_claims = [
        "sub",
        "client_id",
        "roles",
        "scopes",
        "iat",
        "exp",
    ]

    for claim in required_claims:
        if claim not in payload:
            raise MalformedTokenError(f"Missing claim: {claim}")

    # 5️⃣ Type validation
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
        user_id=str(payload.get("sub") or payload.get("user_id")),
        client_id=str(payload["client_id"]),
        roles=payload["roles"],
        scopes=payload["scopes"],
        issued_at=int(payload["iat"]),
        expires_at=int(payload["exp"]),
    )
