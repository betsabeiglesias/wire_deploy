from django.urls import path
from .views import (
    LoginView, 
    logout_view, 
    current_user, 
    token_health_check, 
    CustomTokenRefreshView,
    get_active_modules # <-- Importamos la nueva vista
)

urlpatterns = [
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout'),
    path('check/', token_health_check, name='token-health-check'),
    path('me/', current_user, name="current-user"),
    # Nueva ruta para el descubrimiento de módulos desde el frontend
    path('modules/', get_active_modules, name="active-modules"),
]