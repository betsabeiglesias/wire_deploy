from django.db import models
from django.conf import settings
import uuid

class MyLayOutsTitle(models.Model):
    name = models.CharField(max_length=200)
    views_data = models.JSONField(null=True, blank=True, help_text="JSON containing multiple views for multi-window applications")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)

    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order'] # Esto hace que Django los devuelva siempre ordenados


    
    def __str__(self):
        return self.name


class ProjectVariable(models.Model):
 
    SOURCE_CONNECTION = "connection"
    SOURCE_LOCAL      = "local"
    SOURCE_CHOICES = [
        (SOURCE_CONNECTION, "Conexión PLC"),
        (SOURCE_LOCAL,      "Local"),
    ]
 
    DATATYPE_CHOICES = [
        ("Float",  "Float"),
        ("Bool",   "Bool"),
        ("Int",    "Int"),
        ("String", "String"),
        ("Double", "Double"),
    ]
 
    # UUID estable — los widgets lo guardan en settings.variableId
    # Nunca cambia aunque se renombre el alias o el equipo.
    variable_id = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False, db_index=True,
    )
 
    # FK al proyecto (MyLayOutsTitle)
    layout = models.ForeignKey(
        "MyLayOutsTitle",
        on_delete=models.CASCADE,
        related_name="variables",
    )
 
    name   = models.CharField(max_length=128)   # alias del usuario
    source = models.CharField(max_length=16, choices=SOURCE_CHOICES, default=SOURCE_CONNECTION)
 
    # ── Campos connection (auto-rellenados desde el tagIndex de la API) ─────────
    equipment = models.CharField(max_length=256, blank=True, default="")
    variable  = models.CharField(max_length=256, blank=True, default="")
    datatype  = models.CharField(max_length=16,  blank=True, default="Float", choices=DATATYPE_CHOICES)
    unit      = models.CharField(max_length=32,  blank=True, default="")
    address   = models.CharField(max_length=256, blank=True, default="")
    node_id   = models.CharField(max_length=256, blank=True, default="")
 
    # ── Campos local ────────────────────────────────────────────────────────────
    initial_value = models.CharField(max_length=256, blank=True, null=True, default=None)
    description   = models.CharField(max_length=512, blank=True, default="")
 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        ordering = ["name"]
        unique_together = [("layout", "name")]   # un proyecto no puede tener dos variables con el mismo alias
 
    def __str__(self):
        return f"[layout={self.layout_id}] {self.name} ({self.source})"


    








