from django.shortcuts import render
from django.http import JsonResponse

def auth_debug_view(request):
    ctx = getattr(request, "auth_context", None)

    if ctx is None:
        return JsonResponse(
            {"authenticated": False},
            status=401
        )

    return JsonResponse(
        {
            "authenticated": True,
            "user_id": ctx.user_id,
            "client_id": ctx.client_id,
            "roles": ctx.roles,
            "scopes": ctx.scopes,
        }
    )

