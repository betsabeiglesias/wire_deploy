
from rest_framework.permissions import BasePermission


class IsAuthenticatedAndActive(BasePermission):
    """
    Permite acceso solo a usuarios autenticados y activos
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_active
        )
