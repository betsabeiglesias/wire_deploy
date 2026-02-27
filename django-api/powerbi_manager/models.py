from django.db import models
from django.conf import settings

class MyPowerBi(models.Model):
    client = models.ForeignKey('auth_manager.Client', on_delete=models.CASCADE, related_name='dashboards') # <-- CLAVE
    name = models.CharField(max_length=200)
    embed_url = models.CharField(max_length=700)
    description = models.CharField(max_length=200)
    user = models.ManyToManyField(settings.AUTH_USER_MODEL)

    # --- NUEVO CAMPO ---
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order'] # Orden por defecto siempre

    def __str__(self):
        return self.name
