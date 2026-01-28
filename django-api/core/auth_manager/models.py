from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Client(models.Model):
    """Representa el Tenant (Empresa/Instalación)"""
    id = models.SlugField(primary_key=True, help_text="ID único, ej: 'cliente-a'")
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name

class Role(models.Model):
    """Roles industriales con scopes asociados"""
    code = models.CharField(max_length=32, primary_key=True) # ej: 'operator'
    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    scopes = models.JSONField(default=list, null=True, blank=True) # ej: ["realtime:read", "config:write"]

    def __str__(self):
        return self.name

class ClientMembership(models.Model):
    """El corazón: Vincula Usuario + Cliente + Rol"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='members')
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "client")

    def __str__(self):
        # 🛡️ CORRECCIÓN: Manejamos el caso donde el rol sea None
        role_display = self.role.code if self.role else "Sin Rol"
        return f"{self.user.username} @ {self.client_id} ({role_display})"

class Plant(models.Model):
    """Preparada para el futuro: Varias plantas por cliente"""
    id = models.SlugField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='plants')
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.client_id} - {self.name}"