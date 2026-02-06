# auth_app/authz.py
from django.http import JsonResponse
from functools import wraps


# ========= Helpers internos =========

def _auth_required(request):
    if not hasattr(request, "auth_context") or request.auth_context is None:
        return JsonResponse(
            {"error": "authentication_required"},
            status=401
        )
    return None


def _require_scope(request, scope: str):
    ctx = request.auth_context
    if not ctx.has_scope(scope):
        return JsonResponse(
            {"error": "insufficient_scope"},
            status=403
        )
    return None


def _require_role(request, role: str):
    ctx = request.auth_context
    if not ctx.has_role(role):
        return JsonResponse(
            {"error": "insufficient_role"},
            status=403
        )
    return None

# ========= Decoradores públicos =========

def require_auth(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        error = _auth_required(request)
        if error:
            return error
        return view_func(request, *args, **kwargs)
    return wrapper


def require_scope(scope: str):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            error = _auth_required(request)
            if error:
                return error

            error = _require_scope(request, scope)
            if error:
                return error

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_role(role: str):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            error = _auth_required(request)
            if error:
                return error

            error = _require_role(request, role)
            if error:
                return error

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
