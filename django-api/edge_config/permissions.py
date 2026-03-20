from rest_framework.permissions import BasePermission
from django.conf import settings


class EdgeApiKeyPermission(BasePermission):

    def has_permission(self, request, view):

        key = request.headers.get("X-EDGE-KEY")

        return key and key == settings.EDGE_API_KEY