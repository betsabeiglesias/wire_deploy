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


class VariableTable(models.Model):
    """
    Agrupación de variables dentro de un proyecto (layout).
    Un layout puede tener múltiples tablas. Cada tabla tiene un nombre.
    """
    layout = models.ForeignKey(
        "MyLayOutsTitle",
        on_delete=models.CASCADE,
        related_name="variable_tables",
    )
    name       = models.CharField(max_length=128)
    order      = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        app_label    = "scada_manager"
        ordering     = ["order", "name"]
        unique_together = [("layout", "name")]
 
    def __str__(self):
        return f"[layout={self.layout_id}] {self.name}"
 
 
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
 
    variable_id = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False, db_index=True,
    )
 
    # FK a la tabla que agrupa esta variable
    table = models.ForeignKey(
        VariableTable,
        on_delete=models.CASCADE,
        related_name="variables",
        null=True,
    )
 
    name   = models.CharField(max_length=128)
    source = models.CharField(max_length=16, choices=SOURCE_CHOICES, default=SOURCE_CONNECTION)
 
    # connection fields
    equipment = models.CharField(max_length=256, blank=True, default="")
    equipment_id = models.CharField(max_length=512, blank=True, default="")
    variable  = models.CharField(max_length=256, blank=True, default="")
    datatype  = models.CharField(max_length=16,  blank=True, default="Float", choices=DATATYPE_CHOICES)
    unit      = models.CharField(max_length=32,  blank=True, default="")
    address   = models.CharField(max_length=256, blank=True, default="")
    node_id   = models.CharField(max_length=256, blank=True, default="")
 
    # local fields
    initial_value = models.CharField(max_length=256, blank=True, null=True, default=None)
    description   = models.CharField(max_length=512, blank=True, default="")
 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        app_label   = "scada_manager"
        ordering    = ["name"]
        unique_together = [("table", "name")]
 
    def __str__(self):
        return f"[table={self.table_id}] {self.name} ({self.source})"