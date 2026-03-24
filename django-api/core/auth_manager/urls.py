
from django.urls import path
from .views import LoginView, logout_view, current_user, token_health_check, CustomTokenRefreshView 

urlpatterns = [
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'), # <-- Cambia esta línea
    path('logout/', logout_view, name='logout'),
    path('check/', token_health_check, name='token-health-check'),
    path('me/', current_user, name="current-user"),
]


 # Estas rutas se convertirán en:
    # /api/auth/token/
    # /api/auth/token/refresh/
    # ... etc.

