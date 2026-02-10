# auth_app/jwt/exceptions.py

class JWTValidationError(Exception):
    """Base class for JWT validation errors."""
    pass


class MissingTokenError(JWTValidationError):
    """No token provided."""
    pass


class InvalidTokenError(JWTValidationError):
    """Token signature or decoding is invalid."""
    pass


class ExpiredTokenError(JWTValidationError):
    """Token is expired."""
    pass


class MalformedTokenError(JWTValidationError):
    """Token structure or required claims are invalid."""
    pass


class InvalidIssuerError(JWTValidationError):
    """Token issuer is not trusted."""
    pass
