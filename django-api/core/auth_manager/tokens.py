from rest_framework_simplejwt.tokens import RefreshToken

class CustomRefreshToken(RefreshToken):
    """
    Token personalizado. Mantenemos la lógica al mínimo aquí 
    para que la View se encargue de inyectar los datos.
    """
    @classmethod
    def for_user(cls, user):
        return super().for_user(user)