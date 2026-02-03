from django.urls import path
from .views import LoginView, logout_view, current_user, token_health_check
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout'),
    path('check/', token_health_check, name='token-health-check'),
    path('me/', current_user, name="current-user"),
]


